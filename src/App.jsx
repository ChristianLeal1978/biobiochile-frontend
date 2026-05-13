import { useState, useEffect, useCallback } from "react";

const API = "https://web-production-e5d51.up.railway.app";
const POLL_INTERVAL = 5 * 60 * 1000;

const CATEGORY_COLORS = {
  "Política regional": "#c0392b",
  "Economía / precios": "#b7770d",
  "Clima / medio ambiente": "#1a6fa8",
  "Fútbol": "#1a7a3c",
  "Salud": "#6c3483",
  default: "#444",
};

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #e0e0e0; color: #111; font-family: Arial, Helvetica, sans-serif; min-height: 100vh; }
  .app { max-width: 860px; margin: 0 auto; padding: 48px 24px 80px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #111; }
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
  .refresh-btn { margin-top: 8px; background: #fff; border: 1px solid #aaa; color: #333; font-family: Arial, sans-serif; font-size: 12px; padding: 5px 12px; border-radius: 3px; cursor: pointer; transition: border-color 0.15s; }
  .refresh-btn:hover { border-color: #111; color: #111; }

  .alert { background: #fff5f5; border-left: 4px solid #c0392b; border-radius: 0 4px 4px 0; padding: 16px 20px; margin-bottom: 32px; }
  .alert-label { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #c0392b; margin-bottom: 6px; }
  .alert-text { font-size: 14px; color: #222; line-height: 1.6; }

  .week-label { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #777; margin-bottom: 16px; }

  .cards { display: flex; flex-direction: column; gap: 10px; }

  .card { background: #fff; border: 1px solid #ccc; border-top: 4px solid var(--cat-color); border-radius: 6px; padding: 20px 24px; }

  .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .card-category { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--cat-color); margin-bottom: 6px; }
  .card-tema { font-size: 18px; font-weight: 700; color: #111; line-height: 1.25; }
  .card-confidence { text-align: right; flex-shrink: 0; margin-left: 20px; }
  .confidence-number { font-size: 30px; font-weight: 700; color: var(--cat-color); line-height: 1; }
  .confidence-label { font-size: 11px; color: #888; margin-top: 2px; }

  .card-razon { font-size: 14px; color: #444; line-height: 1.65; margin-bottom: 16px; border-left: 2px solid #ddd; padding-left: 12px; }

  .enfoques-label { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .enfoques { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .enfoque-item { background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; padding: 10px 14px; }
  .enfoque-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px; }
  .enfoque-titular { font-size: 14px; color: #111; line-height: 1.4; }

  .card-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #eee; flex-wrap: wrap; gap: 8px; }
  .ventana { font-size: 13px; color: #777; }
  .ventana span { color: #111; font-weight: 700; margin-left: 4px; }
  .feedback-btns { display: flex; gap: 6px; }
  .fb-btn { background: #fff; border: 1px solid #bbb; color: #444; font-family: Arial, sans-serif; font-size: 12px; padding: 5px 12px; border-radius: 3px; cursor: pointer; transition: all 0.15s; }
  .fb-btn:hover { border-color: #555; color: #111; }
  .fb-btn.active-usado { background: #edfaf3; border-color: #1a7a3c; color: #1a7a3c; font-weight: 700; }
  .fb-btn.active-descartado { background: #fdf0ef; border-color: #c0392b; color: #c0392b; font-weight: 700; }
  .fb-btn.active-pendiente { background: #fdf8ee; border-color: #b7770d; color: #b7770d; font-weight: 700; }

  .state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; gap: 16px; }
  .spinner { width: 32px; height: 32px; border: 2px solid #ccc; border-top-color: #c0392b; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .state-msg { font-size: 14px; color: #666; }
  .retry-btn { background: #fff; border: 1px solid #c0392b; color: #c0392b; font-family: Arial, sans-serif; font-size: 13px; padding: 8px 20px; border-radius: 3px; cursor: pointer; }
  .retry-btn:hover { background: #c0392b; color: #fff; }

  .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; font-size: 12px; color: #999; }
`;

function PredictionCard({ pred, onFeedback, feedback }) {
  const catColor = CATEGORY_COLORS[pred.categoria] || CATEGORY_COLORS.default;
  const estado = feedback[pred.tema];

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
          <button className={`fb-btn${estado === "usado" ? " active-usado" : ""}`} onClick={() => onFeedback(pred.tema, "usado")}>✓ Usado</button>
          <button className={`fb-btn${estado === "pendiente" ? " active-pendiente" : ""}`} onClick={() => onFeedback(pred.tema, "pendiente")}>⏳ Pendiente</button>
          <button className={`fb-btn${estado === "descartado" ? " active-descartado" : ""}`} onClick={() => onFeedback(pred.tema, "descartado")}>✕ Descartar</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [feedback, setFeedback] = useState({});

  const fetchData = useCallback(async () => {
    try {
      setError(false);
      const res = await fetch(`${API}/predicciones`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleFeedback = useCallback(async (tema, estado) => {
    setFeedback(prev => ({ ...prev, [tema]: estado }));
    try {
      await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema, estado }),
      });
    } catch {}
  }, []);

  const formatTime = (d) => d ? d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div>
            <div className="logo">BioBioChile</div>
            <div className="title">Predictor Editorial</div>
            <div className="subtitle">Temas y enfoques para la semana · Región del Biobío</div>
          </div>
          <div className="header-right">
            <div>
              <span className={`status-dot ${loading ? "loading" : error ? "error" : "live"}`} />
              <span className="status-text">{loading ? "Cargando..." : error ? "Sin conexión" : "En vivo"}</span>
            </div>
            {lastUpdate && <div className="last-update">Actualizado {formatTime(lastUpdate)}</div>}
            <button className="refresh-btn" onClick={fetchData}>↻ Actualizar</button>
          </div>
        </header>

        {loading && <div className="state-center"><div className="spinner" /><div className="state-msg">Consultando predicciones...</div></div>}
        {error && !loading && <div className="state-center"><div className="state-msg">No se pudo conectar al servidor</div><button className="retry-btn" onClick={fetchData}>Reintentar</button></div>}

        {!loading && !error && data && (
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
                <PredictionCard key={`${pred.tema}-${i}`} pred={pred} feedback={feedback} onFeedback={handleFeedback} />
              ))}
            </div>
          </>
        )}

        <div className="footer">BioBioChile Predictor · Actualización automática cada 5 minutos</div>
      </div>
    </>
  );
}
