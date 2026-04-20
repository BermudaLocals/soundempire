import { useState } from 'react';
import { C, S, Btn, Field, PageHeader } from '../App.jsx';
import { api } from '../services/api.js';

function ArtistCard({ artist }) {
  return (
    <div style={{ ...S.card, borderColor: artist.brand_color + "55", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: artist.brand_color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <div style={{ ...S.display, fontSize: "22px", color: C.text }}>{artist.name}</div>
          <div style={{ ...S.body, fontSize: "11px", color: artist.brand_color }}>{artist.genre}</div>
        </div>
      </div>
      <div style={{ ...S.body, fontSize: "12px", color: C.muted, lineHeight: 1.5 }}>
        {(artist.bio || "").slice(0, 80)}…
      </div>
    </div>
  );
}

export default function ArtistFactory({ artists, onArtistAdded }) {
  const [form, setForm] = useState({ genre: "", influences: "", vibe: "", audience: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!form.genre.trim()) {
      setError("Genre is required");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.createArtist({
        aiGenerate: true,
        genre: form.genre,
        influences: form.influences,
        vibe: form.vibe,
        audience: form.audience
      });
      setResult(response.generated || response.artist);
      onArtistAdded(response.artist);
    } catch (err) {
      setError("Failed: " + err.message);
    }
    setLoading(false);
  }

  function addToRoster() {
    setResult(null);
    setForm({ genre: "", influences: "", vibe: "", audience: "" });
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="ARTIST FACTORY" sub="Generate new AI artist personas powered by Claude" />
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>
        {/* Input Form */}
        <div style={S.card}>
          <div style={{ ...S.display, fontSize: "20px", color: C.text, letterSpacing: "1px", marginBottom: "22px" }}>
            ARTIST DNA
          </div>
          <Field
            label="Genre *"
            value={form.genre}
            onChange={v => setForm(f => ({ ...f, genre: v }))}
            placeholder="Dark R&B, Drill, Ambient, Hyperpop…"
          />
          <Field
            label="Influences"
            value={form.influences}
            onChange={v => setForm(f => ({ ...f, influences: v }))}
            placeholder="The Weeknd, Burial, Bladee…"
          />
          <Field
            label="Aesthetic / Vibe"
            value={form.vibe}
            onChange={v => setForm(f => ({ ...f, vibe: v }))}
            placeholder="Post-apocalyptic, dreamy, raw…"
          />
          <Field
            label="Target Audience"
            value={form.audience}
            onChange={v => setForm(f => ({ ...f, audience: v }))}
            placeholder="Gen Z TikTok, study playlists, gym…"
          />
          {error && <div style={{ ...S.body, fontSize: "12px", color: C.red, marginTop: "12px" }}>{error}</div>}
          <div style={{ marginTop: "22px" }}>
            <Btn onClick={generate} disabled={loading} full>
              {loading ? "CLAUDE IS CREATING…" : "GENERATE ARTIST"}
            </Btn>
          </div>
        </div>

        {/* Result Display */}
        <div>
          {!result && !loading && (
            <div style={{ ...S.card, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
              <div style={{ ...S.display, fontSize: "26px", color: C.muted, letterSpacing: "2px", textAlign: "center" }}>
                ARTIST WILL APPEAR HERE
              </div>
            </div>
          )}
          {loading && (
            <div style={{ ...S.card, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
              <div style={{ textAlign: "center" }}>
                <div className="spinner" style={{ margin: "0 auto 20px", width: "40px", height: "40px", borderWidth: "3px" }} />
                <div style={{ ...S.display, fontSize: "26px", color: C.gold, letterSpacing: "2px" }}>
                  CLAUDE IS CREATING…
                </div>
              </div>
            </div>
          )}
          {result && (
            <div style={{ ...S.card, borderColor: result.brandColor + "66", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: result.brandColor }} />
              <div style={{ ...S.display, fontSize: "38px", color: C.text, letterSpacing: "2px", marginBottom: "4px" }}>
                {result.name}
              </div>
              <div style={{ ...S.body, fontSize: "12px", color: result.brandColor, marginBottom: "20px" }}>
                {result.genre} · {result.subgenre}
              </div>
              {[
                ["Bio", result.bio],
                ["Unique Hook", result.uniqueHook],
                ["Visual Aesthetic", result.aesthetic],
                ["Voice Style", result.voiceStyle],
                ["TikTok Strategy", result.tiktokAngle],
              ].map(([l, v]) => (
                <div key={l} style={{ marginBottom: "14px" }}>
                  <div style={{ ...S.mono, fontSize: "9px", color: C.muted, letterSpacing: "2px", marginBottom: "5px" }}>
                    {l.toUpperCase()}
                  </div>
                  <div style={{ ...S.body, fontSize: "13px", color: C.text, lineHeight: 1.55 }}>
                    {v}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "16px" }}>
                <Btn onClick={addToRoster} full color={result.brandColor}>ADD ANOTHER</Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Current Roster */}
      {artists.length > 0 && (
        <div style={{ marginTop: "44px" }}>
          <div style={{ ...S.mono, fontSize: "13px", color: C.muted, letterSpacing: "2px", marginBottom: "16px" }}>
            CURRENT ROSTER ({artists.length})
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}
