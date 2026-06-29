"""
scraper.py — Extrae horarios de la 1ª RFEF desde la web de la RFEF
             y actualiza Supabase automáticamente.
             Usa Google Gemini para leer las imágenes (API gratuita).
"""

import os
import re
import sys
import json
import base64
import argparse
import requests

# ── Configuración ─────────────────────────────────────────────────────────────

URL_PATRON = (
    "https://rfef.es/es/noticias/"
    "horarios-y-televisiones-de-la-jornada-{N}"
    "-de-primera-federacion-versus-e-learning"
)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "es-ES,es;q=0.9",
}

PROMPT_VISION = """Eres un extractor de datos deportivos especializado en fútbol español.

Analiza esta imagen que muestra el calendario de partidos de la 1ª RFEF (Primera Federación).

Extrae TODOS los partidos visibles y devuelve ÚNICAMENTE un objeto JSON válido,
sin texto adicional, sin markdown, sin bloques de código, sin explicaciones.

Formato exacto:
{
  "grupo": "Grupo 1",
  "jornada": 1,
  "temporada": "2026/27",
  "partidos": [
    {
      "fecha": "29/08/2026",
      "hora": "21:30",
      "local": "nombre exacto del equipo local",
      "visitante": "nombre exacto del equipo visitante"
    }
  ]
}

Notas:
- fecha: formato DD/MM/AAAA
- hora: formato HH:MM en 24h
- Copia los nombres de los equipos exactamente como aparecen en la imagen
- El grupo aparece en el encabezado (ej: GRUPO 1 / J 01)
"""

NOMBRE_A_ID = {
    "ad mérida": "merida",
    "arenas club": "arenas",
    "athletic club 'b'": "athleticb",
    "athletic club b": "athleticb",
    "barakaldo cf": "barakaldo",
    "cd coria": "coria",
    "cd extremadura": "extremadura",
    "cd lugo": "lugo",
    "cd mirandés": "mirandes",
    "cp cacereño": "cacereno",
    "cyd leonesa": "leonesa",
    "cultural y deportiva leonesa": "leonesa",
    "pontevedra cf": "pontevedra",
    "racing club ferrol": "ferrol",
    "rc deportivo fabril": "fabril",
    "real avilés industrial": "aviles",
    "real unión club": "realunion",
    "sd ponferradina": "ponferradina",
    "ud logroñés": "logrono",
    "ud ourense": "ourense",
    "unionistas de salamanca cf": "unionistas",
    "zamora cf": "zamora",
    "águilas fc": "aguilas",
    "ad alcorcón": "alcorcon",
    "algeciras cf": "algeciras",
    "antequera cf": "antequera",
    "atlético madrileño": "atmadrileno",
    "fc cartagena": "cartagena",
    "ce europa": "europa",
    "hércules cf": "hercules",
    "hércules de alicante cf": "hercules",
    "sd huesca": "huesca",
    "ud ibiza": "ibiza",
    "real jaén cf": "jaen",
    "cf rayo majadahonda": "majadahonda",
    "gimnàstic de tarragona": "nastic",
    "real madrid castilla": "castilla",
    "real murcia cf": "murcia",
    "real zaragoza": "zaragoza",
    "ue sant andreu": "standreu",
    "cd teruel": "teruel",
    "juventud de torremolinos cf": "torremolinos",
    'villarreal cf "b"': "villarreal",
    "villarreal cf b": "villarreal",
    # Equipos 25/26 que no están en 26/27
    "ce sabadell fc": None,
    "cd eldense": None,
    "sd tarazona": None,
    "sevilla atlético": None,
    "betis deportivo balompié": None,
    "atlético sanluqueño cf": None,
    "marbella fc": None,
    "rc celta fortuna": None,
    "ca osasuna \"b\"": None,
    "cf talavera de la reina": None,
    "cd arenteiro": None,
    "cd tenerife": None,
    "athletic club \"b\"": "athleticb",
}


def nombre_a_id(nombre: str):
    return NOMBRE_A_ID.get(nombre.lower().strip())


def url_jornada(numero: int) -> str:
    return URL_PATRON.replace("{N}", str(numero))


def pagina_existe(url: str) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        return r.status_code == 200
    except requests.RequestException:
        return False


def extraer_urls_imagenes(url: str) -> list:
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    html = r.text

    patron = r'https://rfef\.es/sites/default/files/(?!styles/)[^\s"\'<>]+\.(?:jpeg|jpg|png|webp)'
    urls = re.findall(patron, html, re.IGNORECASE)

    excluir = ['theme/', 'sponsors/', 'ico/', 'header-logo']
    urls = [u for u in urls if not any(x in u for x in excluir)]

    vistas = set()
    resultado = []
    for u in urls:
        if u not in vistas:
            vistas.add(u)
            resultado.append(u)

    return resultado


def imagen_a_partidos_gemini(url_imagen: str) -> dict:
    """Descarga la imagen y la manda a Google Gemini para extraer partidos."""
    contenido = requests.get(url_imagen, headers=HEADERS, timeout=20).content

    mime = "image/jpeg"
    if url_imagen.lower().endswith(".webp"):
        mime = "image/webp"
    elif url_imagen.lower().endswith(".png"):
        mime = "image/png"

    imagen_b64 = base64.standard_b64encode(contenido).decode()

    GEMINI_KEY = os.environ["GEMINI_API_KEY"]
    url_api = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
    )

    payload = {
        "contents": [{
            "parts": [
                {
                    "inline_data": {
                        "mime_type": mime,
                        "data": imagen_b64,
                    }
                },
                {"text": PROMPT_VISION}
            ]
        }],
        "generationConfig": {
            "temperature": 0,
            "maxOutputTokens": 2000,
        }
    }

    r = requests.post(url_api, json=payload, timeout=30)
    r.raise_for_status()

    texto = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    texto = texto.replace("```json", "").replace("```", "").strip()
    return json.loads(texto)


def upsert_supabase(partidos_extraidos: list) -> None:
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    for p in partidos_extraidos:
        partido_id = f"j{p['jornada']:02d}-{p['local_id']}-{p['visitante_id']}"

        payload = {
            "id": partido_id,
            "jornada": p["jornada"],
            "equipo_local_id": p["local_id"],
            "equipo_visitante_id": p["visitante_id"],
            "fecha": p["fecha"],
            "hora": p["hora"] + ":00",
            "confirmado": True,
        }

        r = requests.post(
            f"{SUPABASE_URL}/rest/v1/partidos",
            headers=headers,
            json=payload,
        )

        if r.status_code in (200, 201):
            print(f"  ✓ j{p['jornada']} {p['local_id']} vs {p['visitante_id']}")
        else:
            print(f"  ✗ Error {r.status_code}: {r.text}")


def fecha_iso(fecha_str: str) -> str:
    d, m, a = fecha_str.strip().split("/")
    return f"{a}-{m.zfill(2)}-{d.zfill(2)}"


def main():
    parser = argparse.ArgumentParser(description="Scraper horarios 1ª RFEF")
    parser.add_argument("--jornada", type=int, required=True)
    parser.add_argument("--url", type=str)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    url = args.url or url_jornada(args.jornada)
    print(f"\n=== Jornada {args.jornada} ===")
    print(f"URL: {url}")

    if not pagina_existe(url):
        print("❌ La página no existe todavía.")
        sys.exit(0)

    print("✓ Página encontrada. Extrayendo imágenes...")
    urls_imagenes = extraer_urls_imagenes(url)
    print(f"  → {len(urls_imagenes)} imagen(es) encontrada(s)")

    todos_partidos = []

    for url_img in urls_imagenes:
        print(f"\nProcesando: {url_img}")
        try:
            datos = imagen_a_partidos_gemini(url_img)
            grupo = datos.get("grupo", "?")
            jornada = datos.get("jornada", args.jornada)
            print(f"  → {grupo}: {len(datos.get('partidos', []))} partidos extraídos")

            for p in datos.get("partidos", []):
                local_id = nombre_a_id(p["local"])
                visitante_id = nombre_a_id(p["visitante"])

                if local_id is None:
                    print(f"  ⚠️  No encontrado en 26/27: '{p['local']}' → ignorado")
                    continue
                if visitante_id is None:
                    print(f"  ⚠️  No encontrado en 26/27: '{p['visitante']}' → ignorado")
                    continue

                todos_partidos.append({
                    "jornada": jornada,
                    "fecha": fecha_iso(p["fecha"]),
                    "hora": p["hora"],
                    "local_id": local_id,
                    "visitante_id": visitante_id,
                })

        except Exception as e:
            print(f"  ✗ Error: {e}")

    print(f"\n→ {len(todos_partidos)} partidos listos para Supabase")

    if args.dry_run:
        print("\n[DRY RUN] Datos extraídos:")
        for p in todos_partidos:
            print(f"  j{p['jornada']} {p['fecha']} {p['hora']} | {p['local_id']} vs {p['visitante_id']}")
    else:
        print("\nActualizando Supabase...")
        upsert_supabase(todos_partidos)
        print("\n✅ Hecho.")


if __name__ == "__main__":
    main()
