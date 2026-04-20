import { useState } from 'react';
import { C, S, Btn, Field, PageHeader } from '../App.jsx';
import { api } from '../services/api.js';

function OutputBlock({ label, children }) {
  return (
    <div style={{ marginBottom: 14, padding: 16, background: C.surface2, borderRadius: 8 }}>
      <div style={{ ...S.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>{label.toUpperCase()}</div>
      <div style={{ ...S.body, fontSize: 13, color: C.text, lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

export default function Marketing({ artists }) {
  const [artistId, setArtistId] = useState(artists[0]?.id || "");
  const [type, setType] = useState("tiktok");
  const [ctx, setCtx] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const artist = artists.find(a => a.id === artistId);
  const types = [["tiktok", "TikTok"], ["instagram", "Instagram"], ["pitch", "Playlist Pitch"], ["press", "Press Release"], ["bio", "Bio"]];

  async function generate() {
    if (!artist) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.generateMarketing({
        type,
        artistId,
        context: ctx
      });
      setResult({ type, data: response.content });
    } catch (err) {
      setError("Failed: " + err.message);
    }
    setLoading(false);
  }

  function copy(text) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="MARKETING SUITE" sub="AI-generated content for every platform and purpose" />
      
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
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
              <label style={S.label}>Content Type</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {types.map(([v, l]) => (
                  <button key={v} onClick={() => setType(v)} style={{
                    background: type === v ? "rgba(168,85,247,.15)" : "transparent",
                    color: type === v ? C.accent : C.muted,
                    border: `1px solid ${type === v ? C.accent : C.border}`,
                    borderRadius: 6, padding: "8px 14px",
                    ...S.body, fontSize: 13, cursor: "pointer", textAlign: "left", transition: "all .15s",
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <Field label="Context (optional)" value={ctx} onChange={setCtx} placeholder="New single 'Chrome Heart' drops Friday…" multi />
            {error && <div style={{ ...S.body, fontSize: "12px", color: C.red, marginTop: 10 }}>{error}</div>}
            <div style={{ marginTop: 18 }}>
              <Btn onClick={generate} disabled={loading} full color={C.accent} textColor="#fff">
                {loading ? "WRITING…" : "GENERATE CONTENT"}
              </Btn>
            </div>
          </div>
        </div>

        {/* Output */}
        <div style={{ ...S.card, minHeight: 420 }}>
          {!result && !loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400 }}>
              <div style={{ ...S.display, fontSize: "26px", color: C.muted, letterSpacing: "2px" }}>AWAITING INPUT</div>
            </div>
          )}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", minHeight: 400 }}>
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 20px", width: "40px", height: "40px", borderWidth: "3px" }} />
                <div style={{ ...S.display, fontSize: "26px", color: C.accent, letterSpacing: "2px" }}>CLAUDE IS WRITING…</div>
              </div>
            </div>
          )}
          {result && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <div style={{ ...S.display, fontSize: "22px", color: C.text, letterSpacing: "1px" }}>
                  {types.find(t => t[0] === result.type)?.[1].toUpperCase()} · {artist?.name}
                </div>
                <button onClick={() => copy(JSON.stringify(result.data, null, 2))} style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                  padding: "6px 14px", color: copied ? C.green : C.muted,
                  ...S.mono, fontSize: 10, cursor: "pointer", letterSpacing: 1,
                }}>{copied ? "COPIED!" : "COPY ALL"}</button>
              </div>

              {result.type === "tiktok" && (
                <div>
                  {result.data.captions?.map((cap, i) => (
                    <div key={i} style={{ marginBottom: 14, padding: 16, background: C.surface2, borderRadius: 8, borderLeft: `3px solid ${[C.gold, C.cyan, C.accent][i]}` }}>
                      <div style={{ ...S.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>OPTION {i + 1}</div>
                      <div style={{ ...S.body, fontSize: 13, color: C.text, lineHeight: 1.65 }}>{cap}</div>
                    </div>
                  ))}
                  <OutputBlock label="Best Hook">{result.data.bestHook}</OutputBlock>
                  <OutputBlock label="Sound Strategy">{result.data.soundAdvice}</OutputBlock>
                </div>
              )}
              {result.type === "instagram" && result.data && (
                <div>
                  <OutputBlock label="Caption">{result.data.caption}</OutputBlock>
                  <OutputBlock label="Story Idea">{result.data.storyIdea}</OutputBlock>
                  <OutputBlock label="Reel Idea">{result.data.reelIdea}</OutputBlock>
                  <OutputBlock label="Call to Action">{result.data.cta}</OutputBlock>
                </div>
              )}
              {result.type === "pitch" && result.data && (
                <div>
                  <div style={{ marginBottom: 14, padding: "12px 16px", background: C.surface2, borderRadius: 8 }}>
                    <div style={{ ...S.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>SUBJECT LINE</div>
                    <div style={{ ...S.body, fontSize: 15, color: C.text, fontWeight: 600 }}>{result.data.subject}</div>
                  </div>
                  <OutputBlock label="Email Body"><span style={{ whiteSpace: "pre-line" }}>{result.data.body}</span></OutputBlock>
                </div>
              )}
              {result.type === "press" && result.data && (
                <div>
                  <div style={{ ...S.display, fontSize: 28, color: C.text, letterSpacing: 1, lineHeight: 1.1, marginBottom: 6 }}>{result.data.headline}</div>
                  <div style={{ ...S.body, fontSize: 15, color: C.muted, marginBottom: 18 }}>{result.data.subheadline}</div>
                  <div style={{ ...S.body, fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 18 }}>{result.data.body}</div>
                </div>
              )}
              {result.type === "bio" && result.data && (
                <div>
                  <OutputBlock label="Short (platform)">{result.data.short}</OutputBlock>
                  <OutputBlock label="Medium (socials)">{result.data.medium}</OutputBlock>
                  <OutputBlock label="Long (EPK/press)">{result.data.long}</OutputBlock>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
