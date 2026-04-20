import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import ArtistFactory from './pages/ArtistFactory.jsx';
import Studio from './pages/Studio.jsx';
import Marketing from './pages/Marketing.jsx';
import Catalog from './pages/Catalog.jsx';
import { api } from './services/api.js';

// Color palette matching the original design
export const C = {
  bg: "#07070f",
  surface: "#0d0d1a",
  surface2: "#121224",
  border: "#1a1a2e",
  gold: "#e8b84b",
  cyan: "#00d4ff",
  green: "#00ff88",
  red: "#ff4466",
  accent: "#a855f7",
  text: "#f0f0fa",
  muted: "#555580",
};

export const S = {
  input: {
    background: "#0d0d1a",
    border: "1px solid #1a1a2e",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#f0f0fa",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    color: "#555580",
    letterSpacing: "2px",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
    fontWeight: 500,
  },
  card: {
    background: "#0d0d1a",
    border: "1px solid #1a1a2e",
    borderRadius: "12px",
    padding: "24px",
  },
  mono: { fontFamily: "'JetBrains Mono', monospace" },
  display: { fontFamily: "'Bebas Neue', cursive" },
  body: { fontFamily: "'DM Sans', sans-serif" },
};

// UI Components
export function Btn({ children, onClick, disabled, color = C.gold, textColor = "#000", full = false, outline = false, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: outline ? "transparent" : disabled ? C.surface2 : color,
        color: outline ? C.muted : disabled ? C.muted : textColor,
        border: outline ? `1px solid ${C.border}` : "none",
        borderRadius: "8px",
        padding: "11px 22px",
        fontFamily: "'Bebas Neue', cursive",
        fontSize: "17px",
        letterSpacing: "2px",
        cursor: disabled ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        transition: "all .15s",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Tag({ children, color }) {
  return (
    <span style={{
      background: color + "18",
      color,
      borderRadius: "4px",
      padding: "3px 8px",
      ...S.mono,
      fontSize: "10px",
      textTransform: "uppercase",
      letterSpacing: "1px",
    }}>
      {children}
    </span>
  );
}

export function Field({ label: labelText, value, onChange, placeholder, multi = false, type = "text" }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={S.label}>{labelText}</label>
      {multi ? (
        <textarea
          style={{ ...S.input, resize: "vertical", minHeight: "80px" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : type === "select" ? (
        <select style={{ ...S.input, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23555' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select...</option>
        </select>
      ) : (
        <input
          type={type}
          style={S.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export function PageHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{ ...S.display, fontSize: "52px", color: C.text, letterSpacing: "2px", lineHeight: 1 }}>
        {title}
      </div>
      <div style={{ ...S.body, fontSize: "14px", color: C.muted, marginTop: "6px" }}>
        {sub}
      </div>
    </div>
  );
}

// Main App
function App() {
  const [tab, setTab] = useState("dashboard");
  const [artists, setArtists] = useState([]);
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  const nav = [
    ["dashboard", "◈", "Dashboard"],
    ["factory", "⬡", "Artist Factory"],
    ["studio", "◉", "AI Studio"],
    ["marketing", "◆", "Marketing"],
    ["catalog", "≡", "Catalog"],
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [artistsData, releasesData] = await Promise.all([
        api.getArtists(),
        api.getReleases()
      ]);
      setArtists(artistsData);
      setReleases(releasesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setLoading(false);
  }

  function handleArtistAdded(artist) {
    setArtists(prev => [...prev, artist]);
  }

  function handleReleaseAdded(release) {
    setReleases(prev => [...prev, release]);
  }

  if (loading) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...S.display, fontSize: "32px", color: C.gold, letterSpacing: "3px" }}>
          LOADING SOUND EMPIRE...
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", color: C.text }}>
      {/* Sidebar */}
      <div style={{ width: 210, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "24px 20px 18px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ ...S.display, fontSize: "20px", color: C.gold, letterSpacing: "3px", lineHeight: 1 }}>
            SOUND EMPIRE
          </div>
          <div style={{ ...S.mono, fontSize: "8px", color: C.muted, letterSpacing: "2px", marginTop: "5px" }}>
            AGI RECORD LABEL · V1
          </div>
        </div>
        <nav style={{ padding: "14px 10px", flex: 1 }}>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 12px",
                background: tab === id ? "rgba(232,184,75,.1)" : "transparent",
                border: "none",
                borderRadius: "8px",
                color: tab === id ? C.gold : C.muted,
                ...S.body,
                fontSize: "13px",
                fontWeight: tab === id ? 500 : 400,
                cursor: "pointer",
                textAlign: "left",
                marginBottom: "2px",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 13 }}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ ...S.mono, fontSize: "8px", color: C.muted + "88", letterSpacing: "1px" }}>
            DOLLAR DOUBLE EMPIRE
          </div>
          <div style={{ ...S.mono, fontSize: "8px", color: C.muted + "66", letterSpacing: "1px", marginTop: "3px" }}>
            99.99% AGI POWERED
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "44px 48px", overflowY: "auto" }}>
        {tab === "dashboard" && <Dashboard artists={artists} releases={releases} onRefresh={loadData} />}
        {tab === "factory" && <ArtistFactory artists={artists} onArtistAdded={handleArtistAdded} />}
        {tab === "studio" && <Studio artists={artists} />}
        {tab === "marketing" && <Marketing artists={artists} />}
        {tab === "catalog" && <Catalog artists={artists} releases={releases} onReleaseAdded={handleReleaseAdded} />}
      </div>
    </div>
  );
}

export default App;
