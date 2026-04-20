import { useState } from 'react';
import { C, S, Btn, Field, PageHeader } from '../App.jsx';
import { api } from '../services/api.js';

function OutputBlock({ label, children }) {
  return (
    <div style={{ marginBottom: 16, padding: 16, background: C.surface2, borderRadius: 8 }}>
      <div style={{ ...S.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>{label.toUpperCase()}</div>
      <div style={{ ...S.body, fontSize: 13, color: C.text, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Studio({ artists }) {
  const [artistId, setArtistId] = useState(artists[0]?.id || "");
  const [mode, setMode] = useState("full");
  const [vibe, setVibe] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const artist = artists.find(a => a.id === artistId);

  async function generate() {
    if (!artist || !vibe.trim()) {
      setError("Select an artist and enter a vibe");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.generateSong({
        mode,
        artistId,
        vibe,
        saveToCatalog: true
      });
      setResult(response.song);
    } catch (err) {
      setError("Failed: " + err.message);
    }
    setLoading(false);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="AI STUDIO" sub="Generate full songs, viral hooks, and strategic track concepts" />
      
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 24 }}>
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={S.card}>
            <div style={{ ...S.display, fontSize: "18px", color: C.text, letterSpacing: "1px", marginBottom: "18px" }}>
              CONTROLS
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Artist</label>
              <select 
                style={{ ...S.input, appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23555' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }} 
                value={artistId} 
                onChange={e => setArtistId(e.target.value)}
              >
                {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={S.label}>Mode</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[["full", "Full Song"], ["hook", "Hook"], ["concept", "Concept"]].map(([v, l]) => (
                  <button key={v} onClick={() => setMode(v)} style={{
                    flex: 1, background: mode === v ? C.gold : "transparent",
                    color: mode === v ? "#000" : C.muted,
                    border: `1px solid ${mode === v ? C.gold : C.border}`,
                    borderRadius: 6, padding: "8px 4px",
                    ...S.mono, fontSize: "9px", letterSpacing: 1, cursor: "pointer", textTransform: "uppercase",
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <Field 
              label="Track Vibe / Theme" 
              value={vibe} 
              onChange={setVibe} 
              placeholder="Late night drive, can't stop thinking about someone…" 
              multi 
            />
            {error && <div style={{ ...S.body, fontSize: "12px", color: C.red, marginTop: 10 }}>{error}</div>}
            <div style={{ marginTop: 18 }}>
              <Btn onClick={generate} disabled={loading} full color={C.cyan} textColor="#000">
                {loading ? "GENERATING…" : "GENERATE"}
              </Btn>
            </div>
          </div>
          
          {artist && (
            <div style={{ ...S.card, borderColor: artist.brand_color + "55" }}>
              <div style={{ ...S.display, fontSize: "20px", color: C.text }}>{artist.name}</div>
              <div style={{ ...S.body, fontSize: "11px", color: artist.brand_color, marginBottom: "8px" }}>{artist.genre}</div>
              <div style={{ ...S.body, fontSize: "12px", color: C.muted, lineHeight: 1.5 }}>{artist.aesthetic}</div>
            </div>
          )}
        </div>

        {/* Output */}
        <div style={{ ...S.card, minHeight: 420 }}>
          {!result && !loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400 }}>
              <div style={{ ...S.display, fontSize: "26px", color: C.muted, letterSpacing: "2px" }}>READY TO RECORD</div>
            </div>
          )}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400 }}>
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 20px", width: "40px", height: "40px", borderWidth: "3px" }} />
                <div style={{ ...S.display, fontSize: "26px", color: C.cyan, letterSpacing: "2px" }}>WRITING…</div>
              </div>
            </div>
          )}
          {result && mode === "full" && (
            <div>
              <div style={{ ...S.display, fontSize: "40px", color: C.text, letterSpacing: "2px", marginBottom: 4 }}>{result.title}</div>
              <div style={{ ...S.mono, fontSize: "11px", color: C.muted, marginBottom: 20 }}>
                {result.bpm} BPM · {result.key} · {result.mood}
              </div>
              <div style={{ padding: "12px 16px", background: C.surface2, borderRadius: 8, borderLeft: `3px solid ${C.gold}`, marginBottom: 20 }}>
                <span style={{ ...S.mono, fontSize: "9px", color: C.gold, letterSpacing: 2 }}>PRODUCTION  </span>
                <span style={{ ...S.body, fontSize: "13px", color: C.text }}>{result.productionNotes}</span>
              </div>
              {[["VERSE 1", result.verse1], ["PRE-CHORUS", result.prechorus], ["CHORUS", result.chorus], ["VERSE 2", result.verse2], ["BRIDGE", result.bridge]].filter(([_, v]) => v).map(([l, v]) => (
                <div key={l} style={{ marginBottom: 18 }}>
                  <div style={{ ...S.mono, fontSize: "9px", color: C.muted, letterSpacing: "2px", marginBottom: 6 }}>{l}</div>
                  <div style={{ ...S.body, fontSize: "14px", color: C.text, lineHeight: 1.85, whiteSpace: "pre-line", padding: "12px 16px", background: C.surface2, borderRadius: 8 }}>{v}</div>
                </div>
              ))}
              <div style={{ padding: "12px 16px", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", borderRadius: 8, marginTop: 8 }}>
                <div style={{ ...S.mono, fontSize: "9px", color: C.cyan, letterSpacing: 2, marginBottom: 6 }}>SUNO AI PROMPT</div>
                <div style={{ ...S.mono, fontSize: "12px", color: C.text }}>{result.promptForSuno}</div>
              </div>
            </div>
          )}
          {result && mode === "hook" && (
            <div>
              <div style={{ ...S.display, fontSize: "40px", color: C.text, letterSpacing: "2px", marginBottom: 20 }}>{result.title}</div>
              <div style={{ ...S.body, fontSize: "18px", color: C.text, lineHeight: 1.85, whiteSpace: "pre-line", padding: "20px 24px", background: C.surface2, borderRadius: 8, marginBottom: 20, borderLeft: `4px solid ${C.cyan}` }}>
                {result.hook}
              </div>
              <OutputBlock label="Why It Goes Viral">{result.hookExplanation}</OutputBlock>
              <OutputBlock label="TikTok Clip Concept">{result.tiktokClip}</OutputBlock>
              <div style={{ padding: "12px 16px", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", borderRadius: 8 }}>
                <div style={{ ...S.mono, fontSize: "9px", color: C.cyan, letterSpacing: 2, marginBottom: 6 }}>SUNO AI PROMPT</div>
                <div style={{ ...S.mono, fontSize: "12px", color: C.text }}>{result.promptForSuno}</div>
              </div>
            </div>
          )}
          {result && mode === "concept" && (
            <div>
              <div style={{ ...S.display, fontSize: "40px", color: C.text, letterSpacing: "2px", marginBottom: 24 }}>{result.title}</div>
              <OutputBlock label="Track Concept">{result.concept}</OutputBlock>
              <OutputBlock label="Target Playlist">{result.targetPlaylist}</OutputBlock>
              <OutputBlock label="Sync Opportunities">{Array.isArray(result.syncOpportunities) ? result.syncOpportunities.join(' • ') : result.syncOpportunities}</OutputBlock>
              <OutputBlock label="Marketing Angle">{result.marketingAngle}</OutputBlock>
              <div style={{ padding: "12px 16px", background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.2)", borderRadius: 8 }}>
                <div style={{ ...S.mono, fontSize: "9px", color: C.cyan, letterSpacing: 2, marginBottom: 6 }}>SUNO AI PROMPT</div>
                <div style={{ ...S.mono, fontSize: "12px", color: C.text }}>{result.promptForSuno}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
