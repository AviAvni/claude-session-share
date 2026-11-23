// The room's own web page: a read-only view for anyone without the plugin.
// The plugin publishes it once per room; the data lives in the artifact's db.
export const ROOM_PAGE = String.raw`<title>Claude Session Room</title>
<style>
:root { --bg:#fbfaf8; --panel:#fff; --ink:#1d1c1a; --muted:#6b6862; --line:#e6e3dd; --you:#eef3fb; --mate:#fdf4e7; --ok:#2f7a4a; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg:#171716; --panel:#1f1f1d; --ink:#ecebe8; --muted:#9c9a94; --line:#34332f; --you:#1d2633; --mate:#2e2619; --ok:#6cc08b; } }
:root[data-theme="dark"] { --bg:#171716; --panel:#1f1f1d; --ink:#ecebe8; --muted:#9c9a94; --line:#34332f; --you:#1d2633; --mate:#2e2619; --ok:#6cc08b; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.5 system-ui,-apple-system,sans-serif; }
header { padding:12px 16px; border-bottom:1px solid var(--line); background:var(--panel); display:flex; flex-wrap:wrap; gap:8px 16px; align-items:center; }
h1 { font-size:16px; margin:0; }
#who { color:var(--muted); font-size:13px; }
#who b { color:var(--ok); font-weight:600; }
main { max-width:860px; margin:0 auto; padding:16px; display:flex; flex-direction:column; gap:8px; }
.row { border:1px solid var(--line); background:var(--panel); border-radius:10px; padding:8px 12px; white-space:pre-wrap; overflow-wrap:anywhere; }
.user { background:var(--you); }
.qa { background:var(--mate); }
.tool { font:12px/1.4 ui-monospace,Menlo,monospace; color:var(--muted); background:transparent; border-style:dashed; }
.who { font-size:12px; font-weight:600; color:var(--muted); }
p.note { color:var(--muted); font-size:13px; margin:0; }
</style>
<header><h1>Claude session room</h1><span id="who">connecting…</span></header>
<main id="feed"><p class="note">Join from Claude Code with <code>/session-share join</code> and this page's link to ask questions. This page is a read-only view.</p></main>
<script>
(async () => {
  const db = await claude.use("db");
  const feed = document.getElementById("feed"), who = document.getElementById("who");
  if (!db) { who.textContent = "Sign in to claude.ai to see this room."; return; }
  let events = [], qa = [], people = [];
  const el = (cls, head, body) => { const d = document.createElement("div"); d.className = "row " + cls; const h = document.createElement("div"); h.className = "who"; h.textContent = head; d.append(h, document.createTextNode(body)); return d; };
  function draw() {
    const items = [
      ...events.map(e => ({ ts: e.ts, node: e.kind === "tool" ? el("tool", "tool · " + (e.name || ""), e.text || "") : el(e.kind === "user" ? "user" : "", (e.kind === "user" ? (e.by || "Host") : "Host's Claude"), e.text || "") })),
      ...qa.map(q => ({ ts: q.created, node: el("qa", (q.name || "Teammate") + " asked" + (q.status === "answered" ? "" : " · thinking…"), (q.q || "") + (q.a ? "\n\n" + (q.name || "Their") + "'s Claude: " + q.a : "")) })),
    ].sort((a, b) => a.ts - b.ts);
    feed.replaceChildren(...items.map(i => i.node));
    const now = Date.now(), on = people.filter(p => now - (p.lastSeen || 0) < 45000);
    who.replaceChildren();
    if (!on.length) who.textContent = "nobody online";
    on.forEach((p, i) => { const b = document.createElement("b"); b.textContent = "● "; who.append(b, document.createTextNode((p.name || "?") + (p.role === "host" ? " (host)" : "") + (i < on.length - 1 ? "  " : ""))); });
  }
  const docs = s => s.docs.map(d => d.data() || {});
  db.collection("events").orderBy("seq").onSnapshot(s => { events = docs(s); draw(); }, () => {});
  db.collection("qa").onSnapshot(s => { qa = docs(s); draw(); }, () => {});
  db.collection("presence").onSnapshot(s => { people = docs(s); draw(); }, () => {});
  setInterval(draw, 15000);
})();
</script>`
