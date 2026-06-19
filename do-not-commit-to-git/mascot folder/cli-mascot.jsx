// cli-mascot.jsx — text-based mascot renderer.
// A template is a string with `{e}` substituted for the current eye string.
// Each eye string is exactly 3 characters wide so template alignment is preserved.

const { useEffect, useState } = React;

// 3-char-wide eye strings, one per expression — matched to the SVG mascot's vocabulary.
const CLI_EYES = {
  comma:  ", ,",
  blink:  "_ _",
  happy:  "^ ^",
  dot:    ". .",
  squint: "> <",
  wow:    "O O",
  wink:   ", _",
  heart:  "<3<3", // 4-char exception — handled with a tighter slot below
  xx:     "x x",
};

// For the heart (4-char) we substitute a different placeholder `{h}` so each
// template can carve a 4-wide slot just for it without breaking 3-wide layouts.
function renderTemplate(template, expression) {
  const e = CLI_EYES[expression] || CLI_EYES.comma;
  if (expression === "heart") {
    // For heart, replace {e} with `<3<3` but trim 1 char of trailing padding to keep width.
    return template
      .replace(/\{e\}( ?)/g, (_, pad) => "<3<3" + (pad ? "" : ""))
      .replace(/\{e\}/g, "<3<3");
  }
  return template.replaceAll("{e}", e);
}

// Idle loop identical in spirit to SVG mascot: drifts between resting `comma`
// and a weighted pool of micro-expressions.
function useIdleExpression(enabled, seed = 0) {
  const [state, setState] = useState("comma");
  useEffect(() => {
    if (!enabled) { setState("comma"); return; }
    let alive = true;
    const POOL = [
      { id: "blink",  weight: 4, hold: 180 },
      { id: "dot",    weight: 2, hold: 360 },
      { id: "squint", weight: 1, hold: 420 },
      { id: "happy",  weight: 1, hold: 460 },
      { id: "wow",    weight: 1, hold: 380 },
      { id: "wink",   weight: 1, hold: 420 },
      { id: "heart",  weight: 1, hold: 480 },
    ];
    const total = POOL.reduce((s, p) => s + p.weight, 0);
    const pick = () => {
      let r = Math.random() * total;
      for (const p of POOL) if ((r -= p.weight) <= 0) return p;
      return POOL[0];
    };
    let timer;
    const tick = () => {
      if (!alive) return;
      const p = pick();
      setState(p.id);
      setTimeout(() => alive && setState("comma"), p.hold);
      const rest = (p.id === "blink" ? 2200 : 3000) + Math.random() * 2400;
      timer = setTimeout(tick, rest);
    };
    // Stagger initial fire so cards don't all blink in lockstep.
    timer = setTimeout(tick, 800 + seed * 380);
    return () => { alive = false; clearTimeout(timer); };
  }, [enabled, seed]);
  return state;
}

function CliMascot({ template, idle = true, seed = 0, expression: forcedExpr }) {
  const auto = useIdleExpression(idle && !forcedExpr, seed);
  const expression = forcedExpr || auto;
  return <pre className="cli-mascot">{renderTemplate(template, expression)}</pre>;
}

// ── Five CLI variants ──────────────────────────────────────────────────────
const VARIANTS = [
  {
    id: "bracket",
    name: "01 · bracket box",
    blurb: "minimal terminal log line. fits inline anywhere.",
    template:
`[              ]
[      {e}     ]
[              ]`,
  },
  {
    id: "boxdraw",
    name: "02 · rounded box-draw",
    blurb: "unicode box characters. clean dialog/notification feel.",
    template:
`╭──────────╮
│   {e}    │
╰──────────╯`,
  },
  {
    id: "face",
    name: "03 · ascii oval face",
    blurb: "slashes & underscores form a face silhouette.",
    template:
` ______
/      \\
|  {e}  |
\\______/`,
  },
  {
    id: "pixel",
    name: "04 · ansi block art",
    blurb: "shaded block characters mimic the circular svg mascot — eyes offset upper-right to match the source.",
    template:
`  ░▒▓█████▓▒░ 
 ░▓        ▓░ 
 ▓      {e} ▓ 
 ▓          ▓ 
 ▓          ▓ 
 ░▓        ▓░ 
  ░▒▓█████▓▒░ `,
  },
  {
    id: "prompt",
    name: "05 · shell prompt",
    blurb: "lives in the prompt itself. the mascot IS your shell.",
    template:
`opensearch@local ~
$ status --eyes
  {e}
$ _`,
  },
];

window.CliMascot = CliMascot;
window.CLI_VARIANTS = VARIANTS;
window.CLI_EYES = CLI_EYES;
