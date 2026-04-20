import { useState } from 'react';
import { C, S, Btn, Tag, PageHeader } from '../App.jsx';

function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

function formatMoney(n) {
  return "$" + n.toLocaleString();
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...S.card, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: accent }} />
      <div style={{ ...S.mono, fontSize: "10px", color: C.muted, letterSpacing: "2px", marginBottom: "8px" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ ...S.display, fontSize: "42px", color: C.text, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ ...S.body, fontSize: "12px", color: C.muted, marginTop: "6px" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function ArtistCard({ artist }) {
  return (
    <div style={{ ...S.card, borderColor: artist.brand_color + "55", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: artist.brand_color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div>
          <div style={{ ...S.display, fontSize: "26px", color: C.text, letterSpacing: "1px" }}>
            {artist.name}
          </div>
          <div style={{ ...S.body, fontSize: "11px", color: artist.brand_color, marginTop: "2px" }}>
            {artist.genre}
          </div>
        </div>
        <div style={{ ...S.mono, fontSize: "10px", color: C.muted, textAlign: "right" }}>
          <div>{formatNumber(artist.monthly_listeners || 0)} /mo</div>
          <div>{artist.tracks_count || 0} tracks</div>
        </div>
      </div>
      <div style={{ ...S.body, fontSize: "12px", color: C.muted, lineHeight: 1.5, marginBottom: "14px" }}>
        {(artist.bio || "").slice(0, 100)}…
      </div>
      <div style={{ display: "flex", gap: "20px" }}>
        {[['TikTok', formatNumber(artist.followers_tiktok || 0)],
          ['Spotify', formatNumber(artist.followers_spotify || 0)],
          ['Revenue', formatMoney(artist.revenue || 0)]].map(([l, v]) => (
          <div key={l}>
            <div style={{ ...S.mono, fontSize: "9px", color: C.muted, letterSpacing: "1px" }}>{l.toUpperCase()}</div>
            <div style={{ ...S.body, fontSize: "13px", color: C.text, fontWeight: 600, marginTop: "2px" }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReleasesTable({ releases }) {
  return (
    <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
      <table>
        <thead>
          <tr>
            {["Title", "Artist", "Type", "Date", "Streams", "Revenue", "Status"].map(h => (
              <th key={h} style={{ padding: "12px 16px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {releases.map((r, i) => (
            <tr key={r.id}>
              <td style={{ ...S.body, fontSize: "14px", color: C.text, padding: "13px 16px", fontWeight: 500 }}>
                {r.title}
              </td>
              <td style={{ ...S.body, fontSize: "13px", color: r.brand_color || C.muted, padding: "13px 16px" }}>
                {r.artist_name}
              </td>
              <td style={{ ...S.mono, fontSize: "10px", color: C.muted, padding: "13px 16px" }}>
                {r.type}
              </td>
              <td style={{ ...S.mono, fontSize: "11px", color: C.muted, padding: "13px 16px" }}>
                {new Date(r.release_date).toLocaleDateString()}
              </td>
              <td style={{ ...S.mono, fontSize: "13px", color: C.text, padding: "13px 16px" }}>
                {formatNumber(r.streams || 0)}
              </td>
              <td style={{ ...S.mono, fontSize: "13px", color: r.revenue > 0 ? C.green : C.muted, padding: "13px 16px" }}>
                {formatMoney(r.revenue || 0)}
              </td>
              <td style={{ padding: "13px 16px" }}>
                <Tag color={r.status === "live" ? C.green : r.status === "scheduled" ? C.accent : C.muted}>
                  {r.status}
                </Tag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ artists, releases }) {
  const totalStreams = artists.reduce((s, a) => s + (a.total_streams || 0), 0);
  const totalRevenue = artists.reduce((s, a) => s + (a.revenue || 0), 0);
  const totalListeners = artists.reduce((s, a) => s + (a.monthly_listeners || 0), 0);

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="EMPIRE DASHBOARD" 
        sub="Real-time overview of your AGI-powered record label" 
      />
      
      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "36px" }}>
        <StatCard label="Artists" value={artists.length} sub="AI-generated personas" accent={C.cyan} />
        <StatCard label="Total Streams" value={formatNumber(totalStreams)} sub="all-time catalog" accent={C.gold} />
        <StatCard label="Annual Revenue" value={formatMoney(totalRevenue * 12)} sub="projected royalties" accent={C.green} />
        <StatCard label="Monthly Listeners" value={formatNumber(totalListeners)} sub="across all platforms" accent={C.accent} />
      </div>

      {/* Artist Roster */}
      <div style={{ ...S.mono, fontSize: "13px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>
        ARTIST ROSTER
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "36px" }}>
        {artists.slice(0, 6).map(a => <ArtistCard key={a.id} artist={a} />)}
      </div>

      {/* Recent Releases */}
      <div style={{ ...S.mono, fontSize: "13px", color: C.muted, letterSpacing: "2px", marginBottom: "14px" }}>
        RECENT RELEASES
      </div>
      <ReleasesTable releases={releases.slice(0, 5)} />
    </div>
  );
}
