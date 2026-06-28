import { useState } from 'react';

const GRUPOS = {
  1: {
    color: '#E8590C',
    nombre: 'Grupo 1',
    equipos: [
      { id: 'merida', nombre: 'AD Mérida', c1: '#1a1a1a', c2: '#888888' },
      { id: 'arenas', nombre: 'Arenas Club', c1: '#1a1a1a', c2: '#C8102E' },
      { id: 'athleticb', nombre: "Athletic Club 'B'", c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'barakaldo', nombre: 'Barakaldo CF', c1: '#FFD700', c2: '#1a1a1a' },
      { id: 'coria', nombre: 'CD Coria', c1: '#6CB4E4', c2: '#FFFFFF' },
      { id: 'extremadura', nombre: 'CD Extremadura', c1: '#6B0020', c2: '#00205B' },
      { id: 'lugo', nombre: 'CD Lugo', c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'mirandes', nombre: 'CD Mirandés', c1: '#C8102E', c2: '#1a1a1a' },
      { id: 'cacereno', nombre: 'CP Cacereño', c1: '#1a5c1a', c2: '#FFFFFF' },
      { id: 'leonesa', nombre: 'CyD Leonesa', c1: '#FFFFFF', c2: '#C8102E' },
      { id: 'pontevedra', nombre: 'Pontevedra CF', c1: '#6B0020', c2: '#003DA5' },
      { id: 'ferrol', nombre: 'Racing Club Ferrol', c1: '#1a6b1a', c2: '#1a1a1a' },
      { id: 'fabril', nombre: 'RC Deportivo Fabril', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'aviles', nombre: 'Real Avilés Industrial', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'realunion', nombre: 'Real Unión Club', c1: '#FFFFFF', c2: '#1a1a1a' },
      { id: 'ponferradina', nombre: 'SD Ponferradina', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'logrono', nombre: 'UD Logroñés', c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'ourense', nombre: 'UD Ourense', c1: '#C8102E', c2: '#003DA5' },
      { id: 'unionistas', nombre: 'Unionistas de Salamanca CF', c1: '#1a1a1a', c2: '#FFFFFF' },
      { id: 'zamora', nombre: 'Zamora CF', c1: '#C8102E', c2: '#FFFFFF' },
    ]
  },
  2: {
    color: '#CC0000',
    nombre: 'Grupo 2',
    equipos: [
      { id: 'alcorcon', nombre: 'AD Alcorcón', c1: '#FFD700', c2: '#003DA5' },
      { id: 'aguilas', nombre: 'Águilas FC', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'algeciras', nombre: 'Algeciras CF', c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'antequera', nombre: 'Antequera CF', c1: '#1a6b1a', c2: '#FFFFFF' },
      { id: 'atleticomadrileno', nombre: 'Atlético Madrileño', c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'teruel', nombre: 'CD Teruel', c1: '#C8102E', c2: '#003DA5' },
      { id: 'europa', nombre: 'CE Europa', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'majadahonda', nombre: 'CF Rayo Majadahonda', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'cartagena', nombre: 'FC Cartagena', c1: '#1a1a1a', c2: '#FFFFFF' },
      { id: 'nastic', nombre: 'Gimnàstic de Tarragona', c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'hercules', nombre: 'Hércules de Alicante CF', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'torremolinos', nombre: 'Juventud de Torremolinos CF', c1: '#1a6b1a', c2: '#FFFFFF' },
      { id: 'jaen', nombre: 'Real Jaén CF', c1: '#6B2D8B', c2: '#FFFFFF' },
      { id: 'rmcastilla', nombre: 'Real Madrid Castilla', c1: '#9B8FD0', c2: '#FFFFFF' },
      { id: 'rmurcia', nombre: 'Real Murcia CF', c1: '#C8102E', c2: '#FFFFFF' },
      { id: 'zaragoza', nombre: 'Real Zaragoza', c1: '#003DA5', c2: '#FFFFFF' },
      { id: 'huesca', nombre: 'SD Huesca', c1: '#003DA5', c2: '#6B0020' },
      { id: 'ibiza', nombre: 'UD Ibiza', c1: '#6CB4E4', c2: '#FFFFFF' },
      { id: 'standreu', nombre: 'UE Sant Andreu', c1: '#FFD700', c2: '#C8102E' },
      { id: 'villarreal', nombre: "Villarreal CF 'B'", c1: '#FFD700', c2: '#003DA5' },
    ]
  }
};

export default function Home() {
  const [grupo, setGrupo] = useState(null);
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

  const colorGrupo = grupo ? GRUPOS[grupo].color : '#1a1a2e';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>

      <div style={{
        background: `linear-gradient(135deg, #1a1a1a 0%, ${colorGrupo}99 100%)`,
        borderRadius: 12,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#fff',
        transition: 'background 0.4s'
      }}>
        <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 12 }}>
          1ª RFEF · Temporada 2026/27
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff' }}>
          Tu equipo en tu calendario
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.6 }}>
          Suscríbete a los partidos de tu equipo. Cuando cambien los horarios, tu calendario se actualiza solo.
        </p>
      </div>

      {!grupo && (
        <>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 16, textAlign: 'center' }}>
            Elige tu grupo
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[1, 2].map(g => (
              <button
                key={g}
                onClick={() => setGrupo(g)}
                style={{
                  background: GRUPOS[g].color,
                  border: 'none',
                  borderRadius: 12,
                  padding: '2.5rem 1rem',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
                onMouseOver={ev => { ev.currentTarget.style.opacity = '0.88'; ev.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseOut={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.transform = 'scale(1)'; }}
              >
                <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 8 }}>1ª RFEF</div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>Grupo {g}</div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>20 equipos</div>
              </button>
            ))}
          </div>
        </>
      )}

      {grupo && !seleccionado && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button onClick={() => setGrupo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: 0 }}>
              ← Volver
            </button>
            <div style={{ background: GRUPOS[grupo].color, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Grupo {grupo}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 8 }}>
            {GRUPOS[grupo].equipos.map(e => (
              <button
                key={e.id}
                onClick={() => setSeleccionado(e)}
                style={{
                  background: `linear-gradient(135deg, ${e.c1}22 0%, ${e.c2}11 100%)`,
                  border: `1.5px solid ${e.c1}66`,
                  borderRadius: 8,
                  padding: '0 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#1a1a1a',
                  lineHeight: 1.3,
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
                onMouseOver={ev => { ev.currentTarget.style.opacity = '0.8'; ev.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseOut={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.transform = 'scale(1)'; }}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        </>
      )}

      {seleccionado && (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{
            background: `linear-gradient(135deg, ${seleccionado.c1} 0%, ${seleccionado.c2} 100%)`,
            borderRadius: 8,
            padding: '14px 16px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                {seleccionado.nombre}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                1ª RFEF · Grupo {grupo} · 2026/27
              </div>
            </div>
            <button
              onClick={() => setSeleccionado(null)}
              style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', fontSize: 13, padding: '4px 10px' }}
            >
              ← Volver
            </button>
          </div>

          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Tu enlace de suscripción</p>
          <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 12, color: '#555', wordBreak: 'break-all' }}>{icalUrl}</span>
            <button onClick={copiar} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {copiado ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>

          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Añadir a tu calendario</p>
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

          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555' }}>
            Los horarios se actualizan automáticamente. Cuando la RFEF publique el horario oficial de un partido, aparecerá en tu calendario sin que tengas que hacer nada.
          </div>
        </div>
      )}
    </div>
  );
}
