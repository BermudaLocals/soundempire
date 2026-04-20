import { useState } from 'react';
import { C, S, Btn, Tag, PageHeader } from '../App.jsx';
import { api } from '../services/api.js';

function formatMoney(n) {
  return "$" + (n || 0).toLocaleString();
}

function formatNumber(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export default function Catalog({ artists, releases, onReleaseAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", artist_id: artists[0]?.id || "", type: "single", release_date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function addRelease() {
    if (!form.title.trim() || !form.artist_id || !form.release_date) {
      setError("Title, artist, and release date are §§secret(POSTGRESQL://NEONDB_OWNER:NPG_NX6JVZR2QMYG@EP-FALLING-PAPER-A62FLHPD.US-WEST-2.AWS.NEON.TECH/NEONDB?SSLMODE)d");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const response = await api.createRelease(form);
      onReleaseAdded(response.release);
      setShowForm(false);
      setForm({ title: "", artist_id: artists[0]?.id || "", type: "single", release_date: "" });
    } catch (err) {
      setError("Failed: " + err.message);
    }
    setLoading(false);
  }

  const stats = {
    totalTracks: releases.length,
    liveTracks: releases.filter(r => r.status === "live").length,
    scheduled: releases.filter(r => r.status === "scheduled").length,
    totalStreams: releases.reduce((s, r) => s + (r.streams || 0), 0),
    totalRevenue: releases.reduce((s, r) => s + (r.revenue || 0), 0),
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="CATALOG MANAGER" sub="Complete release schedule and performance tracking" />
      
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          ["Total Releases", stats.totalTracks, C.text],
          ["Live Now", stats.liveTracks, C.green],
          ["Scheduled", stats.scheduled, C.accent],
          ["Total Streams", formatNumber(stats.totalStreams), C.cyan],
          ["Total Revenue", formatMoney(stats.totalRevenue), C.gold],
        ].map(([l, v, c]) => (
          <div key={l} style={{ ...S.card, padding: "16px 20px", textAlign: "center" }}>
            <div style={{ ...S.mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>{l.toUpperCase()}</div>
            <div style={{ ...S.display, fontSize: "28px", color: c, lineHeight: 1 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div style={{ ...S.mono, fontSize: 13, color: C.muted, letterSpacing: 2 }}>RELEASE SCHEDULE ({releases.length})</div>
        <Btn onClick={() => setShowForm(!showForm)} color={C.green} textColor="#000">
          {showForm ? "CANCEL" : "+ ADD RELEASE"}
        </Btn>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ ...S.card, marginBottom: 22, borderColor: C.green + "66" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "end" }}>
            <div>
              <label style={S.label}>Release Title</label>
              <input style={S.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Track name..." />
            </div>
            <div>
              <label style={S.label}>Artist</label>
              <select style={S.input} value={form.artist_id} onChange={e => setForm(f => ({ ...f, artist_id: e.target.value }))}>
                {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Release Date</label>
              <input type="date" style={S.input} value={form.release_date} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} />
            </div>
            <div>
              <Btn onClick={addRelease} disabled={loading} color={C.green} textColor="#000">
                {loading ? "SAVING…" : "ADD"}
              </Btn>
            </div>
          </div>
          {error && <div style={{ ...S.body, fontSize: 12, color: C.red, marginTop: 12 }}>{error}</div>}
        </div>
      )}

      {/* Table */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              {["Title", "Artist", "Type", "Release Date", "Streams", "Revenue", "Status"].map(h => (
                <th key={h} style={{ padding: "14px 16px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {releases.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 16px", color: C.muted }}>
                  No releases yet. Add your first track!
                </td>
              </tr>
            ) : (
              releases.map(r => (
                <tr key={r.id}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ ...S.body, fontSize: 15, color: C.text, fontWeight: 500 }}>{r.title}</div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ ...S.body, fontSize: 13, color: r.brand_color || C.muted }}>{r.artist_name}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ ...S.mono, fontSize: 10, color: C.muted, textTransform: "uppercase" }}>{r.type}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ ...S.mono, fontSize: 12, color: C.text }}>
                      {new Date(r.release_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ ...S.mono, fontSize: 13, color: C.text }}>
                      {formatNumber(r.streams)}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ ...S.mono, fontSize: 13, color: r.revenue > 0 ? C.green : C.muted }}>
                      {formatMoney(r.revenue)}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <Tag color={
                      r.status === "live" ? C.green : 
                      r.status === "scheduled" ? C.accent : 
                      r.status === "draft" ? C.cyan : C.muted
                    }>
                      {r.status}
                    </Tag>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
