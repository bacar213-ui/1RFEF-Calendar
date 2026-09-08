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
    "-de-primera-federacion-temporada-202627"
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

Antes de esta instrucción te he mostrado varias imágenes de referencia, cada una con
el nombre del canal de televisión al que corresponde. Son los logos que aparecen dentro
de las etiquetas naranjas de "dónde ver el partido" en las imágenes de horarios de la RFEF.

Analiza ahora la imagen del calendario de partidos de la 1ª RFEF (Primera Federación).
Cada fila tiene, a la derecha, una etiqueta naranja que indica dónde se retransmite ese partido.

Reglas para identificar el campo "canal" de cada partido:
- Si la etiqueta solo dice "CANAL LINEAL" sin ningún logo adicional en la esquina → usa "Canal Lineal".
- Si la etiqueta "CANAL LINEAL" lleva además un logo pequeño en la esquina que coincide con
  alguna de las imágenes de referencia (Aragón TV, La 7, Esport3 o A Galega) → usa el nombre
  de ese canal regional en vez de "Canal Lineal" (ejemplo: "Aragón TV").
- Si aparece el logo de FootballClub y/o FanPlay TV → inclúyelos tal cual.
- Un partido puede tener varios operadores a la vez: sepáralos por coma
  (ejemplo: "FootballClub, FanPlay TV").
- El color del logo (blanco o negro/oscuro) es solo una variante visual del mismo canal,
  no afecta al nombre que debes usar.
- Si no consigues identificar con seguridad el canal de un partido, deja el campo como "".

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
      "visitante": "nombre exacto del equipo visitante",
      "canal": "Canal Lineal"
    }
  ]
}

Notas:
- fecha: formato DD/MM/AAAA
- hora: formato HH:MM en 24h
- Copia los nombres de los equipos exactamente como aparecen en la imagen
- El grupo aparece en el encabezado (ej: GRUPO 1 / J 01)
"""

LOGOS_REFERENCIA = [
    ("footballclub_icono.png", "FootballClub"),
    ("footballclub_texto.png", "FootballClub"),
    ("fanplay_tv.png", "FanPlay TV"),
    ("a_galega_blanco.png", "A Galega"),
    ("esport3_negro.png", "Esport3"),
    ("aragon_tv_blanco.png", "Aragón TV"),
    ("la7_negro.png", "La 7"),
    ("aragon_tv_negro.png", "Aragón TV"),
    ("esport3_blanco.png", "Esport3"),
    ("a_galega_negro.png", "A Galega"),
    ("canal_lineal.png", "Canal Lineal (sin logo adicional)"),
]

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
    """Intenta extraer automáticamente las URLs de imágenes del HTML.
    No asume en qué atributo HTML está la URL (src, data-src, srcset, lazy-load
    propietario, JSON embebido, etc.): busca el patrón de URL en cualquier parte
    del documento para no depender de la plantilla exacta que use la RFEF."""
    r = requests.get(url, headers=HEADERS, timeout=15)
    r.raise_for_status()
    html = r.text

    print(f"  [debug] longitud HTML recibido: {len(html)} caracteres")
    print(f"  [debug] contiene 'sites/default/files': {'sites/default/files' in html}")
    print(f"  [debug] contiene 'jornada': {'jornada' in html.lower()}")
    print(f"  [debug] contiene 'captcha'/'cloudflare'/'blocked': "
          f"{'captcha' in html.lower() or 'cloudflare' in html.lower() or 'blocked' in html.lower() or 'acceso denegado' in html.lower()}")
    print(f"  [debug] primeros 300 caracteres: {html[:300]!r}")

    patron = r'(https://rfef\.es/sites/default/files/[^\s"\'<>?)]+\.(?:jpeg|jpg|png|webp))'
    urls = re.findall(patron, html, re.IGNORECASE)

    # Excluir imágenes de UI, sponsors, miniaturas de "noticias relacionadas", etc.
    excluir = ['theme/', 'sponsors/', 'ico/', 'header-logo', 'jornada_0', 'noticias_listado', 'styles/']
    urls = [u for u in urls if not any(x in u for x in excluir)]

    # Eliminar duplicados
    vistas = set()
    resultado = []
    for u in urls:
        if u not in vistas:
            vistas.add(u)
            resultado.append(u)

    return resultado


def cargar_logos_referencia() -> list:
    """Carga las imágenes de logos de canales (carpeta logos/) como partes
    de referencia visual para que Gemini pueda reconocerlos en el calendario."""
    directorio = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logos")
    partes = []
    for nombre_archivo, nombre_canal in LOGOS_REFERENCIA:
        ruta = os.path.join(directorio, nombre_archivo)
        if not os.path.exists(ruta):
            continue
        with open(ruta, "rb") as f:
            contenido = f.read()
        b64 = base64.standard_b64encode(contenido).decode()
        partes.append({"text": f"Logo de referencia: {nombre_canal}"})
        partes.append({"inline_data": {"mime_type": "image/png", "data": b64}})
    return partes


def imagen_a_partidos_gemini(url_imagen: str) -> dict:
    """Descarga la imagen y la manda a Google Gemini para extraer partidos."""
    contenido = requests.get(url_imagen, headers=HEADERS, timeout=20).content

    mime = "image/jpeg"
    if url_imagen.lower().endswith(".webp"):
        mime = "image/webp"
    elif url_imagen.lower().endswith(".png"):
        mime = "image/png"

    imagen_b64 = base64.standard_b64encode(contenido).decode()

    GEMINI_KEY = os.environ["GEMINI_API_KEY"].strip()
    url_api = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
    )

    partes = cargar_logos_referencia()
    partes.append({
        "inline_data": {
            "mime_type": mime,
            "data": imagen_b64,
        }
    })
    partes.append({"text": PROMPT_VISION})

    payload = {
        "contents": [{
            "parts": partes
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


def obtener_siguiente_jornada():
    """Devuelve la primera jornada que todavía tenga partidos sin confirmar
    (confirmado = false). Si todas las jornadas ya están confirmadas, devuelve None."""
    SUPABASE_URL = os.environ["SUPABASE_URL"].strip().rstrip("/")
    SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"].strip()

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/partidos"
        f"?select=jornada&confirmado=eq.false&order=jornada.asc&limit=1",
        headers=headers,
        timeout=15,
    )
    r.raise_for_status()
    datos = r.json()

    if not datos:
        return None
    return datos[0]["jornada"]


def upsert_supabase(partidos_extraidos: list) -> None:
    SUPABASE_URL = os.environ["SUPABASE_URL"].strip().rstrip("/")
    SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"].strip()

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
            "canal": p.get("canal"),
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
    parser.add_argument("--jornada", type=int, default=None, help="Si no se indica, se autodetecta a partir de Supabase")
    parser.add_argument("--url", type=str, help="URL de la página de horarios")
    parser.add_argument("--imagenes", type=str, help="URLs de imágenes separadas por coma")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    jornada_objetivo = args.jornada
    if jornada_objetivo is None:
        jornada_objetivo = obtener_siguiente_jornada()
        if jornada_objetivo is None:
            print("✓ Todas las jornadas ya están confirmadas. Nada que hacer.")
            sys.exit(0)
        print(f"→ No se especificó --jornada, autodetectada a partir de Supabase: {jornada_objetivo}")

    url = args.url or url_jornada(jornada_objetivo)
    print(f"\n=== Jornada {jornada_objetivo} ===")
    print(f"URL: {url}")

    if not pagina_existe(url):
        print("❌ La página no existe todavía.")
        sys.exit(0)

    print("✓ Página encontrada. Extrayendo imágenes...")

    # Si se pasan imágenes manualmente, usarlas directamente
    if args.imagenes:
        urls_imagenes = [u.strip() for u in args.imagenes.split(",")]
        print(f"  → Usando {len(urls_imagenes)} imagen(es) manual(es)")
    else:
        urls_imagenes = extraer_urls_imagenes(url)
        print(f"  → {len(urls_imagenes)} imagen(es) encontrada(s) automáticamente")

    if not urls_imagenes:
        print("❌ No se encontraron imágenes. Usa --imagenes para pasarlas manualmente.")
        sys.exit(0)

    todos_partidos = []

    for url_img in urls_imagenes:
        print(f"\nProcesando: {url_img}")
        try:
            datos = imagen_a_partidos_gemini(url_img)
            grupo = datos.get("grupo", "?")
            jornada = datos.get("jornada", jornada_objetivo)
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
                    "canal": p.get("canal", "") or None,
                })

        except Exception as e:
            print(f"  ✗ Error: {e}")

    print(f"\n→ {len(todos_partidos)} partidos listos para Supabase")

    if args.dry_run:
        print("\n[DRY RUN] Datos extraídos:")
        for p in todos_partidos:
            print(f"  j{p['jornada']} {p['fecha']} {p['hora']} | {p['local_id']} vs {p['visitante_id']} | 📺 {p.get('canal') or '(sin identificar)'}")
    else:
        print("\nActualizando Supabase...")
        upsert_supabase(todos_partidos)
        print("\n✅ Hecho.")


if __name__ == "__main__":
    main()
