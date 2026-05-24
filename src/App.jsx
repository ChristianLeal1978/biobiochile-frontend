import { useState, useEffect, useCallback } from "react";

const API = "https://web-production-e5d51.up.railway.app";
const POLL_INTERVAL = 5 * 60 * 1000;

const REGIONS = [
  { key: "nacional",      label: "Nacional" },
  { key: "internacional", label: "Internacional" },
  { key: "economia",      label: "Economía" },
  { key: "valparaiso",    label: "Valparaíso" },
  { key: "metropolitana", label: "Metropolitana" },
  { key: "biobio",        label: "Biobío" },
  { key: "araucania",     label: "Araucanía" },
  { key: "los-rios",      label: "Los Ríos" },
  { key: "los-lagos",     label: "Los Lagos" },
];

const TENDENCIAS = [
  { key: "deportes",          label: "Deportes" },
  { key: "ciencia-tecnologia",label: "Ciencia y Tecnología" },
  { key: "artes-cultura",     label: "Cultura" },
  { key: "dopamina",          label: "Dopamina" },
  { key: "salud-bienestar",   label: "Salud" },
  { key: "sociedad",          label: "Sociedad" },
  { key: "espectaculos",      label: "TV y Espectáculos" },
];

const ALL_SECTIONS = [...REGIONS, ...TENDENCIAS];

const CATEGORY_COLORS = {
  "Política regional": "#c0392b", "Política nacional": "#c0392b", "Política": "#c0392b",
  "Economía / precios": "#b7770d", "Economía": "#b7770d", "Mercados y finanzas": "#b7770d",
  "Clima / medio ambiente": "#1a6fa8", "Clima": "#1a6fa8",
  "Fútbol": "#1a7a3c", "Fútbol chileno": "#1a7a3c", "Deportes": "#1a7a3c",
  "Salud": "#6c3483", "Salud mental": "#6c3483",
  "Conflicto mapuche": "#8B4513", "Seguridad": "#555",
  "Reality shows": "#d35400", "Farándula chilena": "#d35400",
  "Inteligencia artificial": "#1a6fa8", "Tecnología": "#1a6fa8",
  "Música": "#8e44ad", "Videojuegos": "#8e44ad",
  "Cine y teatro": "#2c3e50", "Literatura": "#2c3e50",
  "Automovilismo": "#c0392b",
  "Tendencias virales": "#d35400", "Humor y memes": "#d35400",
  default: "#444",
};

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e0e0e0; color: #111; font-family: Arial, Helvetica, sans-serif; min-height: 100vh; }
  .app { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #111; }
  .logo { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #c0392b; margin-bottom: 8px; }
  .title { font-size: 28px; font-weight: 700; color: #111; line-height: 1.1; }
  .subtitle { font-size: 13px; color: #444; margin-top: 6px; }
  .header-right { text-align: right; flex-shrink: 0; margin-left: 24px; }
  .status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; vertical-align: middle; animation: pulse 2s infinite; }
  .status-dot.live { background: #1a7a3c; }
  .status-dot.loading { background: #b7770d; animation: none; }
  .status-dot.error { background: #c0392b; animation: none; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .status-text { font-size: 13px; color: #333; }
  .last-update { font-size: 12px; color: #666; margin-top: 4px; }
  .refresh-btn { margin-top: 8px; background: #fff; border: 1px solid #aaa; color: #333; font-family: Arial, sans-serif; font-size: 12px; padding: 5px 12px; border-radius: 3px; cursor: pointer; }
  .refresh-btn:hover { border-color: #111; }

  .sources-panel { background: #fff; border: 1px solid #ccc; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px; }
  .sources-title { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 10px; }
  .sources-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .source-item { display: flex; align-items: center; gap: 6px; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 5px 10px; }
  .source-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
  .source-dot.ok     { background: #1a7a3c; }
  .source-dot.stale  { background: #b7770d; }
  .source-dot.error  { background: #c0392b; }
  .source-name   { font-size: 12px; color: #333; font-weight: 500; }
  .source-detail { font-size: 11px; color: #888; }
  .source-time   { font-size: 11px; color: #aaa; margin-left: 4px; }

  .nav-wrapper { margin-bottom: 24px; }
  .nav-row { display: flex; gap: 3px; flex-wrap: wrap; background: #d0d0d0; padding: 5px; }
  .nav-row:first-child { border-radius: 6px 6px 0 0; border-bottom: 1px solid #bbb; }
  .nav-row:last-child  { border-radius: 0 0 6px 6px; }
  .nav-btn { flex: 1; min-width: max-content; background: transparent; border: none; color: #555; font-family: Arial, sans-serif; font-size: 13px; font-weight: 500; padding: 7px 10px; border-radius: 4px; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
  .nav-btn:hover { background: #c8c8c8; color: #111; }
  .nav-btn.active { background: #fff; color: #111; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.12); }
  .nav-btn.tendencia.active { background: #c0392b; color: #fff; }

  .alert { background: #fff5f5; border-left: 4px solid #c0392b; border-radius: 0 4px 4px 0; padding: 16px 20px; margin-bottom: 24px; }
  .alert-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #c0392b; margin-bottom: 6px; }
  .alert-text  { font-size: 14px; color: #222; line-height: 1.6; }

  .week-label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #777; margin-bottom: 16px; }

  .cards { display: flex; flex-direction: column; gap: 10px; }
  .card { background: #fff; border: 1px solid #ccc; border-top: 4px solid var(--cat-color); border-radius: 6px; padding: 20px 24px; }
  .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .card-category { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--cat-color); margin-bottom: 6px; }
  .card-tema { font-size: 18px; font-weight: 700; color: #111; line-height: 1.25; }
  .card-confidence { text-align: right; flex-shrink: 0; margin-left: 20px; }
  .confidence-number { font-size: 30px; font-weight: 700; color: var(--cat-color); line-height: 1; }
  .confidence-label  { font-size: 11px; color: #888; margin-top: 2px; }
  .card-razon { font-size: 14px; color: #444; line-height: 1.65; margin-bottom: 16px; border-left: 2px solid #ddd; padding-left: 12px; }
  .enfoques-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .enfoques { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .enfoque-item    { background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; padding: 10px 14px; }
  .enfoque-tag     { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px; }
  .enfoque-titular { font-size: 14px; color: #111; line-height: 1.4; }
  .card-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #eee; flex-wrap: wrap; gap: 8px; }
  .ventana { font-size: 13px; color: #777; }
  .ventana span { color: #111; font-weight: 700; margin-left: 4px; }
  .feedback-btns { display: flex; gap: 6px; }
  .fb-btn { background: #fff; border: 1px solid #bbb; color: #444; font-family: Arial, sans-serif; font-size: 12px; padding: 5px 12px; border-radius: 3px; cursor: pointer; transition: all 0.15s; }
  .fb-btn:hover { border-color: #555; color: #111; }
  .fb-btn.active-usado      { background: #edfaf3; border-color: #1a7a3c; color: #1a7a3c; font-weight: 700; }
  .fb-btn.active-descartado { background: #fdf0ef; border-color: #c0392b; color: #c0392b; font-weight: 700; }
  .fb-btn.active-pendiente  { background: #fdf8ee; border-color: #b7770d; color: #b7770d; font-weight: 700; }

  .state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 260px; gap: 16px; }
  .spinner { width: 28px; height: 28px; border: 2px solid #ccc; border-top-color: #c0392b; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .state-msg { font-size: 14px; color: #666; }
  .retry-btn { background: #fff; border: 1px solid #c0392b; color: #c0392b; font-family: Arial, sans-serif; font-size: 13px; padding: 8px 20px; border-radius: 3px; cursor: pointer; }
  .retry-btn:hover { background: #c0392b; color: #fff; }

  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #999; }
`;

function formatTimestamp(isoStr) {
  if (!isoStr) return null;
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hhmm = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  return isToday ? hhmm : `${d.getDate()}/${d.getMonth()+1} ${hhmm}`;
}

function SourcesPanel({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="sources-panel">
      <div className="sources-title">Fuentes de datos activas</div>
      <div className="sources-grid">
        {sources.map((s, i) => {
          const dotClass = s.status === "ok" ? "ok" : s.status === "stale" ? "stale" : "error";
          const ts = formatTimestamp(s.updated_at);
          return (
            <div className="source-item" key={i} title={s.descripcion}>
              <div className={`source-dot ${dotClass}`} />
              <span className="source-name">{s.nombre}</span>
              <span className="source-detail">— {s.detalle}</span>
              {ts && <span className="source-time">· {ts}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PredictionCard({ pred, region, onFeedback, feedback }) {
  const catColor = CATEGORY_COLORS[pred.categoria] || CATEGORY_COLORS.default;
  const estado = feedback[`${region}:${pred.tema}`];
  return (
    <div className="card" style={{ "--cat-color": catColor }}>
      <div className="card-top">
        <div>
          <div className="card-category">{pred.categoria}</div>
          <div className="card-tema">{pred.tema}</div>
        </div>
        <div className="card-confidence">
          <div className="confidence-number">{pred.confianza}</div>
          <div className="confidence-label">confianza</div>
        </div>
      </div>
      <div className="card-razon">{pred.razon}</div>
      <div className="enfoques-label">Enfoques sugeridos</div>
      <div className="enfoques">
        {pred.enfoques.map((e, i) => (
          <div className="enfoque-item" key={i}>
            <div className="enfoque-tag">{e.enfoque}</div>
            <div className="enfoque-titular">{e.titular_sugerido}</div>
          </div>
        ))}
      </div>
      <div className="card-bottom">
        <div className="ventana">Ventana óptima <span>{pred.ventana_optima}</span></div>
        <div className="feedback-btns">
          <button className={`fb-btn${estado === "usado"      ? " active-usado"      : ""}`} onClick={() => onFeedback(pred.tema, "usado")}>✓ Usado</button>
          <button className={`fb-btn${estado === "pendiente"  ? " active-pendiente"  : ""}`} onClick={() => onFeedback(pred.tema, "pendiente")}>⏳ Pendiente</button>
          <button className={`fb-btn${estado === "descartado" ? " active-descartado" : ""}`} onClick={() => onFeedback(pred.tema, "descartado")}>✕ Descartar</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("biobio");
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [sources, setSources] = useState([]);

  const fetchSection = useCallback(async (key) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API}/predicciones?region=${key}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setCache(prev => ({ ...prev, [key]: json }));
      setLastUpdate(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/status`);
      if (!res.ok) return;
      const json = await res.json();
      setSources(json.fuentes || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchSection(activeSection);
    fetchStatus();
    const interval = setInterval(() => fetchSection(activeSection), POLL_INTERVAL);
    const statusInterval = setInterval(fetchStatus, POLL_INTERVAL);
    return () => { clearInterval(interval); clearInterval(statusInterval); };
  }, [activeSection, fetchSection, fetchStatus]);

  const handleSection = (key) => {
    setActiveSection(key);
    setError(false);
    if (!cache[key]) setLoading(true);
  };

  const handleFeedback = useCallback(async (tema, estado) => {
    const key = `${activeSection}:${tema}`;
    setFeedback(prev => ({ ...prev, [key]: estado }));
    try {
      await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, estado, region: activeSection }),
      });
    } catch {}
  }, [activeSection]);

  const formatTime = (d) => d ? d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "";
  const data = cache[activeSection];
  const isLoading = loading && !data;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div>
            <div className="logo">BioBioChile</div>
            <div className="title">Predictor Editorial</div>
            <div className="subtitle">Temas y enfoques para la semana</div>
          </div>
          <div className="header-right">
            <div>
              <span className={`status-dot ${isLoading ? "loading" : error ? "error" : "live"}`} />
              <span className="status-text">{isLoading ? "Cargando..." : error ? "Sin conexión" : "En vivo"}</span>
            </div>
            {lastUpdate && <div className="last-update">Actualizado {formatTime(lastUpdate)}</div>}
            <button className="refresh-btn" onClick={() => { setCache(prev => ({ ...prev, [activeSection]: undefined })); fetchSection(activeSection); fetchStatus(); }}>↻ Actualizar</button>
          </div>
        </header>

        <SourcesPanel sources={sources} />

        <div className="nav-wrapper">
          <div className="nav-row">
            {REGIONS.map(r => (
              <button key={r.key} className={`nav-btn${activeSection === r.key ? " active" : ""}`} onClick={() => handleSection(r.key)}>{r.label}</button>
            ))}
          </div>
          <div className="nav-row">
            {TENDENCIAS.map(t => (
              <button key={t.key} className={`nav-btn tendencia${activeSection === t.key ? " active" : ""}`} onClick={() => handleSection(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>

        {isLoading && <div className="state-center"><div className="spinner" /><div className="state-msg">Cargando predicciones...</div></div>}
        {error && !isLoading && <div className="state-center"><div className="state-msg">No se pudo conectar al servidor</div><button className="retry-btn" onClick={() => fetchSection(activeSection)}>Reintentar</button></div>}

        {!isLoading && !error && data && (
          <>
            {data.alerta && (
              <div className="alert">
                <div className="alert-label">⚡ Alerta editorial</div>
                <div className="alert-text">{data.alerta}</div>
              </div>
            )}
            {data.contexto?.semana_del_ano && (
              <div className="week-label">Semana {data.contexto.semana_del_ano} · {data.contexto.temporada}</div>
            )}
            <div className="cards">
              {(data.predicciones || []).map((pred, i) => (
                <PredictionCard key={`${pred.tema}-${i}`} pred={pred} region={activeSection} feedback={feedback} onFeedback={handleFeedback} />
              ))}
            </div>
          </>
        )}

        <div className="footer">BioBioChile Predictor · Actualización automática cada 5 minutos</div>
      </div>
    </>
  );
}
