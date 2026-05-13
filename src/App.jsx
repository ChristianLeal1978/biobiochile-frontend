import { useState, useEffect, useCallback } from "react";

const API = "https://web-production-e5d51.up.railway.app";
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutos

const CATEGORY_COLORS = {
  "Política regional": "#e8534a",
  "Economía / precios": "#e8a83a",
  "Clima / medio ambiente": "#4ab8e8",
  "Fútbol": "#4ae87a",
  "Salud": "#b44ae8",
  default: "#888",
};

const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #080810;
    color: #e8e8f0;
    font-family: 'DM Mono', monospace;
    min-height: 100vh;
  }

  .app {
    max-width: 900px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 56px;
    padding-bottom: 32px;
    border-bottom: 1px solid #1a1a2e;
  }
  .header-left {}
  .logo {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #e8534a;
    margin-bottom: 8px;
  }
  .title {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: #f0f0ff;
    line-height: 1.1;
  }
  .subtitle {
    font-size: 11px;
    color: #444;
    margin-top: 6px;
    letter-spacing: 0.05em;
  }
  .header-right {
    text-align: right;
  }
  .status-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 2s infinite;
  }
  .status-dot.live { background: #4ae87a; }
  .status-dot.loading { background: #e8a83a; animation: none; }
  .status-dot.error { background: #e8534a; animation: none; }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  .status-text {
    font-size: 11px;
    color: #555;
    letter-spacing: 0.05em;
  }
  .last-update {
    font-size: 10px;
    color: #333;
    margin-top: 4px;
  }
  .refresh-btn {
    margin-top: 10px;
    background: none;
    border: 1px solid #1e1e35;
    color: #555;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    padding: 5px 12px;
    border-radius: 4px;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }
  .refresh-btn:hover { border-color: #e8534a; color: #e8534a; }

  /* Alert */
  .alert {
    background: linear-gradient(135deg, #1a0a08, #120808);
    border: 1px solid #3a1510;
    border-left: 3px solid #e8534a;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 40px;
  }
  .alert-label {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #e8534a;
    margin-bottom: 8px;
  }
  .alert-text {
    font-size: 13px;
    color: #d0b0a8;
    line-height: 1.6;
  }

  /* Semana */
  .week-label {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #333;
    margin-bottom: 24px;
  }

  /* Cards */
  .cards {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .card {
    background: #0c0c18;
    border: 1px solid #141428;
    border-radius: 10px;
    padding: 28px;
    transition: border-color 0.2s;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--cat-color);
    border-radius: 2px 0 0 2px;
  }
  .card:hover { border-color: #222240; }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .card-left { flex: 1; }
  .card-category {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--cat-color);
    margin-bottom: 6px;
  }
  .card-tema {
    font-family: 'Syne', sans-serif;
    font-size: 17px;
    font-weight: 700;
    color: #f0f0ff;
    line-height: 1.3;
  }
  .card-confidence {
    text-align: right;
    flex-shrink: 0;
    margin-left: 20px;
  }
  .confidence-number {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--cat-color);
    line-height: 1;
  }
  .confidence-label {
    font-size: 9px;
    color: #333;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  .card-razon {
    font-size: 12px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  /* Enfoques */
  .enfoques-label {
    font-size: 9px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #333;
    margin-bottom: 10px;
  }
  .enfoques {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
  .enfoque-item {
    background: #080810;
    border: 1px solid #111124;
    border-radius: 6px;
    padding: 12px 16px;
  }
  .enfoque-tag {
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 4px;
  }
  .enfoque-titular {
    font-size: 13px;
    color: #c0c0d8;
    line-height: 1.4;
  }

  /* Ventana y feedback */
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid #0e0e20;
  }
  .ventana {
    font-size: 10px;
    color: #333;
    letter-spacing: 0.05em;
  }
  .ventana span {
    color: #555;
    margin-left: 4px;
  }
  .feedback-btns {
    display: flex;
    gap: 6px;
  }
  .fb-btn {
    background: none;
    border: 1px solid #1a1a30;
    color: #444;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    letter-spacing: 0.05em;
    transition: all 0.2s;
  }
  .fb-btn:hover { border-color: #333; color: #888; }
  .fb-btn.active-usado { border-color: #4ae87a; color: #4ae87a; }
  .fb-btn.active-descartado { border-color: #e8534a; color: #e8534a; }
  .fb-btn.active-pendiente { border-color: #e8a83a; color: #e8a83a; }

  /* Loading / Error */
  .state-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 16px;
  }
  .spinner {
    width: 32px; height: 32px;
    border: 2px solid #1a1a2e;
    border-top-color: #e8534a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .state-msg {
    font-size: 12px;
    color: #444;
    letter-spacing: 0.05em;
  }
  .retry-btn {
    background: none;
    border: 1px solid #e8534a;
    color: #e8534a;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
  }

  /* Footer */
  .footer {
    margin-top: 60px;
    text-align: center;
    font-size: 10px;
    color: #1e1e35;
    letter-spacing: 0.08em;
  }
`;

function PredictionCard({ pred, onFeedback, feedback }) {
  const catColor = CATEGORY_COLORS[pred.categoria] || CATEGORY_COLORS.default;
  const estado = feedback[pred.tema];

  return (
    <div className="card" style={{ "--cat-color": catColor }}>
      <div className="card-top">
        <div className="card-left">
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
        <div className="ventana">
          ventana óptima <span>{pred.ventana_optima}</span>
        </div>
        <div className="feedback-btns">
          <button
            className={`fb-btn${estado === "usado" ? " active-usado" : ""}`}
            onClick={() => onFeedback(pred.tema, "usado")}
          >✓ usado</button>
          <button
            className={`fb-btn${estado === "pendiente" ? " active-pendiente" : ""}`}
            onClick={() => onFeedback(pred.tema, "pendiente")}
          >⏳ pendiente</button>
          <button
            className={`fb-btn${estado === "descartado" ? " active-descartado" : ""}`}
            onClick={() => onFeedback(pred.tema, "descartado")}
          >✕ descartar</button>
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
      if (!res.ok) throw new Error("Sin datos");
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
    } catch {
      // silencioso — la UI ya mostró el cambio
    }
  }, []);

  const formatTime = (d) => d
    ? d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
    : "";

  const predicciones = data?.predicciones || [];
  const alerta = data?.alerta;
  const semana = data?.contexto?.semana_del_ano;

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <header className="header">
          <div className="header-left">
            <div className="logo">BioBioChile</div>
            <div className="title">Predictor Editorial</div>
            <div className="subtitle">Temas y enfoques para la semana · Región del Biobío</div>
          </div>
          <div className="header-right">
            <div>
              <span className={`status-dot ${loading ? "loading" : error ? "error" : "live"}`} />
              <span className="status-text">
                {loading ? "cargando" : error ? "sin conexión" : "en vivo"}
              </span>
            </div>
            {lastUpdate && (
              <div className="last-update">actualizado {formatTime(lastUpdate)}</div>
            )}
            <button className="refresh-btn" onClick={fetchData}>↻ actualizar</button>
          </div>
        </header>

        {loading && (
          <div className="state-center">
            <div className="spinner" />
            <div className="state-msg">consultando predicciones...</div>
          </div>
        )}

        {error && !loading && (
          <div className="state-center">
            <div className="state-msg">no se pudo conectar al servidor</div>
            <button className="retry-btn" onClick={fetchData}>reintentar</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {alerta && (
              <div className="alert">
                <div className="alert-label">⚡ alerta editorial</div>
                <div className="alert-text">{alerta}</div>
              </div>
            )}

            {semana && (
              <div className="week-label">semana {semana} · {data.contexto?.temporada}</div>
            )}

            <div className="cards">
              {predicciones.map((pred, i) => (
                <PredictionCard
                  key={`${pred.tema}-${i}`}
                  pred={pred}
                  feedback={feedback}
                  onFeedback={handleFeedback}
                />
              ))}
            </div>
          </>
        )}

        <div className="footer">
          BioBioChile Predictor · actualización automática cada 5 min · datos reales
        </div>
      </div>
    </>
  );
}
