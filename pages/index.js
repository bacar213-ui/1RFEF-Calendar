import { useState } from 'react';

const GRUPOS = {
  1: {
    color: '#E8590C',
    colorOscuro: '#C44A08',
    nombre: 'Grupo 1',
    equipos: [
      { id: 'merida', nombre: 'AD Mérida' },
      { id: 'arenas', nombre: 'Arenas Club' },
      { id: 'athleticb', nombre: "Athletic Club 'B'" },
      { id: 'barakaldo', nombre: 'Barakaldo CF' },
      { id: 'coria', nombre: 'CD Coria' },
      { id: 'extremadura', nombre: 'CD Extremadura' },
      { id: 'lugo', nombre: 'CD Lugo' },
      { id: 'mirandes', nombre: 'CD Mirandés' },
      { id: 'cacereno', nombre: 'CP Cacereño' },
      { id: 'leonesa', nombre: 'CyD Leonesa' },
      { id: 'pontevedra', nombre: 'Pontevedra CF' },
      { id: 'ferrol', nombre: 'Racing Club Ferrol' },
      { id: 'fabril', nombre: 'RC Deportivo Fabril' },
      { id: 'aviles', nombre: 'Real Avilés Industrial' },
      { id: 'realunion', nombre: 'Real Unión Club' },
      { id: 'ponferradina', nombre: 'SD Ponferradina' },
      { id: 'logrono', nombre: 'UD Logroñés' },
      { id: 'ourense', nombre: 'UD Ourense' },
      { id: 'unionistas', nombre: 'Unionistas de Salamanca CF' },
      { id: 'zamora', nombre: 'Zamora CF' },
    ]
  },
  2: {
    color: '#CC0000',
    colorOscuro: '#A30000',
    nombre: 'Grupo 2',
    equipos: [
      { id: 'alcorcon', nombre: 'AD Alcorcón' },
      { id: 'aguilas', nombre: 'Águilas FC' },
      { id: 'algeciras', nombre: 'Algeciras CF' },
      { id: 'antequera', nombre: 'Antequera CF' },
      { id: 'atleticomadrileno', nombre: 'Atlético Madrileño' },
      { id: 'teruel', nombre: 'CD Teruel' },
      { id: 'europa', nombre: 'CE Europa' },
      { id: 'majadahonda', nombre: 'CF Rayo Majadahonda' },
      { id: 'cartagena', nombre: 'FC Cartagena' },
      { id: 'nastic', nombre: 'Gimnàstic de Tarragona' },
      { id: 'hercules', nombre: 'Hércules de Alicante CF' },
      { id: 'torremolinos', nombre: 'Juventud de Torremolinos CF' },
      { id: 'jaen', nombre: 'Real Jaén CF' },
      { id: 'rmcastilla', nombre: 'Real Madrid Castilla' },
      { id: 'rmurcia', nombre: 'Real Murcia CF' },
      { id: 'zaragoza', nombre: 'Real Zaragoza' },
      { id: 'huesca', nombre: 'SD Huesca' },
      { id: 'ibiza', nombre: 'UD Ibiza' },
      { id: 'standreu', nombre: 'UE Sant Andreu' },
      { id: 'villarreal', nombre: "Villarreal CF 'B'" },
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
  const colorOscuro = grupo ? GRUPOS[grupo].colorOscuro : '#1a1a2e';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #1a1a1a 0%, ${colorGrupo}88 100%)`,
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

      {/* Pantalla 1: elegir grupo */}
      {!grupo && (
        <>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12, textAlign: 'center' }}>
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
                  padding: '2rem 1rem',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'transform 0.15s, opacity 0.15s',
                }}
                onMouseOver={ev => ev.currentTarget.style.opacity = '0.9'}
                onMouseOut={ev => ev.currentTarget.style.opacity = '1'}
              >
                <div style={{ fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 6 }}>
                  1ª RFEF
                </div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  Grupo {g}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                  20 equipos
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Pantalla 2: elegir equipo */}
      {grupo && !seleccionado && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button
              onClick={() => setGrupo(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: 0 }}
            >
              ← Volver
            </button>
            <div style={{
              background: GRUPOS[grupo].color,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: 20,
              letterSpacing: '0.05em'
            }}>
              GRUPO {grupo}
            </div>
          </div>
          <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', marginBottom: 12 }}>
            Elige tu equipo
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {GRUPOS[grupo].equipos.map(e => (
              <button
                key={e.id}
                onClick={() => setSeleccionado(e)}
                style={{
                  background: '#fff',
                  border: `1.5px solid #e5e5e5`,
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#222',
                  transition: 'border-color 0.15s'
                }}
                onMouseOver={ev => { ev.currentTarget.style.borderColor = GRUPOS[grupo].color; ev.currentTarget.style.color = GRUPOS[grupo].color; }}
                onMouseOut={ev => { ev.currentTarget.style.borderColor = '#e5e5e5'; ev.currentTarget.style.color = '#222'; }}
              >
                {e.nombre}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Pantalla 3: URL y suscripción */}
      {seleccionado && (
        <div style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 12, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <button
              onClick={() => setSeleccionado(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, padding: 0 }}
            >
              ←
            </button>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#111' }}>{seleccionado.nombre}</h2>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                1ª RFEF · <span style={{ color: GRUPOS[grupo].color, fontWeight: 600 }}>Grupo {grupo}</span> · Temporada 2026/27
              </p>
            </div>
          </div>

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

          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555' }}>
            Los horarios se actualizan automáticamente. Cuando la RFEF publique el horario oficial de un partido, aparecerá en tu calendario sin que tengas que hacer nada.
          </div>
        </div>
      )}
    </div>
  );
}
