import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Sparkles, GraduationCap, Clapperboard, ListChecks,
  NotebookPen, Radar, PartyPopper, MessageSquareQuote, BookOpen,
  Plus, Copy, Check, Trash2, ArrowRight, Flame, Lightbulb, TrendingUp,
  CalendarDays, MapPin, Wand2, AlertTriangle, Target, Users, DollarSign,
  Clock, Filter, Star, Rocket, Gift, Truck, Menu, X, Layers, Send,
  RefreshCw, PenLine, Save, Palette,
} from "lucide-react";

/* ============================================================
   CCF GROWTH DASHBOARD — single-file first version.
   Blocks below are labeled to map onto your requested repo files
   (data/*.ts, components/*, app/dashboard/*). Split by label in Cursor.
   Persistence: window.storage when available (Claude artifact runtime),
   graceful in-memory fallback otherwise (e.g. exported static HTML).
   ============================================================ */

/* ---------- design tokens (theme.ts) ---------- */
const C = {
  base: "#211C18", base2: "#2A241F", rail: "#181310", railHi: "#221A15",
  paper: "#F2EBDD", paper2: "#E7DDC9", ink: "#241E19", inkSoft: "#77695764",
  inkMute: "#7A6C58", cream: "#EFE7D8", creamSoft: "#B4A78F", line: "#3A322B",
  // glaze swatches — used as category / service coding (information, not decoration)
  sienna: "#B4552F", celadon: "#3E8E7E", cobalt: "#3F5DA0",
  ochre: "#D69A3A", oxblood: "#8A3E57", chart: "#8C9A38",
};
const GLAZES = [C.sienna, C.celadon, C.cobalt, C.ochre, C.oxblood, C.chart];
const glazeFor = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return GLAZES[h % GLAZES.length];
};
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
const serif = { fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif" };

/* ---------- persistence hook (lib/usePersistentState.ts) ---------- */
function usePersistentState(key, initial) {
  const [value, setValue] = useState(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage) {
          const r = await window.storage.get(key);
          if (alive && r && r.value != null) setValue(JSON.parse(r.value));
        }
      } catch (e) { /* missing key / unavailable → keep initial */ }
      if (alive) setLoaded(true);
    })();
    return () => { alive = false; };
  }, [key]);
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        if (typeof window !== "undefined" && window.storage)
          await window.storage.set(key, JSON.stringify(value));
      } catch (e) { /* ignore */ }
    })();
  }, [key, value, loaded]);
  return [value, setValue];
}
const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID() : String(Date.now() + Math.random());
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ============================================================
   DATA — ccfServices.ts
   ============================================================ */
const ccfServices = [
  "Date Night Pottery", "Beginner Wheel Throwing", "Paint & Sip",
  "Paint Your Own Pottery", "Mosaic", "Turkish Lamps", "Glass Fusion",
  "Candle Making", "Private Pottery Parties", "Wedding Live Pottery",
  "Corporate Art Events", "Kids Birthday Art Parties", "Online Pottery Classes",
];

/* ccfKnowledgeBase.ts */
const knowledgeBaseSeed = {
  "Company identity": "Color Cocktail Factory (CCF). Experiential art studio. Chicago (Pilsen) + Eugene, OR. BYOB social format. 70+ weekly classes. 150,000+ lifetime guests. Mission: make creativity social, usable, and inevitable.",
  "Services": "Pottery, wheel throwing, date-night pottery, paint & sip, paint-your-own-pottery, mosaic, glass fusion, Turkish lamps, candle making, private + corporate events, weddings, kids parties, off-site/mobile art, online classes, merch.",
  "Class policies": "BYOB (21+ where alcohol involved). Arrive 10 min early. Pieces fired + ready for pickup in ~2 weeks. Reschedule window: ___. No-show policy: ___.",
  "Locations": "Chicago — Pilsen. Eugene — ___. Studio capacity per session: ___. Kiln turnaround: ~2 weeks.",
  "Pricing rules": "Public seat price: ___. Private event minimum: ___. Deposit to hold a date: ___. Off-site travel fee: ___/mile beyond ___ mi.",
  "Private event rules": "Min guests: ___. Deposit + signed agreement to book. Final headcount due ___ days prior. BYOB allowed with ___.",
  "Staff / instructor notes": "Lead instructor ratio 1:___. Setup 45 min, teardown 30 min for off-site. Named leads: ___.",
  "Customer language": "Guests say: 'date night', 'girls night', 'something different', 'team bonding', 'I'm not artistic but...'. Lead with fun + low pressure, not technique.",
  "Brand voice": "Warm, playful, a little irreverent, unpretentious. Creativity is for everyone. Never precious or gatekeep-y. Handmade > perfect.",
  "Common objections": "'I'm not artistic' / 'too expensive' / 'is it BYOB?' / 'how long until I get my piece?' / 'can we do it for a group?'",
  "Common email replies": "Availability, private-event quote, reschedule, gift-card, corporate proposal, wedding activation inquiry. Templates live in Private Events tab.",
  "Website copy": "Homepage promise, class blurbs, private-event landing. Reduce CTAs, show pricing, occasion-led nav. (See homepage audit.)",
  "Social hooks": "'POV: your first time on the wheel', 'date night that isn't dinner', 'what your glaze says about you', 'we fired it — here's the reveal'.",
  "Future ideas": "Membership/clay club, video course, workbook line, Vegas adults-only concept, multi-city modular brand.",
};

/* mockDailyDashboard.ts */
const mockDailyDashboard = {
  priorities: [
    { t: "Lock the weekend Date Night Pottery upsell (candle add-on)", loc: "All", why: "Highest-margin add-on, zero new labor." },
    { t: "Reply to 3 open corporate inquiries within 4 hrs", loc: "Chicago", why: "Corporate closes 5–8× a public seat." },
    { t: "Shoot one 20-sec wheel-reveal Reel", loc: "Eugene", why: "Reveal content converts best for pottery." },
    { t: "Publish pricing on the private-events page", loc: "All", why: "Hidden pricing is the #1 conversion leak." },
    { t: "Fill 4 empty Tue/Wed Eugene seats with a flash offer", loc: "Eugene", why: "Midweek is the softest inventory." },
  ],
  urgent: [
    { t: "2 corporate emails aging >24h", sev: "high" },
    { t: "Glass Fusion Sat morning under 40% booked", sev: "med" },
  ],
  opportunities: [
    { t: "Wedding season inquiries rising — package not on site yet", loc: "All" },
    { t: "Local Eugene festival next month — art booth slot open", loc: "Eugene" },
  ],
  weakAreas: [
    "Turkish Lamps has the thinnest description + no video",
    "Online Pottery Classes page has no clear promise or price",
    "Kids parties lack a one-tap inquiry form",
  ],
  experiments: [
    "Test a $15 candle add-on at checkout for Date Night",
    "Try a Sunday 'clay + coffee' slower morning slot",
    "A/B a pricing-visible vs pricing-hidden private events page",
  ],
  unexpected: "Run a 'Glaze Your Ex' cathartic smash-and-remake night around Valentine's — press-friendly, adult, BYOB, low materials cost.",
  classImprovement: "Date Night Pottery: rename the promise from 'make a mug' to 'leave with a matching pair you actually made' + add the candle add-on.",
  marketingMove: "Post the 'we fired it — here's the reveal' before/after as a Reel and pin it.",
  privateEventMove: "Push the Corporate Pottery Night package to 3 nearby WeWork / HR contacts with a flat per-head quote.",
  contentIdea: "Series: 'What your glaze says about you' — 6 quick personality-style Reels, one per glaze color.",
};

/* mockIdeas.ts — seed backlog */
const mockIdeas = [
  { id: uid(), title: "Clay Club membership", category: "New classes", concept: "Monthly membership: 1 class + open-studio wheel time.", audience: "Repeat locals, hobbyists", price: "$59/mo", difficulty: "Medium", materials: "Clay, glaze, kiln time", profit: "High (recurring)", angle: "Belonging + habit, not one-off", fit: "Turns first-timers into regulars", steps: ["Define tier perks", "Set open-studio hours", "Soft-launch to email list"] },
  { id: uid(), title: "Sip & Slip Fridays", category: "Adult nights", concept: "Wheel throwing + signature mocktail/cocktail pairing night.", audience: "25–40 social crowd", price: "$65", difficulty: "Low", materials: "Clay, drink kit", profit: "High", angle: "Date-night-that-isn't-dinner", fit: "Leans into BYOB social DNA", steps: ["Pick drink pairing", "Set Friday cadence", "Shoot promo Reel"] },
];

/* mockTasks.ts */
const mockTasks = [
  { id: uid(), title: "Publish pricing on private-events page", category: "Website", priority: "High", status: "In Progress", owner: "Yahya", deadline: todayISO(), impact: "High", effort: "Low", service: "Private Pottery Parties", location: "All", notes: "Biggest conversion leak.", source: "Homepage audit" },
  { id: uid(), title: "Shoot wheel-reveal Reel", category: "Content", priority: "Medium", status: "Planned", owner: "Studio", deadline: todayISO(), impact: "Medium", effort: "Low", service: "Beginner Wheel Throwing", location: "Eugene", notes: "", source: "Daily focus" },
  { id: uid(), title: "Add candle add-on at checkout", category: "Pricing", priority: "High", status: "Idea", owner: "Yahya", deadline: "", impact: "High", effort: "Medium", service: "Date Night Pottery", location: "All", notes: "Zero new labor.", source: "Experiment" },
];
const TASK_STATUSES = ["Idea", "Planned", "In Progress", "Waiting", "Done", "Dropped"];

/* mockOpportunities.ts */
const mockOpportunities = [
  { id: uid(), title: "Wedding live-pottery package not on site yet", cat: "Wedding market", loc: "All", value: "$$$$", urgency: "High", action: "Publish a package page + inquiry form this week." },
  { id: uid(), title: "Eugene local festival art booth", cat: "Local event", loc: "Eugene", value: "$$", urgency: "Medium", action: "Email organizer for a vendor/activation slot." },
  { id: uid(), title: "Turkish Lamps ranks but page is thin", cat: "SEO opportunity", loc: "Online", value: "$$$", urgency: "Medium", action: "Rewrite description + add a 30-sec build video." },
  { id: uid(), title: "Midweek Eugene seats sit empty", cat: "Pricing opportunity", loc: "Eugene", value: "$$", urgency: "High", action: "Flash 'clay + coffee' midweek offer to email list." },
  { id: uid(), title: "WeWork Chicago team-building pipeline", cat: "Corporate", loc: "Chicago", value: "$$$$", urgency: "High", action: "Send flat per-head corporate quote to 3 HR contacts." },
  { id: uid(), title: "Gift-card push before holidays", cat: "Product idea", loc: "All", value: "$$$", urgency: "Low", action: "Design a gift-card landing + email sequence." },
];

/* aiPromptTemplates.ts */
const aiPromptTemplates = [
  { name: "Generate new CCF classes", prompt: "You are a creative-studio product designer for Color Cocktail Factory (pottery/paint/glass, BYOB social, Chicago + Eugene). Generate 5 NEW class ideas for [CATEGORY]. For each: title, 1-line concept, target audience, price, difficulty to launch, materials, profit potential, marketing angle, why it fits CCF, and next 3 steps. Prioritize low materials cost + high social/shareability." },
  { name: "Improve a class description", prompt: "Rewrite the description for CCF's [CLASS]. Keep brand voice: warm, playful, unpretentious, 'creativity is for everyone'. Lead with the experience + the thing they leave with, not technique. Output: new title, 2-sentence promise, 3 bullet 'what makes it special', and one social hook." },
  { name: "Create a private event package", prompt: "Build a private-event package for CCF: [EVENT TYPE]. Include package name, pricing model, minimum booking, staffing, transport, materials, setup + teardown time, ideal customer, a 3-sentence sales pitch, website copy block, and a ready-to-send inquiry-response email." },
  { name: "TikTok / Reels ideas", prompt: "Give 8 short-video ideas for CCF promoting [SERVICE]. For each: hook (first line on screen), format, 3-beat script outline, visual direction, CTA, and which customer it targets. Optimize for the 'reveal' and 'POV' formats." },
  { name: "Email campaign", prompt: "Write a CCF email campaign for [GOAL] (e.g. fill midweek seats). Output subject line (+2 alts), preview text, 120-word body in brand voice, and one clear CTA. Audience: [AUDIENCE], location: [LOCATION]." },
  { name: "Website copy", prompt: "Write website copy for CCF's [PAGE]. Reduce friction: one primary CTA, visible price, clear promise. Output an H1, subhead, 3 benefit bullets, and CTA button label." },
  { name: "Find hidden opportunities", prompt: "Act as a growth strategist for CCF. Given our services + markets (Chicago, Eugene, online), surface 10 non-obvious revenue opportunities. For each: title, why it matters, location, potential value, urgency, and the first concrete action." },
  { name: "Summarize the daily business log", prompt: "Summarize today's CCF business log into: 3 wins, 3 problems, 3 things to watch, and 3 recommended actions for tomorrow ranked by impact. Then note any pattern vs the last 7 days." },
  { name: "Books / workbooks / course ideas", prompt: "Propose 5 CCF info-products (book, workbook, or video course) that extend our in-studio classes. For each: title, format, who it's for, core promise, outline (5 modules), and price." },
  { name: "Unexpected experimental ideas", prompt: "Give CCF 6 weird, press-worthy, low-cost experimental event ideas that fit a BYOB creative studio. Bias toward emotionally resonant + shareable. For each: title, the hook, why it could go viral, and materials cost." },
];

/* generator pools (folded into mockIdeas.ts / content) */
const ideaPools = {
  "New classes": [["Kiln & Chill slow mornings","Low-pressure open wheel + coffee.","Introverts, solo makers","$40","Low"],["Glaze Chemistry 101","Learn to mix your own glaze colors.","Returning students","$70","Medium"],["Two-Handed Date Wheel","Couples share one wheel, one pot.","Couples","$75","Low"]],
  "Adult nights": [["Glaze Your Ex","Cathartic smash + remake night.","25–45, singles","$60","Low"],["Naked Clay (figure + form)","Tasteful life-form sculpting night.","Adventurous adults","$70","Medium"],["Late-Night Wheel + Vinyl","DJ set + open wheel.","Nightlife crowd","$55","Low"]],
  "Kids parties": [["Dino Dig Clay Party","Sculpt + 'excavate' fossils.","Ages 6–10","$28/kid","Low"],["Superhero Mug Squad","Kids paint their hero mug.","Ages 5–9","$25/kid","Low"]],
  "Corporate events": [["Team Tiles Mural","Each colleague makes one tile → one mural.","10–40 staff","$65/head","Medium"],["Leadership on the Wheel","Metaphor-driven wheel workshop.","Execs, offsites","$90/head","Medium"]],
  "Wedding activations": [["Live Guest Pottery","Guests throw a mini keepsake.","Weddings 60–150","$1,800+","High"],["Unity Vessel","Couple co-throws one vessel on stage.","Ceremonies","$650","Medium"]],
  "Merchandise": [["Glaze-swatch enamel pins","6 CCF glaze colors as pins.","Fans, students","$12","Low"],["'I'm not artistic but' tee","Signature line tee.","Everyone","$28","Low"]],
  "Seasonal campaigns": [["Fired for the Holidays","Gift-ready pieces + gift cards.","Gift buyers","varies","Low"],["Galentine's Clay","Group friend night.","Friend groups","$55","Low"]],
  "Strange/unexpected": [["Silent Wheel (headphones)","Guided-audio silent throwing.","Wellness crowd","$50","Low"],["Break-Up Bowl Bar","Smash + rebuild + name it.","Recently single","$45","Low"]],
};
const contentPools = {
  "Instagram Reels": [["POV: your first pull on the wheel","Reveal","Hands-on-wheel → wobble → save"],["We fired it — here's the reveal","Before/After","Raw piece → kiln → glazed reveal"]],
  "TikTok": [["Rating your glaze combos so you don't have to","Talking-head + b-roll","Chip test tiles ranked"],["Things nobody tells you before a pottery date","List","3 funny truths"]],
  "YouTube Shorts": [["The 2-week wait, explained in 40 sec","Explainer","Why kiln takes time"]],
  "email newsletters": [["Midweek seats, half the crowd","Offer","Fill Tue/Wed with 'clay + coffee'"]],
  "date night content": [["Date night that isn't dinner","Aesthetic reel","Couple laughing at collapsing pot"]],
  "behind-the-scenes studio content": [["Kiln-opening ASMR","BTS","Unloading a fresh kiln"]],
};
const decisionResponses = {
  "What should I launch next?": { rec: "Clay Club membership.", because: ["Recurring revenue smooths your softest inventory (midweek).","Converts your 150k lifetime guests into repeat regulars.","Near-zero new materials — you already run the classes."], steps: ["Define 2 tiers + open-studio hours","Soft-launch to email list at a founding price","Cap founding members to create urgency"] },
  "What should I stop doing?": { rec: "Stop hiding prices on private/online pages.", because: ["Hidden pricing is your #1 conversion leak.","It filters out unqualified inquiries and saves reply time.","Occasion-led buyers decide faster with a number."], steps: ["Add 'from $X/head' to private events","Add a clear price to Online Pottery Classes","Keep one primary CTA per page"] },
  "What should I advertise this weekend?": { rec: "Date Night Pottery + candle add-on.", because: ["Highest-margin, most social format you run.","Weekend intent is highest for couples.","The add-on lifts average order with no new labor."], steps: ["Boost the reveal Reel to a 10-mi radius","Use 'leave with a matching pair' as the hook","Add the $15 candle upsell at checkout"] },
  "What should I post today?": { rec: "A wheel-reveal Reel.", because: ["Reveal content out-converts everything for pottery.","It shows the payoff, not the difficulty.","Fast to shoot in-studio, evergreen."], steps: ["Shoot 20 sec raw→glazed","Caption: 'we fired it — here's the reveal'","Pin it + link the nearest open class"] },
  "What's the best idea for Eugene this month?": { rec: "Fill midweek with 'Clay + Coffee'.", because: ["Tue/Wed Eugene seats are your softest inventory.","Low-pressure morning slot fits locals + retirees.","Cheap to trial, easy to cancel if flat."], steps: ["Add a recurring Wed morning slot","Email the Eugene list a founding price","Track fill rate for 3 weeks"] },
  "What's the best idea for Chicago this month?": { rec: "Push Corporate Pottery Night to WeWork.", because: ["Corporate closes at 5–8× a public seat.","Pilsen is close to downtown office demand.","One booking beats a week of retail seats."], steps: ["Send a flat per-head quote to 3 HR contacts","Offer a weekday-evening slot","Bundle team-tile mural as the hook"] },
  "What should I make into a book or course?": { rec: "'Your First Pot' beginner video course + workbook.", because: ["Extends class value beyond the room.","Sells to your online audience nationally.","Feeds people back into in-studio classes."], steps: ["Film 5 short modules from a real class","Bundle a printable glaze + form workbook","Price as a standalone or class add-on"] },
};

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */
function Eyebrow({ children, color }) {
  return <div style={{ ...mono, color: color || C.creamSoft, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase" }}>{children}</div>;
}
function Chip({ children, color = C.inkMute, on = "transparent", solid }) {
  return (
    <span style={{ ...mono, fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase",
      color: solid ? "#fff" : color, background: solid ? color : on,
      border: `1px solid ${solid ? color : color + "55"}`, padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
function CopyButton({ text, label = "Copy" }) {
  const [done, setDone] = useState(false);
  return (
    <button onClick={async () => { try { await navigator.clipboard.writeText(text); } catch (e) {} setDone(true); setTimeout(() => setDone(false), 1300); }}
      className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-80"
      style={{ ...mono, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase", color: done ? C.celadon : C.inkMute, background: "transparent", border: `1px solid ${(done ? C.celadon : C.inkMute) + "66"}`, padding: "4px 9px", borderRadius: 8, cursor: "pointer" }}>
      {done ? <Check size={12} /> : <Copy size={12} />}{done ? "Copied" : label}
    </button>
  );
}
// components/MetricCard.tsx
function MetricCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{ background: C.base2, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ ...serif, color: C.cream, fontSize: 30, lineHeight: 1.05, marginTop: 8 }}>{value}</div>
      {sub && <div style={{ color: C.creamSoft, fontSize: 12, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}
// paper "index-card" surface used across content areas
function Card({ children, accent, style }) {
  return (
    <div style={{ background: C.paper, borderRadius: 14, border: `1px solid ${C.paper2}`, borderLeft: accent ? `4px solid ${accent}` : `1px solid ${C.paper2}`, boxShadow: "0 1px 0 rgba(0,0,0,.25)", padding: 16, ...style }}>{children}</div>
  );
}
function SectionHead({ eyebrow, title, desc, right }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginBottom: 18 }}>
      <div>
        <Eyebrow color={C.sienna}>{eyebrow}</Eyebrow>
        <h1 style={{ ...serif, color: C.cream, fontSize: 30, lineHeight: 1.1, margin: "6px 0 0" }}>{title}</h1>
        {desc && <p style={{ color: C.creamSoft, fontSize: 13.5, maxWidth: 620, marginTop: 7 }}>{desc}</p>}
      </div>
      {right}
    </div>
  );
}
// components/CategoryFilter.tsx
function CategoryFilter({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} style={{ ...mono, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", padding: "5px 11px", borderRadius: 999, cursor: "pointer", color: active ? C.base : C.creamSoft, background: active ? C.ochre : "transparent", border: `1px solid ${active ? C.ochre : C.line}` }}>{o}</button>
        );
      })}
    </div>
  );
}

/* ============================================================
   VIEW: Daily Command Center  (/dashboard, /dashboard/daily)
   ============================================================ */
function DailyView({ d, ideas, tasks, logs, go }) {
  const open = tasks.filter((t) => !["Done", "Dropped"].includes(t.status)).length;
  const dueToday = tasks.filter((t) => t.deadline === todayISO() && !["Done", "Dropped"].includes(t.status)).length;
  const week = logs.filter((l) => (Date.now() - new Date(l.date).getTime()) < 7 * 864e5).length;
  const Feature = ({ icon: Icon, tag, color, body, cta }) => (
    <Card accent={color}>
      <div className="flex items-center gap-2" style={{ marginBottom: 7 }}><Icon size={15} style={{ color }} /><Eyebrow color={color}>{tag}</Eyebrow></div>
      <p style={{ color: C.ink, fontSize: 14.5, lineHeight: 1.5 }}>{body}</p>
      {cta && <button onClick={cta.on} className="inline-flex items-center gap-1 hover:gap-2 transition-all" style={{ ...mono, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, color, marginTop: 10, background: "none", border: "none", cursor: "pointer" }}>{cta.label}<ArrowRight size={13} /></button>}
    </Card>
  );
  return (
    <div>
      <SectionHead eyebrow={`Studio console · ${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}`} title="What should CCF focus on today?" desc="Your daily control room — the five moves that matter, plus one of everything worth doing today." />
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginBottom: 22 }}>
        <MetricCard icon={ListChecks} label="Open tasks" value={open} sub={`${dueToday} due today`} color={C.ochre} />
        <MetricCard icon={Lightbulb} label="Ideas in backlog" value={ideas.length} sub="waiting to become tasks" color={C.celadon} />
        <MetricCard icon={Radar} label="Live opportunities" value={mockOpportunities.length} sub="on the radar" color={C.cobalt} />
        <MetricCard icon={NotebookPen} label="Logs this week" value={week} sub="business memory" color={C.oxblood} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1.15fr 1fr" }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 12 }}><Flame size={16} style={{ color: C.sienna }} /><Eyebrow color={C.sienna}>Today's top 5 priorities</Eyebrow></div>
          <div className="grid gap-2.5">
            {d.priorities.map((p, i) => (
              <Card key={i} accent={GLAZES[i % GLAZES.length]} style={{ padding: "13px 15px" }}>
                <div className="flex items-start gap-3">
                  <div style={{ ...serif, color: GLAZES[i % GLAZES.length], fontSize: 22, lineHeight: 1, minWidth: 22 }}>{i + 1}</div>
                  <div className="flex-1">
                    <div style={{ color: C.ink, fontSize: 14.5, fontWeight: 600 }}>{p.t}</div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 6 }}>
                      <Chip color={C.cobalt}><MapPin size={9} style={{ display: "inline", marginRight: 2 }} />{p.loc}</Chip>
                      <span style={{ color: C.inkMute, fontSize: 12 }}>{p.why}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center gap-2" style={{ margin: "22px 0 12px" }}><AlertTriangle size={16} style={{ color: C.oxblood }} /><Eyebrow color={C.oxblood}>Urgent · needs attention</Eyebrow></div>
          <div className="grid gap-2">
            {d.urgent.map((u, i) => (
              <Card key={i} accent={u.sev === "high" ? C.oxblood : C.ochre} style={{ padding: "11px 14px" }}>
                <div className="flex items-center justify-between gap-3">
                  <span style={{ color: C.ink, fontSize: 13.5 }}>{u.t}</span>
                  <Chip solid color={u.sev === "high" ? C.oxblood : C.ochre}>{u.sev}</Chip>
                </div>
              </Card>
            ))}
            {d.weakAreas.map((w, i) => (
              <Card key={"w" + i} style={{ padding: "11px 14px" }}>
                <span style={{ color: C.inkMute, fontSize: 13.5 }}><Target size={12} style={{ display: "inline", marginRight: 6, color: C.inkMute }} />{w}</span>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-3" style={{ alignContent: "start" }}>
          <Feature icon={Sparkles} tag="Unexpected idea of the day" color={C.oxblood} body={d.unexpected} cta={{ label: "Brainstorm more", on: () => go("ideas") }} />
          <Feature icon={GraduationCap} tag="Class improvement" color={C.celadon} body={d.classImprovement} cta={{ label: "Open class lab", on: () => go("classes") }} />
          <Feature icon={Clapperboard} tag="Marketing move" color={C.sienna} body={d.marketingMove} cta={{ label: "Content factory", on: () => go("content") }} />
          <Feature icon={PartyPopper} tag="Private-event sales move" color={C.cobalt} body={d.privateEventMove} cta={{ label: "Private events", on: () => go("private-events") }} />
          <Feature icon={BookOpen} tag="Content / video / book idea" color={C.ochre} body={d.contentIdea} cta={{ label: "Content factory", on: () => go("content") }} />
          <Card accent={C.chart}>
            <div className="flex items-center gap-2" style={{ marginBottom: 7 }}><Wand2 size={15} style={{ color: C.chart }} /><Eyebrow color={C.chart}>Suggested experiments</Eyebrow></div>
            <ul style={{ margin: 0, paddingLeft: 16, color: C.ink, fontSize: 13.5, lineHeight: 1.7 }}>{d.experiments.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Brainstorming Engine  (/dashboard/ideas)
   Uses IdeaCard + QuickAddIdea
   ============================================================ */
function sample(arr, n) { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }
function makeIdea(category, [title, concept, audience, price, difficulty]) {
  return { id: uid(), title, category, concept, audience, price, difficulty, materials: "Studio stock + glaze", profit: difficulty === "Low" ? "High" : "Medium", angle: "Social, shareable, low-pressure", fit: "On-brand: creativity made social + easy", steps: ["Define the run-of-show", "Price + set first date", "Shoot one promo Reel"] };
}
function IdeaCard({ idea, onSave, onTask, onDelete }) {
  const g = glazeFor(idea.category);
  const copyText = `${idea.title}\n${idea.concept}\nAudience: ${idea.audience} | Price: ${idea.price} | Launch: ${idea.difficulty}\nWhy CCF: ${idea.fit}\nNext: ${(idea.steps || []).join(" → ")}`;
  return (
    <Card accent={g}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <Chip color={g}>{idea.category}</Chip>
          <h3 style={{ ...serif, color: C.ink, fontSize: 19, margin: "8px 0 0" }}>{idea.title}</h3>
        </div>
        <Chip color={C.inkMute}>{idea.difficulty} launch</Chip>
      </div>
      <p style={{ color: C.ink, fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>{idea.concept}</p>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr", marginTop: 10, fontSize: 12.5, color: C.inkMute }}>
        <span><Users size={11} style={{ display: "inline", marginRight: 5 }} />{idea.audience}</span>
        <span><DollarSign size={11} style={{ display: "inline", marginRight: 5 }} />{idea.price}</span>
        <span><TrendingUp size={11} style={{ display: "inline", marginRight: 5 }} />{idea.profit} profit</span>
        <span><Palette size={11} style={{ display: "inline", marginRight: 5 }} />{idea.materials}</span>
      </div>
      <div style={{ borderTop: `1px dashed ${C.paper2}`, margin: "12px 0 10px" }} />
      <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.inkMute, marginBottom: 4 }}>Next 3 steps</div>
      <ol style={{ margin: 0, paddingLeft: 16, color: C.ink, fontSize: 12.5, lineHeight: 1.6 }}>{(idea.steps || []).map((s, i) => <li key={i}>{s}</li>)}</ol>
      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 12 }}>
        {onSave && <button onClick={() => onSave(idea)} className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: "#fff", background: g, border: "none", padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}><Plus size={12} />Save idea</button>}
        {onTask && <button onClick={() => onTask(idea)} className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: C.ink, background: "transparent", border: `1px solid ${C.inkMute}66`, padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}><ListChecks size={12} />To task</button>}
        <CopyButton text={copyText} />
        {onDelete && <button onClick={() => onDelete(idea.id)} title="Delete" style={{ marginLeft: "auto", color: C.oxblood, background: "none", border: "none", cursor: "pointer" }}><Trash2 size={14} /></button>}
      </div>
    </Card>
  );
}
function IdeasView({ ideas, actions }) {
  const cats = Object.keys(ideaPools);
  const [cat, setCat] = useState(cats[0]);
  const [gen, setGen] = useState(() => sample(ideaPools[cats[0]], Math.min(3, ideaPools[cats[0]].length)).map((r) => makeIdea(cats[0], r)));
  const [q, setQ] = useState("");
  const regen = (c = cat) => { setCat(c); setGen(sample(ideaPools[c], Math.min(3, ideaPools[c].length)).map((r) => makeIdea(c, r))); };
  return (
    <div>
      <SectionHead eyebrow="Brainstorming engine" title="Generate ideas by category" desc="Spin up on-brand concepts with full go-to-market detail. Save the good ones to your backlog or push straight to a task."
        right={<button onClick={() => regen()} className="inline-flex items-center gap-2" style={{ ...mono, fontSize: 11, textTransform: "uppercase", color: C.base, background: C.ochre, border: "none", padding: "8px 14px", borderRadius: 10, cursor: "pointer" }}><RefreshCw size={13} />Generate</button>} />
      <div style={{ marginBottom: 16 }}><CategoryFilter options={cats} value={cat} onChange={regen} /></div>

      {/* QuickAddIdea */}
      <Card style={{ marginBottom: 18, background: C.base2, border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 8 }}><Plus size={14} style={{ color: C.celadon }} /><Eyebrow color={C.celadon}>Quick add — capture an idea before it's gone</Eyebrow></div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Sunday 'clay + coffee' slow morning..." onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) { actions.addIdea({ id: uid(), title: q.trim(), category: cat, concept: "Captured from Quick Add — flesh this out.", audience: "TBD", price: "TBD", difficulty: "Low", materials: "TBD", profit: "TBD", angle: "TBD", fit: "TBD", steps: ["Define concept", "Price it", "Set a date"] }); setQ(""); } }}
            style={{ flex: 1, background: C.rail, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", color: C.cream, fontSize: 14, outline: "none" }} />
          <button onClick={() => { if (q.trim()) { actions.addIdea({ id: uid(), title: q.trim(), category: cat, concept: "Captured from Quick Add — flesh this out.", audience: "TBD", price: "TBD", difficulty: "Low", materials: "TBD", profit: "TBD", angle: "TBD", fit: "TBD", steps: ["Define concept", "Price it", "Set a date"] }); setQ(""); } }}
            style={{ ...mono, fontSize: 11, textTransform: "uppercase", color: C.base, background: C.celadon, border: "none", padding: "0 16px", borderRadius: 10, cursor: "pointer" }}>Add</button>
        </div>
      </Card>

      <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Sparkles size={14} style={{ color: C.ochre }} /><Eyebrow color={C.ochre}>Fresh from the engine · {cat}</Eyebrow></div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", marginBottom: 26 }}>
        {gen.map((i) => <IdeaCard key={i.id} idea={i} onSave={actions.addIdea} onTask={actions.convertIdeaToTask} />)}
      </div>

      <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><BookOpen size={14} style={{ color: C.celadon }} /><Eyebrow color={C.celadon}>Your saved backlog · {ideas.length}</Eyebrow></div>
      {ideas.length === 0
        ? <Card style={{ background: C.base2, border: `1px dashed ${C.line}`, color: C.creamSoft, textAlign: "center", padding: 26 }}>Nothing saved yet — generate above and hit <b style={{ color: C.cream }}>Save idea</b>.</Card>
        : <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>{ideas.map((i) => <IdeaCard key={i.id} idea={i} onTask={actions.convertIdeaToTask} onDelete={actions.deleteIdea} />)}</div>}
    </div>
  );
}

/* ============================================================
   VIEW: Class Improvement Lab  (/dashboard/classes)
   ClassImprovementCard
   ============================================================ */
const classAxes = ["Title", "Description", "Customer promise", "What makes it special", "What may confuse", "Better upsells", "Photos / video needed", "Pricing ideas", "Schedule ideas", "Seasonal versions", "Social hooks", "Ops to watch"];
function ClassImprovementCard({ name, note, onSave }) {
  const g = glazeFor(name);
  const [draft, setDraft] = useState(note || "");
  useEffect(() => setDraft(note || ""), [note]);
  return (
    <Card accent={g}>
      <div className="flex items-center justify-between">
        <h3 style={{ ...serif, color: C.ink, fontSize: 20 }}>{name}</h3>
        <Chip color={g}>Class</Chip>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr", margin: "12px 0" }}>
        {classAxes.map((a) => (
          <div key={a} className="flex items-center gap-1.5" style={{ fontSize: 12, color: C.inkMute }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: g, display: "inline-block" }} />{a}
          </div>
        ))}
      </div>
      <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.inkMute, marginBottom: 5 }}>Improvement notes</div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} placeholder="What to change about title, promise, upsell, pricing, schedule..."
        style={{ width: "100%", background: "#FBF7EE", border: `1px solid ${C.paper2}`, borderRadius: 10, padding: 10, fontSize: 13, color: C.ink, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
        <CopyButton text={`Improve CCF's ${name}. Notes: ${draft || "(none yet)"}. Cover: ${classAxes.join(", ")}.`} label="Copy prompt" />
        <button onClick={() => onSave(name, draft)} className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: "#fff", background: g, border: "none", padding: "5px 11px", borderRadius: 8, cursor: "pointer" }}><Save size={12} />Save notes</button>
      </div>
    </Card>
  );
}
function ClassesView({ classNotes, actions }) {
  return (
    <div>
      <SectionHead eyebrow="Class improvement lab" title="Make every class earn its slot" desc="Evaluate each class across 12 axes — promise, upsells, pricing, schedule, hooks, ops. Notes persist and become AI prompts." />
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
        {ccfServices.map((c) => <ClassImprovementCard key={c} name={c} note={classNotes[c]} onSave={actions.saveClassNote} />)}
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Content Factory  (/dashboard/content)
   ============================================================ */
function ContentView({ actions }) {
  const cats = ["Instagram Reels", "TikTok", "YouTube Shorts", "email newsletters", "date night content", "behind-the-scenes studio content"];
  const [cat, setCat] = useState(cats[0]);
  const build = (c) => (contentPools[c] || [["Idea for " + c, "Short", "Hook → payoff → CTA"]]).map(([hook, format, outline]) => ({ id: uid(), hook, format, outline, cat: c }));
  const [items, setItems] = useState(() => build(cats[0]));
  const pick = (c) => { setCat(c); setItems(build(c)); };
  return (
    <div>
      <SectionHead eyebrow="Content factory" title="Turn the studio into content" desc="Hooks, formats, script beats, visual direction and CTAs — mapped to the service each piece should sell."
        right={<button onClick={() => setItems(build(cat))} className="inline-flex items-center gap-2" style={{ ...mono, fontSize: 11, textTransform: "uppercase", color: C.base, background: C.ochre, border: "none", padding: "8px 14px", borderRadius: 10, cursor: "pointer" }}><RefreshCw size={13} />Generate</button>} />
      <div style={{ marginBottom: 16 }}><CategoryFilter options={cats} value={cat} onChange={pick} /></div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
        {items.map((it) => {
          const g = glazeFor(it.cat);
          const svc = ccfServices[Math.abs(it.hook.length) % ccfServices.length];
          return (
            <Card key={it.id} accent={g}>
              <Chip color={g}>{it.cat}</Chip>
              <h3 style={{ ...serif, color: C.ink, fontSize: 18, margin: "8px 0 4px" }}>“{it.hook}”</h3>
              <div style={{ fontSize: 12.5, color: C.inkMute, lineHeight: 1.7 }}>
                <div><b style={{ color: C.ink }}>Format:</b> {it.format}</div>
                <div><b style={{ color: C.ink }}>Script:</b> {it.outline}</div>
                <div><b style={{ color: C.ink }}>Visual:</b> in-studio, hands + reveal, natural light</div>
                <div><b style={{ color: C.ink }}>CTA:</b> "Book the nearest class — link in bio"</div>
                <div><b style={{ color: C.ink }}>Promotes:</b> {svc}</div>
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: 11 }}>
                <button onClick={() => actions.addTask({ id: uid(), title: `Make: “${it.hook}”`, category: "Content", priority: "Medium", status: "Idea", owner: "Studio", deadline: "", impact: "Medium", effort: "Low", service: svc, location: "All", notes: `${it.format} — ${it.outline}`, source: "Content Factory" })}
                  className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: "#fff", background: g, border: "none", padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}><ListChecks size={12} />To task</button>
                <CopyButton text={`Hook: ${it.hook}\nFormat: ${it.format}\nScript: ${it.outline}\nPromotes: ${svc}`} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Task Planner  (/dashboard/tasks)  — Kanban + list
   TaskCard
   ============================================================ */
function TaskCard({ t, onStatus, onDelete, compact }) {
  const g = glazeFor(t.category || t.service);
  const pri = { High: C.oxblood, Medium: C.ochre, Low: C.celadon }[t.priority] || C.inkMute;
  return (
    <Card accent={g} style={{ padding: 13 }}>
      <div className="flex items-start justify-between gap-2">
        <span style={{ color: C.ink, fontSize: 13.5, fontWeight: 600, lineHeight: 1.35 }}>{t.title}</span>
        <button onClick={() => onDelete(t.id)} style={{ color: C.inkMute, background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} /></button>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap" style={{ margin: "8px 0" }}>
        <Chip solid color={pri}>{t.priority}</Chip>
        {t.category && <Chip color={g}>{t.category}</Chip>}
        {t.location && <Chip color={C.cobalt}>{t.location}</Chip>}
      </div>
      {t.notes && <p style={{ color: C.inkMute, fontSize: 12, lineHeight: 1.45 }}>{t.notes}</p>}
      <div className="flex items-center justify-between gap-2" style={{ marginTop: 9, fontSize: 11.5, color: C.inkMute }}>
        <span>{t.deadline ? <><CalendarDays size={11} style={{ display: "inline", marginRight: 4 }} />{t.deadline}</> : "no date"}{t.owner ? ` · ${t.owner}` : ""}</span>
        {compact && (
          <select value={t.status} onChange={(e) => onStatus(t.id, e.target.value)} style={{ ...mono, fontSize: 10, background: C.paper, border: `1px solid ${C.paper2}`, borderRadius: 6, color: C.ink, padding: "2px 4px" }}>
            {TASK_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
      </div>
    </Card>
  );
}
function TasksView({ tasks, actions }) {
  const [view, setView] = useState("board");
  const [nt, setNt] = useState({ title: "", category: "Ops", priority: "Medium", location: "All" });
  const colColor = { Idea: C.inkMute, Planned: C.cobalt, "In Progress": C.ochre, Waiting: C.oxblood, Done: C.celadon, Dropped: C.inkMute };
  const add = () => { if (!nt.title.trim()) return; actions.addTask({ id: uid(), title: nt.title.trim(), category: nt.category, priority: nt.priority, status: "Idea", owner: "Yahya", deadline: "", impact: "Medium", effort: "Medium", service: "", location: nt.location, notes: "", source: "Manual" }); setNt({ ...nt, title: "" }); };
  return (
    <div>
      <SectionHead eyebrow="Task planner" title="Ideas become moves" desc="Every idea, content piece and opportunity can land here. Board or list — your call."
        right={
          <div className="flex gap-1" style={{ background: C.base2, border: `1px solid ${C.line}`, borderRadius: 10, padding: 3 }}>
            {["board", "list"].map((v) => <button key={v} onClick={() => setView(v)} style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", padding: "5px 11px", borderRadius: 7, cursor: "pointer", color: view === v ? C.base : C.creamSoft, background: view === v ? C.cream : "transparent", border: "none" }}>{v}</button>)}
          </div>} />
      <Card style={{ marginBottom: 18, background: C.base2, border: `1px solid ${C.line}` }}>
        <div className="flex gap-2 flex-wrap items-center">
          <input value={nt.title} onChange={(e) => setNt({ ...nt, title: e.target.value })} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New task…" style={{ flex: "1 1 240px", background: C.rail, border: `1px solid ${C.line}`, borderRadius: 9, padding: "9px 11px", color: C.cream, fontSize: 13.5, outline: "none" }} />
          <select value={nt.priority} onChange={(e) => setNt({ ...nt, priority: e.target.value })} style={{ ...mono, fontSize: 11, background: C.rail, border: `1px solid ${C.line}`, borderRadius: 9, padding: "9px", color: C.cream }}>{["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select>
          <select value={nt.location} onChange={(e) => setNt({ ...nt, location: e.target.value })} style={{ ...mono, fontSize: 11, background: C.rail, border: `1px solid ${C.line}`, borderRadius: 9, padding: "9px", color: C.cream }}>{["All", "Chicago", "Eugene", "Online"].map((p) => <option key={p}>{p}</option>)}</select>
          <button onClick={add} className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 11, textTransform: "uppercase", color: C.base, background: C.ochre, border: "none", padding: "9px 15px", borderRadius: 9, cursor: "pointer" }}><Plus size={13} />Add</button>
        </div>
      </Card>

      {view === "board" ? (
        <div className="flex gap-3" style={{ overflowX: "auto", paddingBottom: 8 }}>
          {TASK_STATUSES.map((s) => {
            const col = tasks.filter((t) => t.status === s);
            return (
              <div key={s} style={{ minWidth: 236, flex: "1 0 236px" }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 9 }}>
                  <div className="flex items-center gap-2"><span style={{ width: 8, height: 8, borderRadius: 999, background: colColor[s] }} /><Eyebrow>{s}</Eyebrow></div>
                  <span style={{ ...mono, color: C.creamSoft, fontSize: 11 }}>{col.length}</span>
                </div>
                <div className="grid gap-2.5" style={{ background: C.base2, border: `1px solid ${C.line}`, borderRadius: 12, padding: 9, minHeight: 90 }}>
                  {col.length === 0 ? <div style={{ color: C.creamSoft, fontSize: 12, textAlign: "center", padding: 14 }}>—</div>
                    : col.map((t) => <TaskCard key={t.id} t={t} compact onStatus={actions.updateTaskStatus} onDelete={actions.deleteTask} />)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {tasks.map((t) => <TaskCard key={t.id} t={t} compact onStatus={actions.updateTaskStatus} onDelete={actions.deleteTask} />)}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   VIEW: Daily Business Log  (/dashboard/log)
   DailyLogEditor + connector placeholders
   ============================================================ */
const connectors = ["Shopify", "Acuity", "RezClick", "Eventbrite", "Google Calendar", "Gmail", "Google Analytics", "Meta Ads", "Instagram", "TikTok", "Stripe", "Square", "PayPal", "Search Console"];
const logFields = [["sales", "Sales notes"], ["issues", "Customer issues"], ["classPerf", "Class performance"], ["inquiries", "Event inquiries"], ["marketing", "Marketing actions"], ["website", "Website changes"], ["ideas", "New ideas"], ["problems", "Problems"], ["wins", "Wins"], ["watch", "Things to watch"]];
function DailyLogEditor({ onSave }) {
  const blank = { date: todayISO() }; logFields.forEach(([k]) => (blank[k] = ""));
  const [f, setF] = useState(blank);
  const summarize = () => {
    const wins = f.wins || "steady day"; const probs = f.problems || "none flagged";
    return `AI summary (mock): Wins — ${wins}. Problems — ${probs}. Watch — ${f.watch || "n/a"}. Suggested next move: convert today's inquiries into quotes and log fill rates. Wire an AI key to auto-summarize.`;
  };
  return (
    <Card style={{ background: C.base2, border: `1px solid ${C.line}` }}>
      <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 12 }}>
        <div className="flex items-center gap-2"><PenLine size={15} style={{ color: C.ochre }} /><Eyebrow color={C.ochre}>New log entry</Eyebrow></div>
        <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} style={{ ...mono, fontSize: 12, background: C.rail, border: `1px solid ${C.line}`, borderRadius: 8, color: C.cream, padding: "5px 8px" }} />
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {logFields.map(([k, label]) => (
          <div key={k}>
            <div style={{ ...mono, fontSize: 9.5, textTransform: "uppercase", letterSpacing: 1, color: C.creamSoft, marginBottom: 3 }}>{label}</div>
            <textarea value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} rows={2} style={{ width: "100%", background: C.rail, border: `1px solid ${C.line}`, borderRadius: 8, padding: 8, fontSize: 12.5, color: C.cream, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
      </div>
      <button onClick={() => { onSave({ ...f, id: uid(), summary: summarize() }); setF(blank); }} className="inline-flex items-center gap-2" style={{ ...mono, fontSize: 11, textTransform: "uppercase", color: C.base, background: C.ochre, border: "none", padding: "9px 16px", borderRadius: 9, cursor: "pointer", marginTop: 14 }}><Save size={13} />Save today's log</button>
    </Card>
  );
}
function LogView({ logs, actions }) {
  return (
    <div>
      <SectionHead eyebrow="AI daily memory" title="Business log" desc="The single most important habit — a daily record so any AI (Claude, ChatGPT, future agents) can understand CCF over time. Manual now; built to auto-ingest later." />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <div>
          <DailyLogEditor onSave={actions.addLog} />
          <div className="flex items-center gap-2" style={{ margin: "22px 0 10px" }}><NotebookPen size={14} style={{ color: C.celadon }} /><Eyebrow color={C.celadon}>History · {logs.length}</Eyebrow></div>
          {logs.length === 0
            ? <Card style={{ background: C.base2, border: `1px dashed ${C.line}`, color: C.creamSoft, textAlign: "center", padding: 24 }}>No entries yet. Your first log seeds the business memory.</Card>
            : <div className="grid gap-2.5">{[...logs].reverse().map((l) => (
                <Card key={l.id} accent={C.celadon} style={{ padding: 13 }}>
                  <div className="flex items-center justify-between">
                    <span style={{ ...mono, fontSize: 12, color: C.ink }}>{l.date}</span>
                    <button onClick={() => actions.deleteLog(l.id)} style={{ color: C.inkMute, background: "none", border: "none", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>
                  {l.wins && <p style={{ fontSize: 12.5, color: C.ink, marginTop: 6 }}><b>Wins:</b> {l.wins}</p>}
                  {l.problems && <p style={{ fontSize: 12.5, color: C.ink }}><b>Problems:</b> {l.problems}</p>}
                  <p style={{ fontSize: 12, color: C.inkMute, marginTop: 6, fontStyle: "italic" }}>{l.summary}</p>
                </Card>))}</div>}
        </div>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Layers size={14} style={{ color: C.cobalt }} /><Eyebrow color={C.cobalt}>Data connectors · ready to wire</Eyebrow></div>
          <Card style={{ background: C.base2, border: `1px solid ${C.line}` }}>
            <p style={{ color: C.creamSoft, fontSize: 12.5, marginBottom: 12 }}>Placeholder modules with mock feeds. Add credentials to activate — architecture already expects them.</p>
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {connectors.map((c) => (
                <div key={c} className="flex items-center justify-between" style={{ background: C.rail, border: `1px solid ${C.line}`, borderRadius: 9, padding: "8px 10px" }}>
                  <span style={{ color: C.cream, fontSize: 12 }}>{c}</span>
                  <Chip color={C.inkMute}>mock</Chip>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Opportunity Radar  (/dashboard/opportunities)
   OpportunityCard
   ============================================================ */
function OpportunityView({ dismissed, actions }) {
  const locs = ["All", "Chicago", "Eugene", "Online"];
  const [loc, setLoc] = useState("All");
  const list = mockOpportunities.filter((o) => !dismissed.includes(o.id)).filter((o) => loc === "All" || o.loc === loc || o.loc === "All");
  const urgColor = { High: C.oxblood, Medium: C.ochre, Low: C.celadon };
  return (
    <div>
      <SectionHead eyebrow="Opportunity radar" title="What's worth chasing" desc="Trends, seasonal windows, local events, pricing gaps and underused assets — each with a first move you can take today." />
      <div style={{ marginBottom: 16 }}><CategoryFilter options={locs} value={loc} onChange={setLoc} /></div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
        {list.map((o) => {
          const g = glazeFor(o.cat);
          return (
            <Card key={o.id} accent={g}>
              <div className="flex items-start justify-between gap-2">
                <Chip color={g}>{o.cat}</Chip>
                <div className="flex gap-1.5"><Chip color={C.cobalt}>{o.loc}</Chip><Chip solid color={urgColor[o.urgency]}>{o.urgency}</Chip></div>
              </div>
              <h3 style={{ ...serif, color: C.ink, fontSize: 18, margin: "9px 0 6px" }}>{o.title}</h3>
              <div className="flex items-center gap-3" style={{ fontSize: 12.5, color: C.inkMute, marginBottom: 8 }}>
                <span><DollarSign size={11} style={{ display: "inline", marginRight: 3 }} />Value {o.value}</span>
              </div>
              <div style={{ background: "#FBF7EE", border: `1px solid ${C.paper2}`, borderRadius: 9, padding: "8px 10px", fontSize: 12.5, color: C.ink }}><b style={{ color: g }}>First move:</b> {o.action}</div>
              <div className="flex items-center gap-2" style={{ marginTop: 11 }}>
                <button onClick={() => actions.addTask({ id: uid(), title: o.action, category: o.cat, priority: o.urgency, status: "Planned", owner: "Yahya", deadline: "", impact: "High", effort: "Medium", service: "", location: o.loc, notes: o.title, source: "Opportunity Radar" })}
                  className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: "#fff", background: g, border: "none", padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}><ListChecks size={12} />To task</button>
                <button onClick={() => actions.dismissOpp(o.id)} style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: C.inkMute, background: "none", border: `1px solid ${C.inkMute}55`, padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}>Dismiss</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Private Events & Weddings  (/dashboard/private-events)
   ============================================================ */
const privatePackages = [
  { name: "Wedding Live Pottery", model: "$1,800 base + $22/guest keepsake", min: "60 guests", staff: "2 instructors", transport: "Van + 2 wheels", materials: "Clay, tools, boards", setup: "90 min", teardown: "45 min", customer: "Couples wanting an interactive keepsake moment", pitch: "Give guests a keepsake they made — a warm, hands-on moment between ceremony and reception that photographs beautifully.", copy: "Bring the wheel to your wedding. Guests throw a mini keepsake, you get a room full of stories (and one-of-a-kind favors).", email: "Hi [name] — congrats! For [date] with ~[count] guests, our Live Pottery activation runs from $1,800 (2 artists, all materials, setup + teardown). Want me to hold the date with a deposit?" },
  { name: "Corporate Pottery Night", model: "$65/head, 10 min", min: "10 people", staff: "1–2 instructors", transport: "Off-site kit or in-studio", materials: "Hand-building clay, glaze", setup: "45 min", teardown: "30 min", customer: "HR / team leads, offsites, WeWork tenants", pitch: "A team-building night people actually talk about — low pressure, high laughter, everyone leaves with something they made.", copy: "Team building without the trust falls. Clay, drinks, and a room of colleagues making a mess together.", email: "Hi [name] — for a team of [count] we can do an in-studio or on-site Pottery Night at $65/head (all materials + instruction). Weeknights work well. Want a hold on [date]?" },
  { name: "Team Tiles Mural", model: "$65/head", min: "12 people", staff: "1 instructor", transport: "Kit", materials: "Bisque tiles, glaze", setup: "40 min", teardown: "25 min", customer: "Companies wanting a lasting artifact", pitch: "Everyone makes one tile; together they become a mural for your office. Collaboration you can hang on a wall.", copy: "One tile each. One mural together. A team artifact that outlasts the offsite.", email: "Hi [name] — Team Tiles runs $65/head (min 12). Each person paints a tile, we fire them, and you get a mounted mural ~2 weeks later. Shall I pencil in [date]?" },
  { name: "Mobile Wheel Activation", model: "$1,500 / 3 hrs", min: "3-hr block", staff: "2 artists", transport: "Van + 2 wheels", materials: "Clay, aprons, boards", setup: "60 min", teardown: "40 min", customer: "Festivals, brand activations, markets", pitch: "A live wheel draws a crowd. Perfect for festivals, launches, and brand moments that need motion and mess.", copy: "The wheel is the show. Live throwing that stops foot traffic and starts conversations.", email: "Hi [name] — our Mobile Wheel Activation is $1,500 for a 3-hour block (2 artists, all gear). Great for [event]. Want availability for [date]?" },
];
function PrivateEventsView({ actions }) {
  return (
    <div>
      <SectionHead eyebrow="Private events & weddings" title="Your highest-margin room" desc="Off-site and private packages with pricing, staffing, logistics, ready website copy and inquiry replies — built to close fast." />
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))" }}>
        {privatePackages.map((p) => {
          const g = glazeFor(p.name);
          return (
            <Card key={p.name} accent={g}>
              <div className="flex items-center justify-between">
                <h3 style={{ ...serif, color: C.ink, fontSize: 20 }}>{p.name}</h3>
                <Chip solid color={g}>{p.model}</Chip>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "1fr 1fr", margin: "11px 0", fontSize: 12, color: C.inkMute }}>
                <span><Users size={11} style={{ display: "inline", marginRight: 5 }} />Min {p.min}</span>
                <span><Star size={11} style={{ display: "inline", marginRight: 5 }} />{p.staff}</span>
                <span><Truck size={11} style={{ display: "inline", marginRight: 5 }} />{p.transport}</span>
                <span><Palette size={11} style={{ display: "inline", marginRight: 5 }} />{p.materials}</span>
                <span><Clock size={11} style={{ display: "inline", marginRight: 5 }} />Setup {p.setup}</span>
                <span><Clock size={11} style={{ display: "inline", marginRight: 5 }} />Teardown {p.teardown}</span>
              </div>
              <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}><b style={{ color: g }}>Ideal:</b> {p.customer}</p>
              <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, marginTop: 6, fontStyle: "italic" }}>{p.pitch}</p>
              <div style={{ background: "#FBF7EE", border: `1px solid ${C.paper2}`, borderRadius: 9, padding: "9px 11px", fontSize: 12.5, color: C.ink, marginTop: 9 }}><b style={{ color: g }}>Web copy:</b> {p.copy}</div>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 11 }}>
                <CopyButton text={p.email} label="Copy inquiry reply" />
                <CopyButton text={`${p.name} — ${p.copy}`} label="Copy web copy" />
                <button onClick={() => actions.addTask({ id: uid(), title: `Push ${p.name}`, category: "Private events", priority: "High", status: "Planned", owner: "Yahya", deadline: "", impact: "High", effort: "Medium", service: p.name, location: "All", notes: p.model, source: "Private Events" })}
                  style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: "#fff", background: g, border: "none", padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}>Promote →</button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Decision Assistant  (/dashboard/ask)
   AIResponsePanel
   ============================================================ */
function AskView({ actions }) {
  const qs = Object.keys(decisionResponses);
  const [q, setQ] = useState(null);
  const r = q ? decisionResponses[q] : null;
  return (
    <div>
      <SectionHead eyebrow="Decision assistant" title="Ask the studio brain" desc="Structured answers to the questions that actually move revenue. Mock now — the prompt scaffolding is wired to drop in Claude or OpenAI." />
      <div className="grid gap-4" style={{ gridTemplateColumns: "0.85fr 1.15fr" }}>
        <div className="grid gap-2" style={{ alignContent: "start" }}>
          {qs.map((question) => (
            <button key={question} onClick={() => setQ(question)} className="flex items-center justify-between text-left transition-all hover:translate-x-0.5"
              style={{ background: q === question ? C.railHi : C.base2, border: `1px solid ${q === question ? C.ochre : C.line}`, borderRadius: 11, padding: "12px 14px", cursor: "pointer" }}>
              <span style={{ color: C.cream, fontSize: 13.5 }}>{question}</span>
              <ArrowRight size={14} style={{ color: q === question ? C.ochre : C.creamSoft }} />
            </button>
          ))}
        </div>
        <div>
          {!r ? (
            <Card style={{ background: C.base2, border: `1px dashed ${C.line}`, textAlign: "center", padding: 40, color: C.creamSoft }}>
              <MessageSquareQuote size={30} style={{ color: C.line, margin: "0 auto 10px" }} />
              Pick a question to get a structured recommendation.
            </Card>
          ) : (
            <Card accent={C.ochre}>
              <Eyebrow color={C.ochre}>Recommendation</Eyebrow>
              <h3 style={{ ...serif, color: C.ink, fontSize: 23, margin: "7px 0 12px" }}>{r.rec}</h3>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.inkMute, marginBottom: 5 }}>Because</div>
              <ul style={{ margin: "0 0 14px", paddingLeft: 16, color: C.ink, fontSize: 13.5, lineHeight: 1.6 }}>{r.because.map((b, i) => <li key={i}>{b}</li>)}</ul>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.inkMute, marginBottom: 5 }}>Do this</div>
              <ol style={{ margin: "0 0 14px", paddingLeft: 16, color: C.ink, fontSize: 13.5, lineHeight: 1.6 }}>{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
              <div className="flex items-center gap-2">
                <button onClick={() => actions.addTask({ id: uid(), title: r.rec, category: "Strategy", priority: "High", status: "Planned", owner: "Yahya", deadline: "", impact: "High", effort: "Medium", service: "", location: "All", notes: r.steps.join(" → "), source: "Decision Assistant" })}
                  className="inline-flex items-center gap-1.5" style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: "#fff", background: C.ochre, border: "none", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}><ListChecks size={12} />Make it a task</button>
                <CopyButton text={`Q: ${q}\nRec: ${r.rec}\nBecause: ${r.because.join("; ")}\nSteps: ${r.steps.join(" → ")}`} />
              </div>
            </Card>
          )}
          <div style={{ marginTop: 16 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}><Wand2 size={14} style={{ color: C.celadon }} /><Eyebrow color={C.celadon}>Prompt library · copy into Claude / ChatGPT</Eyebrow></div>
            <div className="grid gap-2">
              {aiPromptTemplates.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-2" style={{ background: C.base2, border: `1px solid ${C.line}`, borderRadius: 9, padding: "9px 11px" }}>
                  <span style={{ color: C.cream, fontSize: 12.5 }}>{p.name}</span>
                  <CopyButton text={p.prompt} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VIEW: Knowledge Base  (/dashboard/knowledge)
   ============================================================ */
function KnowledgeView({ kb, actions }) {
  return (
    <div>
      <SectionHead eyebrow="CCF knowledge base" title="The brain any AI reads first" desc="Company identity, policies, pricing rules, voice and objections — editable, saved, and structured so agents give on-brand answers." />
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))" }}>
        {Object.keys(knowledgeBaseSeed).map((section) => (
          <KBCard key={section} section={section} value={kb[section] ?? knowledgeBaseSeed[section]} onSave={actions.saveKb} />
        ))}
      </div>
    </div>
  );
}
function KBCard({ section, value, onSave }) {
  const g = glazeFor(section);
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const dirty = draft !== value;
  return (
    <Card accent={g}>
      <div className="flex items-center justify-between">
        <h3 style={{ ...serif, color: C.ink, fontSize: 17 }}>{section}</h3>
        {dirty && <span style={{ width: 8, height: 8, borderRadius: 999, background: C.ochre }} />}
      </div>
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={5} style={{ width: "100%", background: "#FBF7EE", border: `1px solid ${C.paper2}`, borderRadius: 9, padding: 10, fontSize: 12.5, color: C.ink, resize: "vertical", outline: "none", marginTop: 9, lineHeight: 1.5, boxSizing: "border-box" }} />
      <div className="flex items-center justify-between" style={{ marginTop: 8 }}>
        <CopyButton text={`${section}:\n${draft}`} />
        <button onClick={() => onSave(section, draft)} disabled={!dirty} style={{ ...mono, fontSize: 10.5, textTransform: "uppercase", color: dirty ? "#fff" : C.inkMute, background: dirty ? g : "transparent", border: dirty ? "none" : `1px solid ${C.inkMute}44`, padding: "5px 11px", borderRadius: 8, cursor: dirty ? "pointer" : "default" }}>Save</button>
      </div>
    </Card>
  );
}

/* ============================================================
   SHELL — SidebarNav + DashboardLayout + App
   ============================================================ */
const NAV = [
  { id: "daily", label: "Daily Command", icon: LayoutDashboard },
  { id: "ideas", label: "Brainstorm", icon: Sparkles },
  { id: "classes", label: "Class Lab", icon: GraduationCap },
  { id: "content", label: "Content Factory", icon: Clapperboard },
  { id: "tasks", label: "Task Planner", icon: ListChecks },
  { id: "log", label: "Business Log", icon: NotebookPen },
  { id: "opportunities", label: "Opportunity Radar", icon: Radar },
  { id: "private-events", label: "Private & Weddings", icon: PartyPopper },
  { id: "ask", label: "Decision Assistant", icon: MessageSquareQuote },
  { id: "knowledge", label: "Knowledge Base", icon: BookOpen },
];

export default function App() {
  const [route, setRoute] = useState("daily");
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = usePersistentState("ccf_ideas", mockIdeas);
  const [tasks, setTasks] = usePersistentState("ccf_tasks", mockTasks);
  const [logs, setLogs] = usePersistentState("ccf_logs", []);
  const [kb, setKb] = usePersistentState("ccf_kb", {});
  const [classNotes, setClassNotes] = usePersistentState("ccf_classnotes", {});
  const [dismissed, setDismissed] = usePersistentState("ccf_opps_dismissed", []);

  const actions = useMemo(() => ({
    addIdea: (i) => setIdeas((p) => [{ ...i, id: i.id || uid() }, ...p.filter((x) => x.id !== i.id)]),
    deleteIdea: (id) => setIdeas((p) => p.filter((x) => x.id !== id)),
    convertIdeaToTask: (i) => { setTasks((p) => [{ id: uid(), title: i.title, category: i.category, priority: "Medium", status: "Idea", owner: "Yahya", deadline: "", impact: i.profit || "Medium", effort: i.difficulty || "Medium", service: "", location: "All", notes: i.concept || "", source: "Brainstorm" }, ...p]); setRoute("tasks"); },
    addTask: (t) => setTasks((p) => [{ ...t, id: t.id || uid() }, ...p]),
    updateTaskStatus: (id, status) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, status } : t))),
    deleteTask: (id) => setTasks((p) => p.filter((t) => t.id !== id)),
    addLog: (l) => setLogs((p) => [...p, l]),
    deleteLog: (id) => setLogs((p) => p.filter((l) => l.id !== id)),
    saveKb: (s, v) => setKb((p) => ({ ...p, [s]: v })),
    saveClassNote: (c, v) => setClassNotes((p) => ({ ...p, [c]: v })),
    dismissOpp: (id) => setDismissed((p) => [...p, id]),
  }), [setIdeas, setTasks, setLogs, setKb, setClassNotes, setDismissed]);

  const go = (r) => { setRoute(r); setOpen(false); };

  const views = {
    daily: <DailyView d={mockDailyDashboard} ideas={ideas} tasks={tasks} logs={logs} go={go} />,
    ideas: <IdeasView ideas={ideas} actions={actions} />,
    classes: <ClassesView classNotes={classNotes} actions={actions} />,
    content: <ContentView actions={actions} />,
    tasks: <TasksView tasks={tasks} actions={actions} />,
    log: <LogView logs={logs} actions={actions} />,
    opportunities: <OpportunityView dismissed={dismissed} actions={actions} />,
    "private-events": <PrivateEventsView actions={actions} />,
    ask: <AskView actions={actions} />,
    knowledge: <KnowledgeView kb={kb} actions={actions} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.base, color: C.cream, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* SidebarNav */}
      <aside style={{ width: 244, background: C.rail, borderRight: `1px solid ${C.line}`, padding: "20px 14px", position: "sticky", top: 0, height: "100vh", flexShrink: 0, display: "flex", flexDirection: "column" }}
        className="max-md:fixed max-md:z-40 max-md:transition-transform" data-open={open}>
        <div style={{ padding: "0 6px 18px" }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${C.sienna}, ${C.ochre} 45%, ${C.celadon} 78%, ${C.cobalt})` }} />
            <div>
              <div style={{ ...serif, fontSize: 16, color: C.cream, lineHeight: 1 }}>Color Cocktail</div>
              <div style={{ ...mono, fontSize: 9, letterSpacing: 2, color: C.creamSoft, textTransform: "uppercase" }}>Growth Console</div>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-1" style={{ flex: 1 }}>
          {NAV.map((n) => {
            const active = route === n.id;
            return (
              <button key={n.id} onClick={() => go(n.id)} className="flex items-center gap-2.5 text-left transition-colors"
                style={{ padding: "9px 11px", borderRadius: 9, cursor: "pointer", border: "none", background: active ? C.railHi : "transparent", color: active ? C.cream : C.creamSoft, borderLeft: active ? `2px solid ${C.ochre}` : "2px solid transparent" }}>
                <n.icon size={16} style={{ color: active ? C.ochre : C.creamSoft }} />
                <span style={{ fontSize: 13 }}>{n.label}</span>
              </button>
            );
          })}
        </nav>
        <div style={{ ...mono, fontSize: 9.5, color: C.line, padding: "12px 6px 0", letterSpacing: 1 }}>CHICAGO · EUGENE · ONLINE</div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="md:hidden" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 30 }} />}

      <main style={{ flex: 1, minWidth: 0 }}>
        <header className="md:hidden flex items-center gap-3" style={{ padding: "12px 16px", borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, background: C.base, zIndex: 20 }}>
          <button onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "none", color: C.cream, cursor: "pointer" }}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <span style={{ ...serif, fontSize: 15 }}>CCF Growth Console</span>
        </header>
        <div style={{ padding: "26px 30px 60px", maxWidth: 1180, margin: "0 auto" }}>{views[route]}</div>
      </main>

      <style>{`
        @media (max-width: 767px){
          aside[data-open="false"]{ transform: translateX(-100%); }
          aside[data-open="true"]{ transform: translateX(0); }
        }
        textarea::placeholder, input::placeholder{ color:#8a7c68; }
        *{ box-sizing: border-box; }
      `}</style>
    </div>
  );
}
