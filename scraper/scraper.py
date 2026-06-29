"""
scraper.py — Extrae horarios de la 1ª RFEF desde la web de la RFEF
             y actualiza Supabase automáticamente.

Uso:
    python scraper.py --jornada 1
    python scraper.py --jornada 1 --url https://rfef.es/es/noticias/...
"""

import os
import re
import sys
import json
import base64
import argparse
import requests
import anthropic

# ── Configuración ─────────────────────────────────────────────────────────────

# Patrón de URL — ajustar cuando se conozca el slug de la 26/27
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
- fecha: formato DD/MM/AAAA (si solo aparece día y mes, deduce el año de la temporada)
- hora: formato HH:MM en 24h
- Copia los nombres de los equipos exactamente como aparecen en la imagen
- El grupo aparece en el encabezado (ej: GRUPO 1 / J 01)
"""

# ── Mapeo de nombres de imagen a IDs de Supabase ─────────────────────────────
# Cuando la IA lee un nombre de la imagen, lo normalizamos para buscar en Supabase.
# Añadir aquí variaciones conocidas.

NOMBRE_A_ID = {
    # Grupo 1
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
    # Grupo 2
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
    # Equipos de la 25/26 que ya no están en la 26/27
    "ce sabadell fc": None,
    "cd eldense": None,
    "sd tarazona": None,
    "sevilla atlético": None,
    "betis deportivo balompié": None,
    "antequera cf": "antequera",
    "atlético sanluqueño cf": None,
    "marbella fc": None,
    "rc celta fortuna": None,
    "ad mérida": "merida",
    "ca osasuna \"b\"": None,
    "cf talavera de la reina": None,
    "cd arenteiro": None,
    "cd tenerife": None,
    "athletic club \"b\"": "athleticb",
    "real avilés industrial": "aviles",
}


def nombre_a_id(nombre: str) -> str | None:
    """Convierte el nombre leído por la IA al ID de Supabase."""
    return NOMBRE_A_ID.get(nombre.lower().strip())


# ── Paso 1: Obtener URL de la jornada ────────────────────────────────────────

def url_jornada(numero: int) -> str:
    return URL_PATRON.replace("{N}", str(numero))


def pagina_existe(url: str) -> bool:
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        return r.status_code == 200
    except requests.RequestException:
        return False


# ── Paso 2: Extraer URLs de imágenes ─────────────────────────────────────────

def extraer_urls_imagenes(url: str) -> list[str]:
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    html = r.text

    patron = (
        r'<img[^>]+src="(https://rfef\.es/sites/default/files/'
        r'(?!styles/large/public/theme|sponsors)[^"]+\.'
        r'(?:jpeg|jpg|png|webp)[^"]*)"'
    )
    urls = re.findall(patron, html, re.IGNORECASE)

    # Eliminar duplicados manteniendo orden
    vistas = set()
    resultado = []
    for u in urls:
        if u not in vistas:
            vistas.add(u)
            resultado.append(u)

    return resultado


# ── Paso 3: Claude Vision ─────────────────────────────────────────────────────

def imagen_a_partidos(url_imagen: str) -> dict:
    """Descarga una imagen y extrae los partidos con Claude Vision."""
    contenido = requests.get(url_imagen, headers=HEADERS, timeout=20).content

    mime = "image/jpeg"
    if url_imagen.lower().endswith(".webp"):
        mime = "image/webp"
    elif url_imagen.lower().endswith(".png"):
        mime = "image/png"

    cliente = anthropic.Anthropic()
    mensaje = cliente.messages.create(
        model="claude-opus-4-6",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": mime,
                        "data": base64.standard_b64encode(contenido).decode(),
                    }
                },
                {"type": "text", "text": PROMPT_VISION}
            ]
        }]
    )

    texto = mensaje.content[0].text.strip()
    texto = texto.replace("```json", "").replace("```", "").strip()
    return json.loads(texto)


# ── Paso 4: UPSERT en Supabase ────────────────────────────────────────────────

def upsert_supabase(partidos_extraidos: list[dict]) -> None:
    """
    Recibe lista de partidos extraídos y actualiza Supabase.
    Cada item tiene: { jornada, fecha, hora, local_id, visitante_id }
    """
    SUPABASE_URL = os.environ["SUPABASE_URL"]
    SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    for p in partidos_extraidos:
        # El ID del partido sigue el mismo patrón que ya tienes en Supabase
        partido_id = f"j{p['jornada']:02d}-{p['local_id']}-{p['visitante_id']}"

        payload = {
            "id": partido_id,
            "jornada": p["jornada"],
            "equipo_local_id": p["local_id"],
            "equipo_visitante_id": p["visitante_id"],
            "fecha": p["fecha"],      # formato YYYY-MM-DD
            "hora": p["hora"] + ":00",  # formato HH:MM:00
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


# ── Utilidades ────────────────────────────────────────────────────────────────

def fecha_iso(fecha_str: str) -> str:
    """Convierte DD/MM/AAAA a YYYY-MM-DD."""
    d, m, a = fecha_str.strip().split("/")
    return f"{a}-{m.zfill(2)}-{d.zfill(2)}"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Scraper horarios 1ª RFEF")
    parser.add_argument("--jornada", type=int, required=True, help="Número de jornada")
    parser.add_argument("--url", type=str, help="URL manual (opcional)")
    parser.add_argument("--dry-run", action="store_true", help="Solo mostrar, no escribir en Supabase")
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
            datos = imagen_a_partidos(url_img)
            grupo = datos.get("grupo", "?")
            jornada = datos.get("jornada", args.jornada)
            print(f"  → {grupo}: {len(datos.get('partidos', []))} partidos extraídos")

            for p in datos.get("partidos", []):
                local_id = nombre_a_id(p["local"])
                visitante_id = nombre_a_id(p["visitante"])

                if local_id is None:
                    print(f"  ⚠️  Equipo no encontrado en 26/27: '{p['local']}' → ignorado")
                    continue
                if visitante_id is None:
                    print(f"  ⚠️  Equipo no encontrado en 26/27: '{p['visitante']}' → ignorado")
                    continue

                todos_partidos.append({
                    "jornada": jornada,
                    "fecha": fecha_iso(p["fecha"]),
                    "hora": p["hora"],
                    "local_id": local_id,
                    "visitante_id": visitante_id,
                })

        except Exception as e:
            print(f"  ✗ Error procesando imagen: {e}")

    print(f"\n→ {len(todos_partidos)} partidos listos para Supabase")

    if args.dry_run:
        print("\n[DRY RUN] No se escribe en Supabase. Datos:")
        for p in todos_partidos:
            print(f"  j{p['jornada']} {p['fecha']} {p['hora']} | {p['local_id']} vs {p['visitante_id']}")
    else:
        print("\nActualizando Supabase...")
        upsert_supabase(todos_partidos)
        print("\n✅ Hecho.")


if __name__ == "__main__":
    main()
