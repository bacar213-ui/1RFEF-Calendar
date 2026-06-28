export default async function handler(req, res) {
  const { equipo } = req.query;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  const equipoRes = await fetch(
    `${SUPABASE_URL}/rest/v1/equipos?id=eq.${equipo}&select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const equipos = await equipoRes.json();

  if (!equipos.length) {
    return res.status(404).json({ error: 'Equipo no encontrado' });
  }

  const equipoData = equipos[0];

  const partidosRes = await fetch(
    `${SUPABASE_URL}/rest/v1/partidos?or=(equipo_local_id.eq.${equipo},equipo_visitante_id.eq.${equipo})&select=*&order=jornada.asc`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const partidos = await partidosRes.json();

  const equiposRes = await fetch(
    `${SUPABASE_URL}/rest/v1/equipos?select=*`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
  );
  const todosEquipos = await equiposRes.json();
  const equiposMap = {};
  todosEquipos.forEach(e => { equiposMap[e.id] = e; });

  const eventos = partidos.map(partido => {
    const local = equiposMap[partido.equipo_local_id];
    const visitante = equiposMap[partido.equipo_visitante_id];
    if (!local || !visitante) return '';

    const fecha = partido.fecha || nextSunday(partido.jornada);
    const hora = partido.hora || '12:00:00';
    const [h, m] = hora.split(':');
    const dtStart = formatIcal(fecha, parseInt(h), parseInt(m));
    const dtEnd = formatIcal(fecha, parseInt(h) + 2, parseInt(m));
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(local.estadio + ', ' + local.ciudad)}`;
    const descripcion = [
      `${local.nombre} - ${visitante.nombre}`,
      `Jornada ${partido.jornada} · Temporada 2026/27`,
      `1ª RFEF Grupo 2`,
      `${local.estadio}`,
      mapsUrl
    ].join('\\n');

    return [
      'BEGIN:VEVENT',
      `UID:rfef1g2-j${partido.jornada}-${partido.equipo_local_id}-${partido.equipo_visitante_id}@rfef1grupo2`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${local.nombre} - ${visitante.nombre}`,
      `LOCATION:${local.estadio}, ${local.ciudad}`,
      `DESCRIPTION:${descripcion}`,
      `URL:${mapsUrl}`,
      'END:VEVENT'
    ].join('\r\n');
  }).filter(Boolean);

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RFEF1 Grupo2//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${equipoData.nombre} · 1ª RFEF 26/27`,
    'X-WR-TIMEZONE:Europe/Madrid',
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...eventos,
    'END:VCALENDAR'
  ].join('\r\n');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${equipo}.ics"`);
  res.setHeader('Cache-Control', 'public, max-age=21600');
  res.status(200).send(ical);
}

function nextSunday(jornada) {
  const inicio = new Date('2026-09-07');
  const fecha = new Date(inicio);
  fecha.setDate(fecha.getDate() + (jornada - 1) * 7);
  const dow = fecha.getDay();
  fecha.setDate(fecha.getDate() + (7 - dow) % 7);
  return fecha.toISOString().split('T')[0];
}

function formatIcal(fechaStr, hora, minuto) {
  const d = new Date(fechaStr + 'T00:00:00');
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(hora)}${pad(minuto)}00`;
}
