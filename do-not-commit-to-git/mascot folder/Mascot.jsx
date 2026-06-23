// Mascot.jsx — comma-eyed React mascot with morphing expressions.
//
// Drop-in instructions
// --------------------
// • This file uses inline JSX. Load it with <script type="text/babel" src="...">
//   or transpile it as part of your build.
// • Pair it with mascot.css for the wrapper + bob + eye-pop animation.
// • Exports the global `Mascot` (component) and `EXPRESSIONS` (vocab list).
//
// Props
// -----
//   size       (number, px)              default 240
//   expression (string, see EXPRESSIONS) default "comma"
//   color      ([from, to] hex pair OR
//               single hex string)       default ["#14558E", "#153A5A"]
//   eyeColor   (hex)                     default "#fff"
//   follow     (bool, eyes track cursor) default true
//   idle       (bool, auto idle cycle)   default true
//   bob        (bool, gentle bob)        default true
//   onClick    (fn)                      default undefined

const { useEffect, useRef, useState, useMemo } = React;

// Eye shapes — all defined on an 80×80 viewBox. Left eye centers at (39,31),
// right eye at (57,31). The pair-center is (48,31).
const EYE_GEOMETRY = {
  // Default: the OpenSearch-style comma, scaled and mirrored per side.
  comma: {
    left:  "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z",
    right: "M 52.683 36.338 C 53.807 36.175 55.166 35.792 56.484 34.55 C 59.213 31.978 59.23 27.557 56.948 25.291 C 56.054 24.404 54.446 24.068 53.112 25.325 C 52.532 25.871 52.42 26.47 52.547 27.187 C 52.667 27.87 52.994 28.604 53.365 29.436 C 53.813 30.44 54.34 31.599 54.409 32.77 C 54.491 34.173 54.241 35.386 52.683 36.338 Z",
  },
  // Blink _ _
  blink: {
    left:  "M36.9 30.5H41.1V33.0H36.9V30.5Z",
    right: "M54.9 30.5H59.1V33.0H54.9V30.5Z",
  },
  // Happy ^ ^
  happy: {
    left:  "M36.4 33L39.0 28.5L41.6 33L40.4 33L39.0 30.6L37.6 33Z",
    right: "M54.4 33L57.0 28.5L59.6 33L58.4 33L57.0 30.6L55.6 33Z",
  },
  // Dot . .
  dot: {
    left:  "M37.7 30.3H40.3V32.9H37.7V30.3Z",
    right: "M55.7 30.3H58.3V32.9H55.7V30.3Z",
  },
  // Squint > <
  squint: {
    left:  "M36.6 28L41.4 31L36.6 34L36.6 32.5L39.3 31L36.6 29.5Z",
    right: "M59.4 28L54.6 31L59.4 34L59.4 32.5L56.7 31L59.4 29.5Z",
  },
  // Wow — "robot O" rounded rectangle (5w × 7.8h, r=2)
  wow: {
    left:  "M 38.5 27.1 L 39.5 27.1 A 2 2 0 0 1 41.5 29.1 L 41.5 32.9 A 2 2 0 0 1 39.5 34.9 L 38.5 34.9 A 2 2 0 0 1 36.5 32.9 L 36.5 29.1 A 2 2 0 0 1 38.5 27.1 Z",
    right: "M 56.5 27.1 L 57.5 27.1 A 2 2 0 0 1 59.5 29.1 L 59.5 32.9 A 2 2 0 0 1 57.5 34.9 L 56.5 34.9 A 2 2 0 0 1 54.5 32.9 L 54.5 29.1 A 2 2 0 0 1 56.5 27.1 Z",
  },
  // Wink — left comma, right blink
  wink: {
    left:  "M 34.683 36.338 C 35.807 36.175 37.166 35.792 38.484 34.55 C 41.213 31.978 41.23 27.557 38.948 25.291 C 38.054 24.404 36.446 24.068 35.112 25.325 C 34.532 25.871 34.42 26.47 34.547 27.187 C 34.667 27.87 34.994 28.604 35.365 29.436 C 35.813 30.44 36.34 31.599 36.409 32.77 C 36.491 34.173 36.241 35.386 34.683 36.338 Z",
    right: "M54.9 30.5H59.1V33.0H54.9V30.5Z",
  },
  // Sleep / dead x x
  xx: {
    left:  "M36.7 28.5L37.7 27.5L41.3 33.5L40.3 34.5ZM40.3 27.5L41.3 28.5L37.7 34.5L36.7 33.5Z",
    right: "M54.7 28.5L55.7 27.5L59.3 33.5L58.3 34.5ZM58.3 27.5L59.3 28.5L55.7 34.5L54.7 33.5Z",
  },
  // Heart eyes — pixel-art hearts (CLI-style), 7×6 grid of 1-unit squares.
  heart: {
    left:  "M36.50 28.00h1.00v1.00h-1.00zM37.50 28.00h1.00v1.00h-1.00zM39.50 28.00h1.00v1.00h-1.00zM40.50 28.00h1.00v1.00h-1.00zM35.50 29.00h1.00v1.00h-1.00zM36.50 29.00h1.00v1.00h-1.00zM37.50 29.00h1.00v1.00h-1.00zM38.50 29.00h1.00v1.00h-1.00zM39.50 29.00h1.00v1.00h-1.00zM40.50 29.00h1.00v1.00h-1.00zM41.50 29.00h1.00v1.00h-1.00zM35.50 30.00h1.00v1.00h-1.00zM36.50 30.00h1.00v1.00h-1.00zM37.50 30.00h1.00v1.00h-1.00zM38.50 30.00h1.00v1.00h-1.00zM39.50 30.00h1.00v1.00h-1.00zM40.50 30.00h1.00v1.00h-1.00zM41.50 30.00h1.00v1.00h-1.00zM36.50 31.00h1.00v1.00h-1.00zM37.50 31.00h1.00v1.00h-1.00zM38.50 31.00h1.00v1.00h-1.00zM39.50 31.00h1.00v1.00h-1.00zM40.50 31.00h1.00v1.00h-1.00zM37.50 32.00h1.00v1.00h-1.00zM38.50 32.00h1.00v1.00h-1.00zM39.50 32.00h1.00v1.00h-1.00zM38.50 33.00h1.00v1.00h-1.00z",
    right: "M54.50 28.00h1.00v1.00h-1.00zM55.50 28.00h1.00v1.00h-1.00zM57.50 28.00h1.00v1.00h-1.00zM58.50 28.00h1.00v1.00h-1.00zM53.50 29.00h1.00v1.00h-1.00zM54.50 29.00h1.00v1.00h-1.00zM55.50 29.00h1.00v1.00h-1.00zM56.50 29.00h1.00v1.00h-1.00zM57.50 29.00h1.00v1.00h-1.00zM58.50 29.00h1.00v1.00h-1.00zM59.50 29.00h1.00v1.00h-1.00zM53.50 30.00h1.00v1.00h-1.00zM54.50 30.00h1.00v1.00h-1.00zM55.50 30.00h1.00v1.00h-1.00zM56.50 30.00h1.00v1.00h-1.00zM57.50 30.00h1.00v1.00h-1.00zM58.50 30.00h1.00v1.00h-1.00zM59.50 30.00h1.00v1.00h-1.00zM54.50 31.00h1.00v1.00h-1.00zM55.50 31.00h1.00v1.00h-1.00zM56.50 31.00h1.00v1.00h-1.00zM57.50 31.00h1.00v1.00h-1.00zM58.50 31.00h1.00v1.00h-1.00zM55.50 32.00h1.00v1.00h-1.00zM56.50 32.00h1.00v1.00h-1.00zM57.50 32.00h1.00v1.00h-1.00zM56.50 33.00h1.00v1.00h-1.00z",
  },
};

const EXPRESSIONS = [
  { id: "comma",  label: "default",  emoji: ", ," },
  { id: "blink",  label: "blink",    emoji: "_ _" },
  { id: "happy",  label: "happy",    emoji: "^ ^" },
  { id: "dot",    label: "alert",    emoji: ". ." },
  { id: "squint", label: "squint",   emoji: "> <" },
  { id: "wow",    label: "wow",      emoji: "O O" },
  { id: "wink",   label: "wink",     emoji: ", _" },
  { id: "heart",  label: "love",     emoji: "<3<3" },
  { id: "xx",     label: "sleep",    emoji: "x x" },
];

function Mascot({
  size = 240,
  expression = "comma",
  color = ["#14558E", "#153A5A"],
  eyeColor = "#fff",
  follow = true,
  idle = true,
  bob = true,
  onClick,
}) {
  const wrapRef = useRef(null);
  const [autoState, setAutoState] = useState(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  // ---- Auto idle loop ----
  // Drifts through micro-expressions, returning to the resting `comma` state.
  // Blink is weighted heavier so blinks dominate the idle gesture.
  useEffect(() => {
    if (!idle) return;
    let alive = true;
    const POOL = [
      { id: "blink",  weight: 4, hold: 130 },
      { id: "dot",    weight: 2, hold: 320 },
      { id: "squint", weight: 1, hold: 380 },
      { id: "happy",  weight: 1, hold: 420 },
      { id: "wow",    weight: 1, hold: 360 },
      { id: "wink",   weight: 1, hold: 380 },
    ];
    const totalWeight = POOL.reduce((s, p) => s + p.weight, 0);
    const pick = () => {
      let r = Math.random() * totalWeight;
      for (const p of POOL) { if ((r -= p.weight) <= 0) return p; }
      return POOL[0];
    };

    let timer;
    const tick = () => {
      if (!alive) return;
      const p = pick();
      setAutoState(p.id);
      const double = p.id === "blink" && Math.random() < 0.18;
      setTimeout(() => {
        if (!alive) return;
        setAutoState(null);
        if (double) {
          setTimeout(() => {
            if (!alive) return;
            setAutoState("blink");
            setTimeout(() => alive && setAutoState(null), 120);
          }, 150);
        }
      }, p.hold);
      const rest = (p.id === "blink" ? 2400 : 3200) + Math.random() * 2600;
      timer = setTimeout(tick, rest);
    };
    timer = setTimeout(tick, 1600);
    return () => { alive = false; clearTimeout(timer); };
  }, [idle]);

  // ---- Eye-tracking ----
  useEffect(() => {
    if (!follow) { setPupilOffset({ x: 0, y: 0 }); return; }
    const onMove = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const len = Math.hypot(dx, dy) || 1;
      const maxOff = 1.2;
      const k = Math.min(len / 220, 1);
      setPupilOffset({ x: (dx / len) * maxOff * k, y: (dy / len) * maxOff * k });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [follow]);

  const active = autoState || expression;
  const geom = EYE_GEOMETRY[active] || EYE_GEOMETRY.comma;

  // ---- Small-size legibility ----
  // As the mascot shrinks below ~200px, eyes grow AND pull slightly inward so
  // the expression still reads. eyeScale grows each eye from its own center
  // (no outward drift); eyeSpread is floor-clamped so scaled eyes always keep
  // ≥4 viewBox units of edge gap.
  const eyeScale = (() => {
    if (size >= 200) return 1.0;
    if (size <= 20)  return 2.0;
    const t = (200 - size) / (200 - 20);
    return 1.0 + Math.pow(t, 1.3) * 1.0;
  })();
  const eyeSpread = (() => {
    let pref;
    if (size >= 200) pref = 1.0;
    else if (size <= 20) pref = 0.85;
    else {
      const t = (200 - size) / (200 - 20);
      pref = 1.0 - Math.pow(t, 1.3) * 0.15;
    }
    // edge gap = 18*spread − 6*scale ≥ 4  →  spread ≥ (4 + 6*scale)/18
    const minSpread = (4 + 6 * eyeScale) / 18;
    return Math.max(pref, minSpread);
  })();
  const LEFT_CX = 39, RIGHT_CX = 57, EYE_CY = 31, PAIR_CX = 48;
  const leftDx  =  (PAIR_CX - LEFT_CX)  * (1 - eyeSpread);
  const rightDx = -(RIGHT_CX - PAIR_CX) * (1 - eyeSpread);

  const palette = Array.isArray(color) ? color : [color, color];
  const scheme = { from: palette[0], to: palette[1] || palette[0] };
  const gid = useMemo(() => "g_" + Math.random().toString(36).slice(2, 8), []);

  const bobClass = bob ? "mascot-bob" : "";

  return (
    <div
      ref={wrapRef}
      className={`mascot-wrap ${bobClass}`}
      style={{ width: size, height: size, cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div
        className="mascot-shadow"
        style={{ width: size * 0.55, height: size * 0.08, bottom: -size * 0.04 }}
      />
      <svg viewBox="0 0 80 80" width={size} height={size} className="mascot-svg">
        <defs>
          <linearGradient id={gid} x1="40" y1="80" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor={scheme.to} />
            <stop offset="1" stopColor={scheme.from} />
          </linearGradient>
          <radialGradient id={gid + "_hl"} cx="0.3" cy="0.25" r="0.6">
            <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="39.5" fill={`url(#${gid})`} />
        <ellipse cx="28" cy="22" rx="22" ry="14" fill={`url(#${gid}_hl)`} />
        {/* Each eye scales from its own center; the pair pulls inward at small sizes. */}
        <g transform={`translate(${pupilOffset.x + leftDx}, ${pupilOffset.y}) translate(${LEFT_CX}, ${EYE_CY}) scale(${eyeScale}) translate(${-LEFT_CX}, ${-EYE_CY})`}>
          <MorphPath d={geom.left} fill={eyeColor} />
        </g>
        <g transform={`translate(${pupilOffset.x + rightDx}, ${pupilOffset.y}) translate(${RIGHT_CX}, ${EYE_CY}) scale(${eyeScale}) translate(${-RIGHT_CX}, ${-EYE_CY})`}>
          <MorphPath d={geom.right} fill={eyeColor} />
        </g>
      </svg>
    </div>
  );
}

// MorphPath — keyed on `d` so swap looks like a quick pop rather than a snap.
function MorphPath({ d, fill }) {
  return (
    <path
      d={d}
      fill={fill}
      key={d}
      style={{ animation: "eye-pop 160ms ease-out" }}
    />
  );
}

window.Mascot = Mascot;
window.EXPRESSIONS = EXPRESSIONS;
window.EYE_GEOMETRY = EYE_GEOMETRY;
