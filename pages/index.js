import { useState } from 'react';

const GRUPOS = {
  1: {
    color: '#E8590C',
    nombre: 'Grupo 1',
    equipos: [
      { id: 'merida', nombre: 'AD Mérida', c1: '#1a1a1a', c2: '#888888', escudo: 'Merida_AD.png' },
      { id: 'arenas', nombre: 'Arenas Club', c1: '#1a1a1a', c2: '#C8102E', escudo: 'Arenas_Club.png' },
      { id: 'athleticb', nombre: "Athletic Club 'B'", c1: '#C8102E', c2: '#FFFFFF', escudo: 'Athletic_Club_B_U21.png' },
      { id: 'barakaldo', nombre: 'Barakaldo CF', c1: '#FFD700', c2: '#1a1a1a', escudo: 'Barakaldo_CF.png' },
      { id: 'coria', nombre: 'CD Coria', c1: '#6CB4E4', c2: '#FFFFFF', escudo: 'CD_Coria.png' },
      { id: 'extremadura', nombre: 'CD Extremadura', c1: '#6B0020', c2: '#00205B', escudo: 'CD_Extremadura.png' },
      { id: 'lugo', nombre: 'CD Lugo', c1: '#C8102E', c2: '#FFFFFF', escudo: 'CD_Lugo.png' },
      { id: 'mirandes', nombre: 'CD Mirandés', c1: '#C8102E', c2: '#1a1a1a', escudo: 'Mirandes.png' },
      { id: 'cacereno', nombre: 'CP Cacereño', c1: '#1a5c1a', c2: '#FFFFFF', escudo: 'CP_Cacereno.png' },
      { id: 'leonesa', nombre: 'CyD Leonesa', c1: '#FFFFFF', c2: '#C8102E', escudo: 'Cultural_Leonesa.png' },
      { id: 'pontevedra', nombre: 'Pontevedra CF', c1: '#6B0020', c2: '#003DA5', escudo: 'Pontevedra_CF.png' },
      { id: 'ferrol', nombre: 'Racing Club Ferrol', c1: '#1a6b1a', c2: '#1a1a1a', escudo: 'Racing_de_Ferrol.png' },
      { id: 'fabril', nombre: 'RC Deportivo Fabril', c1: '#003DA5', c2: '#FFFFFF', escudo: 'Deportivo_Fabril.png' },
      { id: 'aviles', nombre: 'Real Avilés Industrial', c1: '#003DA5', c2: '#FFFFFF', escudo: 'Real_Aviles.png' },
      { id: 'realunion', nombre: 'Real Unión Club', c1: '#FFFFFF', c2: '#1a1a1a', escudo: 'Real_Union_Club.png' },
      { id: 'ponferradina', nombre: 'SD Ponferradina', c1: '#003DA5', c2: '#FFFFFF', escudo: 'SD_Ponferradina.png' },
      { id: 'logrono', nombre: 'UD Logroñés', c1: '#C8102E', c2: '#FFFFFF', escudo: 'UD_Logrones.png' },
      { id: 'ourense', nombre: 'UD Ourense', c1: '#C8102E', c2: '#003DA5', escudo: 'Union_Deportiva_Ourense.png' },
      { id: 'unionistas', nombre: 'Unionistas de Salamanca CF', c1: '#1a1a1a', c2: '#FFFFFF', escudo: 'Unionistas_de_Salamanca_CF.png' },
      { id: 'zamora', nombre: 'Zamora CF', c1: '#C8102E', c2: '#FFFFFF', escudo: 'Zamora_CF.png' },
    ]
  },
  2: {
    color: '#CC0000',
    nombre: 'Grupo 2',
    equipos: [
      { id: 'alcorcon', nombre: 'AD Alcorcón', c1: '#FFD700', c2: '#003DA5', escudo: 'AD_Alcorcon.png' },
      { id: 'aguilas', nombre: 'Águilas FC', c1: '#003DA5', c2: '#FFFFFF', escudo: 'CDA_Aguilas_FC.png' },
      { id: 'algeciras', nombre: 'Algeciras CF', c1: '#C8102E', c2: '#FFFFFF', escudo: 'Algeciras_CF.png' },
      { id: 'antequera', nombre: 'Antequera CF', c1: '#1a6b1a', c2: '#FFFFFF', escudo: 'Antequera.png' },
      { id: 'atleticomadrileno', nombre: 'Atlético Madrileño', c1: '#C8102E', c2: '#FFFFFF', escudo: 'Atletico_Madrileno.png' },
      { id: 'teruel', nombre: 'CD Teruel', c1: '#C8102E', c2: '#003DA5', escudo: 'CD_Teruel.png' },
      { id: 'europa', nombre: 'CE Europa', c1: '#003DA5', c2: '#FFFFFF', escudo: 'CE_Europa.png' },
      { id: 'majadahonda', nombre: 'CF Rayo Majadahonda', c1: '#003DA5', c2: '#FFFFFF', escudo: 'Rayo_Majadahonda.png' },
      { id: 'cartagena', nombre: 'FC Cartagena', c1: '#1a1a1a', c2: '#FFFFFF', escudo: 'FC_Cartagena.png' },
      { id: 'nastic', nombre: 'Gimnàstic de Tarragona', c1: '#C8102E', c2: '#FFFFFF', escudo: 'Gimnastic_de_Tarragona.png' },
      { id: 'hercules', nombre: 'Hércules de Alicante CF', c1: '#003DA5', c2: '#FFFFFF', escudo: 'Hercules_CF.png' },
      { id: 'torremolinos', nombre: 'Juventud de Torremolinos CF', c1: '#1a6b1a', c2: '#FFFFFF', escudo: 'Juventud_Torremolinos_CF.png' },
      { id: 'jaen', nombre: 'Real Jaén CF', c1: '#6B2D8B', c2: '#FFFFFF', escudo: 'Real_Jaen.png' },
      { id: 'rmcastilla', nombre: 'Real Madrid Castilla', c1: '#9B8FD0', c2: '#FFFFFF', escudo: 'Real_Madrid_Castilla_U21.png' },
      { id: 'rmurcia', nombre: 'Real Murcia CF', c1: '#C8102E', c2: '#FFFFFF', escudo: 'Real_Murcia.png' },
      { id: 'zaragoza', nombre: 'Real Zaragoza', c1: '#003DA5', c2: '#FFFFFF', escudo: 'Real_Zaragoza.png' },
      { id: 'huesca', nombre: 'SD Huesca', c1: '#003DA5', c2: '#6B0020', escudo: 'Huesca.png' },
      { id: 'ibiza', nombre: 'UD Ibiza', c1: '#6CB4E4', c2: '#FFFFFF', escudo: 'UD_Ibiza.png' },
      { id: 'standreu', nombre: 'UE Sant Andreu', c1: '#FFD700', c2: '#C8102E', escudo: 'UE_Sant_Andreu.png' },
      { id: 'villarreal', nombre: "Villarreal CF 'B'", c1: '#FFD700', c2: '#003DA5', escudo: 'Villarreal_B_U23.png' },
    ]
  }
};

export default function Home() {
  const [grupo, setGrupo] = useState(null);
  const [seleccionado, setSeleccionado] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [webAbierto, setWebAbierto] = useState(true);
  const [movilAbierto, setMovilAbierto] = useState(false);

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
  const color = grupo ? GRUPOS[grupo].color : '#1a1a2e';

  const Paso = ({ num, texto }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{num}</div>
      <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>{texto}</div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>

      <div style={{
        background: `linear-gradient(135deg, #1a1a1a 0%, ${colorGrupo}99 100%)`,
        borderRadius: 12,
        padding: '2rem 1.5rem',
        textAlign: 'center',
        marginBottom: '2rem',
        color: '#fff',
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
            {[1, 2].map(g => {
              const eq = GRUPOS[g].equipos;
              return (
                <button
                  key={g}
                  onClick={() => setGrupo(g)}
                  style={{
                    background: GRUPOS[g].color,
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                    color: '#fff',
                    transition: 'opacity 0.15s, transform 0.15s',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 160,
                    padding: 0,
                  }}
                  onMouseOver={ev => { ev.currentTarget.style.opacity = '0.88'; ev.currentTarget.style.transform = 'scale(1.02)'; }}
                  onMouseOut={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gridTemplateRows: 'repeat(4, 1fr)',
                    padding: 6,
                    gap: 4,
                    pointerEvents: 'none',
                  }}>
                    {eq.map((e, i) => (
                      <img
                        key={i}
                        src={`/escudos/${e.escudo}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.25 }}
                      />
                    ))}
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 1rem' }}>
                    <div style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.75, marginBottom: 8 }}>1ª RFEF</div>
                    <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>Grupo {g}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>20 equipos</div>
                  </div>
                </button>
              );
            })}
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
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: '#1a1a1a',
                  lineHeight: 1.3,
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
                onMouseOver={ev => { ev.currentTarget.style.opacity = '0.8'; ev.currentTarget.style.transform = 'scale(1.02)'; }}
                onMouseOut={ev => { ev.currentTarget.style.opacity = '1'; ev.currentTarget.style.transform = 'scale(1)'; }}
              >
                <img
                  src={`/escudos/${e.escudo}`}
                  alt={e.nombre}
                  style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }}
                />
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
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={`/escudos/${seleccionado.escudo}`}
                alt={seleccionado.nombre}
                style={{ width: 40, height: 40, objectFit: 'contain' }}
              />
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                  {seleccionado.nombre}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                  1ª RFEF · Grupo {grupo} · 2026/27
                </div>
              </div>
            </div>
            <button
              onClick={() => setSeleccionado(null)}
              style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#fff', fontSize: 13, padding: '4px 10px' }}
            >
              ← Volver
            </button>
          </div>

          {/* Paso 1 */}
          <div style={{ display: 'flex', gap: 14, marginBottom: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>1</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 8 }}>Copia tu enlace de calendario</div>
              <div style={{ background: '#f5f5f5', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ flex: 1, fontFamily: 'monospace', fontSize: 11, color: '#555', wordBreak: 'break-all' }}>{icalUrl}</span>
                <button onClick={copiar} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {copiado ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '2px dashed #e5e5e5', marginLeft: 13, height: 16, marginBottom: '1.25rem' }} />

          {/* Paso 2 */}
          <div style={{ display: 'flex', gap: 14, marginBottom: '1.25rem', alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>2</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 12 }}>Añade el calendario</div>

              {/* 2.1 Desde web */}
              <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                <div
                  onClick={() => setWebAbierto(!webAbierto)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', cursor: 'pointer', background: webAbierto ? '#f9f9f9' : '#fff', borderBottom: webAbierto ? '1px solid #e5e5e5' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>💻</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Desde el ordenador</span>
                    <span style={{ fontSize: 11, color: '#fff', background: color, borderRadius: 10, padding: '2px 8px' }}>Recomendado</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{webAbierto ? '▲' : '▼'}</span>
                </div>
                {webAbierto && (
                  <div style={{ padding: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
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
                  </div>
                )}
              </div>

              {/* 2.2 Desde móvil */}
              <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden' }}>
                <div
                  onClick={() => setMovilAbierto(!movilAbierto)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', cursor: 'pointer', background: movilAbierto ? '#f9f9f9' : '#fff', borderBottom: movilAbierto ? '1px solid #e5e5e5' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>📱</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Desde el móvil</span>
                  </div>
                  <span style={{ fontSize: 12, color: '#aaa' }}>{movilAbierto ? '▲' : '▼'}</span>
                </div>
                {movilAbierto && (
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>📅 Google Calendar (Android)</div>
                    <Paso num="1" texto="Abre Chrome en tu móvil" />
                    <Paso num="2" texto={<>Ve a <strong>calendar.google.com</strong></>} />
                    <Paso num="3" texto={<>Pulsa los tres puntos (⋮) → <strong>Versión de escritorio</strong></>} />
                    <Paso num="4" texto={<>Pulsa el icono de ajustes ⚙️ → <strong>Añadir calendario</strong> → <strong>Desde URL</strong></>} />
                    <Paso num="5" texto="Pega el enlace copiado en el paso 1 y pulsa Añadir calendario" />

                    <div style={{ borderTop: '1px solid #f0f0f0', margin: '14px 0' }} />

                    <div style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🍎 Apple Calendario (iPhone)</div>
                    <Paso num="1" texto="Abre Safari en tu iPhone" />
                    <Paso num="2" texto="Pega el enlace copiado directamente en la barra de direcciones" />
                    <Paso num="3" texto={<>Safari te preguntará si quieres suscribirte → pulsa <strong>Suscribirse</strong></>} />
                    <Paso num="4" texto="Los partidos aparecerán al instante en tu app Calendario" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ borderLeft: '2px dashed #e5e5e5', marginLeft: 13, height: 16, marginBottom: '1.25rem' }} />

          {/* Paso 3 */}
          <div style={{ display: 'flex', gap: 14, marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: color, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>3</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111', marginBottom: 4 }}>Pega la URL en el campo correspondiente</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>
                En la pantalla que se ha abierto, busca el campo <strong>"URL del calendario"</strong> y pega el enlace que copiaste en el paso 1.
              </div>
            </div>
          </div>

          <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555' }}>
            ✓ Los horarios se actualizan automáticamente. Cuando la RFEF publique el horario oficial, aparecerá en tu calendario sin que tengas que hacer nada.
          </div>

        </div>
      )}
    </div>
  );
}
