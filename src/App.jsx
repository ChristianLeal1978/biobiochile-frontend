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

  body {
    background: #ffffff;
    color: #111111;
    font-family: 'Georgia', 'Times New Roman', serif;
    min-height: 100vh;
  }

  .app {
    max-width: 860px;
    margin: 0 auto;
    padding: 52px 28px 100px;
  }

  /* Header */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 48px;
    padding-bottom: 28px;
    border-bottom: 2px solid #111;
  }
  .logo {
    font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #c0392b;
    margin-bottom: 10px;
  }
  .title {
    font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
    font-size: 34px;
    font-weight: 900;
    color: #111111;
    line-height: 1.1;
  }
  .subtitle {
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #555;
    margin-top: 8px;
  }
  .header-right {
    text-align: right;
    flex-shrink: 0;
    margin-left: 24px;
  }
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 2s infinite;
  }
  .status-dot.live { background: #1a7a3c; }
  .status-dot.loading { background: #b7770d; animation: none; }
  .status-dot.error { background: #c0392b; animation: none; }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .status-text {
    font-family: Arial, sans-serif;
    font-size: 13px;
    color: #333;
  }
  .last-update {
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #777;
    margin-top: 5px;
  }
  .refresh-btn {
    margin-top: 10px;
    background: none;
    border: 1px solid #bbb;
    color: #444;
    font-family: Arial, sans-serif;
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .refresh-btn:hover { border-color: #111; color: #111; }

  /* Alert */
  .alert {
    background: #fff8f7;
    border: 1px solid #e0b0aa;
    border-left: 4px solid #c0392b;
    border-radius: 4px;
    padding: 20px 24px;
    margin-bottom: 40px;
  }
  .alert-label {
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #c0392b;
    margin-bottom: 8px;
  }
  .alert-text {
    font-size: 15px;
    color: #333;
    line-height: 1.6;
  }

  /* Semana */
  .week-label {
    font-family: Arial, sans-serif;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 24px;
  }

  /* Cards */
  .cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card {
    background: #ffffff;
    border: 1px solid #ddd;
    border-top: 4px solid var(--cat-color);
    border-radius: 4px;
    padding: 28px 32px;
    transition: box-shadow 0.2s;
  }
  .card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.08); }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }
  .card-left { flex: 1; }
  .card-category {
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--cat-color);
    margin-bottom: 8px;
  }
  .card-tema {
    font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
    font-size: 20px;
    font-weight: 900;
    color: #111;
    line-height: 1.25;
  }
  .card-confidence {
    text-align: right;
    flex-shrink: 0;
    margin-left: 24px;
  }
  .confidence-number {
    font-family: 'Arial Black', 'Helvetica Neue', sans-serif;
    font-size: 36px;
    font-weight: 900;
    color: var(--cat-color);
    line-height: 1;
  }
  .confidence-label {
    font-family: Arial, sans-serif;
    font-size: 11px;
    color: #888;
    margin-top: 3px;
  }

  .card-razon {
    font-size: 15px;
    color: #444;
    line-height: 1.65;
    margin-bottom: 22px;
    border-left: 2px solid #eee;
    padding-left: 14px;
  }

  /* Enfoques */
  .enfoques-label {
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #888;
    margin-bottom: 10px;
  }
  .enfoques {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 22px;
  }
  .enfoque-item {
    background: #f8f8f8;
    border: 1px solid #e8e8e8;
    border-radius: 3px;
    padding: 12px 16px;
  }
  .enfoque-tag {
    font-family: Arial, sans-serif;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #888;
    margin-bottom: 5px;
  }
  .enfoque-titular {
    font-size: 15px;
    color: #111;
    line-height: 1.45;
  }

  /* Ventana y feedback */
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 18px;
    border-top: 1px solid #eee;
    flex-wrap: wrap;
    gap: 10px;
  }
  .ventana {
    font-family: Arial, sans-serif;
    font-size: 13px;
    color: #888;
  }
  .ventana span {
    color: #333;
    font-weight: 700;
    margin-left: 4px;
  }
  .feedback-btns {
    display: flex;
    gap: 8px;
  }
  .fb-btn {
    background: #fff;
    border: 1px solid #ccc;
    color: #555;
    font-family: Arial, sans-serif;
    font-size: 13px;
    padding: 6px 14px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .fb-btn:hover { border-color: #555; color: #111; }
  .fb-btn.active-usado { background: #edfaf3; border-color: #1a7a3c; color: #1a7a3c; font-weight: 700; }
  .fb-btn.active-descartado { background: #fdf0ef; border-color: #c0392b; color: #c0392b; font-weight: 700; }
  .fb-btn.active-pendiente { background: #fdf8ee; border-color: #b7770d; color: #b7770d; font-weight: 700; }

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
    border: 2px solid #eee;
    border-top-color: #c0392b;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .state-msg {
    font-family: Arial, sans-serif;
    font-size: 15px;
    color: #777;
  }
  .retry-btn {
    background: #fff;
    border: 1px solid #c0392b;
    color: #c0392b;
    font-family: Arial, sans-serif;
    font-size: 14px;
    padding: 8px 22px;
    border-radius: 3px;
    cursor: pointer;
  }
  .retry-btn:hover { background: #c0392b; color: #fff; }

  /* Footer */
  .footer {
    margin-top: 60px;
    padding-top: 24px;
    border-top: 1px solid #eee;
    text-align: center;
    font-family: Arial, sans-serif;
    font-size: 12px;
    color: #bbb;
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
          Ventana óptima <span>{pred.ventana_optima}</span>
        </div>
        <div className="feedback-btns">
          <button
            className={`fb-btn${estado === "usado" ? " active-usado" : ""}`}
            onClick={() => onFeedback(pred.tema, "usado")}
          >✓ Usado</button>
          <button
            className={`fb-btn${estado === "pendiente" ? " active-pendiente" : ""}`}
            onClick={() => onFeedback(pred.tema, "pendiente")}
          >⏳ Pendiente</button>
          <button
            className={`fb-btn${estado === "descartado" ? " active-descartado" : ""}`}
            onClick={() => onFeedback(pred.tema, "descartado")}
          >✕ Descartar</button>
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
      // silencioso
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
                {loading ? "Cargando..." : error ? "Sin conexión" : "En vivo"}
              </span>
            </div>
            {lastUpdate && (
              <div className="last-update">Actualizado {formatTime(lastUpdate)}</div>
            )}
            <button className="refresh-btn" onClick={fetchData}>↻ Actualizar</button>
          </div>
        </header>

        {loading && (
          <div className="state-center">
            <div className="spinner" />
            <div className="state-msg">Consultando predicciones...</div>
          </div>
        )}

        {error && !loading && (
          <div className="state-center">
            <div className="state-msg">No se pudo conectar al servidor</div>
            <button className="retry-btn" onClick={fetchData}>Reintentar</button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {alerta && (
              <div className="alert">
                <div className="alert-label">⚡ Alerta editorial</div>
                <div className="alert-text">{alerta}</div>
              </div>
            )}

            {semana && (
              <div className="week-label">Semana {semana} · {data.contexto?.temporada}</div>
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
          BioBioChile Predictor · Actualización automática cada 5 minutos
        </div>
      </div>
    </>
  );
}
