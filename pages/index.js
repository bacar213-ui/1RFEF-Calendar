import { useState } from 'react';

const EQUIPOS = [
  { id: 'alcorcon', nombre: 'AD Alcorcón' },
  { id: 'aguilas', nombre: 'Águilas FC' },
  { id: 'algeciras', nombre: 'Algeciras CF' },
  { id: 'antequera', nombre: 'Antequera CCF' },
  { id: 'atleticomadrileno', nombre: 'Atlético Madrileño' },
  { id: 'teruel', nombre: 'CD Teruel' },
  { id: 'europa', nombre: 'CE Europa' },
  { id: 'majadahonda', nombre: 'CF Rayo Majadahonda' },
  { id: 'cartagena', nombre: 'FC Cartagena' },
  { id: 'nastic', nombre: 'Gimnàstic de Tarragona' },
  { id: 'hercules', nombre: 'Hércules CF' },
  { id: 'torremolinos', nombre: 'Juventud de Torremolinos CF' },
  { id: 'jaen', nombre: 'Real Jaén CF' },
  { id: 'rmcastilla', nombre: 'Real Madrid Castilla' },
  { id: 'rmurcia', nombre: 'Real Murcia CF' },
  { id: 'zaragoza', nombre: 'Real Zaragoza' },
  { id: 'huesca', nombre: 'SD Huesca' },
  { id: 'ibiza', nombre: 'UD Ibiza' },
  { id: 'standreu', nombre: 'UE Sant Andreu' },
  { id: 'villarreal', nombre: 'Villarreal CF B' },
];

export default function Home() {
  const [seleccionado, setSeleccionado] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const icalUrl = seleccionado ? `${baseUrl}/api/ical/${seleccionado.id}` : '';
  const webcalUrl = icalUrl.replace('https://', 'webcal://').replace('http://', 'webcal://');
  const googleUrl = `https://calendar.google.com/calendar/r/settings/addbyurl?url=${encodeURIComponent(icalUrl)}`;

  const copiar = () => {
    navigator.clipboard.writeText(icalUrl).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 640, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ background: '#1a1a2e', borderRadius: 12, padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          1ª RFEF · Grupo 2 · Temporada 2026/27
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px' }}>Tu equipo en tu calendario</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
          Suscríbete a los partidos de tu equipo. Cuando cambien los horarios, tu calendario se actualiza solo.
        </p>
      </div>

      {!seleccionado ? (
        <>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
            Elige tu equipo
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {EQUIPOS.map(e => (
              <button
                key={e.id}
                onClick={() => setSeleccionado(e)}
                style={{
                  background: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s'
                }}
                onMouseOver={ev => ev.currentTarget.style.borderColor = '#999'}
                onMouseOut={ev => ev.currentTarget.style.borderColor = '#e5e5e5'}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 4px' }}>{seleccionado.nombre}</h2>
          <p style={{ fontSize: 13, color: '#888', margin: '0 0 1.5rem' }}>Temporada 2026/27 · 1ª RFEF Grupo 2</p>

          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
            Tu enlace de suscripción
          </p>
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, color: '#555', wordBreak: 'break-all' }}>{icalUrl}</span>
            <button
              onClick={copiar}
              style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
            Añadir a tu calendario
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1.5rem' }}>
            <a href={googleUrl} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid #e5e5e5', borderRadius: 8, textDecoration: 'none', color: '#222' }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Google Calendar</div>
                <div style={{ fontSize: 11, color: '#888' }}>Android · Web</div>
              </div>
            </a>
            <a href={webcalUrl}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid #e5e5e5', borderRadius: 8, textDecoration: 'none', color: '#222' }}>
              <span style={{ fontSize: 20 }}>🍎</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Apple Calendario</div>
                <div style={{ fontSize: 11, color: '#888' }}>iOS · macOS</div>
              </div>
            </a>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#1d4ed8', marginBottom: '1.5rem' }}>
            Los horarios se actualizan automáticamente. Cuando la RFEF publique el horario oficial de un partido, aparecerá en tu calendario sin que tengas que hacer nada.
          </div>

          <button
            onClick={() => setSeleccionado(null)}
            style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ← Elegir otro equipo
          </button>
        </div>
      )}
    </div>
  );
}
