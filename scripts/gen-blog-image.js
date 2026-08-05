// Generates a branded blog cover image: a phone mockup with a checklist
// screen, surrounded by up to 4 icon badges. No text is baked in, so the
// same file can be reused for a DE/EN post pair via `image:` frontmatter.
//
// Usage:
//   node scripts/gen-blog-image.js --out app-maintenance-after-launch --badges shield,refresh,certificate,gear
//   node scripts/gen-blog-image.js --out what-does-an-app-cost --badges chart,certificate,shield,gear --checked 2
//
// Options:
//   --out      required. Output file becomes public/images/blog-<out>.webp
//   --badges   4 icon names (top-left,top-right,bottom-left,bottom-right),
//              comma-separated. Available: shield, refresh, certificate, gear, chart, lock
//   --checked  how many of the 4 checklist rows render as "done" (default 3)
//
// Colors are pulled from src/config/theme.json — if the brand palette
// changes there, update TEAL/LIME/NAVY below to match.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const W = 1600, H = 850;

const TEAL = "#1ac0b7";
const TEAL_DARK = "#0f8079";
const LIME = "#b4c134";
const NAVY = "#142430";
const NAVY_DEEP = "#0c1820";
const WHITE = "#ffffff";

// ---------- arg parsing ----------
function parseArgs(argv) {
  const args = { badges: "shield,refresh,certificate,gear", checked: "3" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--badges") args.badges = argv[++i];
    else if (a === "--checked") args.checked = argv[++i];
  }
  if (!args.out) {
    console.error("Usage: node scripts/gen-blog-image.js --out <slug> [--badges shield,refresh,certificate,gear] [--checked 3]");
    process.exit(1);
  }
  return args;
}

// ---------- geometry helpers ----------
function polar(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function gearPath(cx, cy, outerR, rootR, teeth) {
  const step = 360 / teeth;
  const toothW = step * 0.5;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const a1 = a0 + toothW;
    const a2 = a0 + step * 0.5;
    const a3 = a0 + step;
    const p0 = polar(cx, cy, rootR, a0);
    const p1 = polar(cx, cy, outerR, a0 + step * 0.12);
    const p2 = polar(cx, cy, outerR, a1 - step * 0.12);
    const p3 = polar(cx, cy, rootR, a2);
    d += (i === 0 ? "M " : "L ") + `${p0[0].toFixed(2)} ${p0[1].toFixed(2)} `;
    d += `L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} `;
    d += `L ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
    d += `L ${p3[0].toFixed(2)} ${p3[1].toFixed(2)} `;
  }
  return d + "Z";
}

function checkPath(cx, cy, s) {
  const p1 = [cx - 0.5 * s, cy + 0.02 * s];
  const p2 = [cx - 0.15 * s, cy + 0.35 * s];
  const p3 = [cx + 0.55 * s, cy - 0.35 * s];
  return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]}`;
}

function shieldPath(cx, cy, s) {
  const top = cy - s * 1.05, left = cx - s, right = cx + s, bottom = cy + s * 1.15;
  return `M ${cx} ${top}
    C ${left + s * 0.15} ${top + s * 0.25}, ${left} ${top + s * 0.55}, ${left} ${cy - s * 0.35}
    C ${left} ${cy + s * 0.35}, ${left + s * 0.35} ${cy + s * 0.85}, ${cx} ${bottom}
    C ${right - s * 0.35} ${cy + s * 0.85}, ${right} ${cy + s * 0.35}, ${right} ${cy - s * 0.35}
    C ${right} ${top + s * 0.55}, ${right - s * 0.15} ${top + s * 0.25}, ${cx} ${top}
    Z`;
}

function refreshIcon(cx, cy, r) {
  const sweep = 150;
  const a1start = 195, a1end = a1start + sweep;
  const a2start = a1start + 180, a2end = a1end + 180;
  function arcPath(start, end) {
    const ps = polar(cx, cy, r, start), pe = polar(cx, cy, r, end);
    return `M ${ps[0].toFixed(2)} ${ps[1].toFixed(2)} A ${r} ${r} 0 0 1 ${pe[0].toFixed(2)} ${pe[1].toFixed(2)}`;
  }
  function arrow(atAngle) {
    const tip = polar(cx, cy, r, atAngle);
    const size = r * 0.4;
    const tangent = (atAngle + 90) * Math.PI / 180;
    const back = [tip[0] - size * Math.cos(tangent), tip[1] - size * Math.sin(tangent)];
    const perp = tangent + Math.PI / 2;
    const w1 = [back[0] + size * 0.55 * Math.cos(perp), back[1] + size * 0.55 * Math.sin(perp)];
    const w2 = [back[0] - size * 0.55 * Math.cos(perp), back[1] - size * 0.55 * Math.sin(perp)];
    return `M ${tip[0].toFixed(2)} ${tip[1].toFixed(2)} L ${w1[0].toFixed(2)} ${w1[1].toFixed(2)} L ${w2[0].toFixed(2)} ${w2[1].toFixed(2)} Z`;
  }
  return {
    arc1: arcPath(a1start, a1end), arc2: arcPath(a2start, a2end),
    arrow1: arrow(a1end), arrow2: arrow(a2end),
  };
}

function ribbonTails(cx, cy, r) {
  const tailY = cy + r * 1.9;
  return {
    left: `M ${cx - r * 0.55} ${cy + r * 0.55} L ${cx - r * 0.95} ${tailY} L ${cx - r * 0.15} ${cy + r * 1.05} Z`,
    right: `M ${cx + r * 0.55} ${cy + r * 0.55} L ${cx + r * 0.95} ${tailY} L ${cx + r * 0.15} ${cy + r * 1.05} Z`,
  };
}

function lockPath(cx, cy, s) {
  const bodyW = s * 1.5, bodyH = s * 1.2;
  const body = `M ${cx - bodyW / 2} ${cy - bodyH / 2 + s * 0.3} h ${bodyW} v ${bodyH} h ${-bodyW} Z`;
  const shackleR = s * 0.55;
  const shackle = `M ${cx - shackleR} ${cy - bodyH / 2 + s * 0.3} v ${-shackleR * 0.6} a ${shackleR} ${shackleR} 0 0 1 ${shackleR * 2} 0 v ${shackleR * 0.6}`;
  return { body, shackle };
}

function chartBars(cx, cy, s) {
  // three ascending bars
  const w = s * 0.42, gap = s * 0.22;
  const heights = [s * 0.8, s * 1.3, s * 1.8];
  const bars = heights.map((h, i) => {
    const x = cx - (w * 3 + gap * 2) / 2 + i * (w + gap);
    const y = cy + s * 0.9 - h;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.25}" />`;
  });
  return bars.join("\n    ");
}

// ---------- icon registry: each returns SVG markup centered at (0,0), plus a badge fill color ----------
const ICONS = {
  shield: {
    fill: TEAL,
    render: () => `<path d="${shieldPath(0, 0, 34)}" fill="${WHITE}" />`,
  },
  refresh: {
    fill: WHITE,
    render: () => {
      const i = refreshIcon(0, 0, 34);
      return `
        <g fill="none" stroke="${NAVY}" stroke-width="7" stroke-linecap="round">
          <path d="${i.arc1}" /><path d="${i.arc2}" />
        </g>
        <g fill="${NAVY}"><path d="${i.arrow1}" /><path d="${i.arrow2}" /></g>`;
    },
  },
  certificate: {
    fill: WHITE,
    render: () => {
      const r = ribbonTails(0, 0, 30);
      return `
        <path d="${r.left}" fill="${LIME}" />
        <path d="${r.right}" fill="${LIME}" />
        <circle cx="0" cy="0" r="30" fill="${TEAL}" />
        <path d="${checkPath(0, 0, 30)}" stroke="${WHITE}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
    },
  },
  gear: {
    fill: LIME,
    render: () => `
      <path d="${gearPath(0, 0, 34, 23, 12)}" fill="${NAVY_DEEP}" />
      <circle cx="0" cy="0" r="14" fill="${LIME}" />`,
  },
  chart: {
    fill: WHITE,
    render: () => `<g fill="${TEAL}">${chartBars(0, 0, 34)}</g>`,
  },
  lock: {
    fill: TEAL,
    render: () => {
      const l = lockPath(0, 0, 26);
      return `
        <path d="${l.shackle}" fill="none" stroke="${WHITE}" stroke-width="7" stroke-linecap="round" />
        <path d="${l.body}" fill="${WHITE}" />`;
    },
  },
};

function badge(cx, cy, r, name, strokeColor) {
  const icon = ICONS[name];
  if (!icon) throw new Error(`Unknown icon "${name}". Available: ${Object.keys(ICONS).join(", ")}`);
  return `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${icon.fill}" stroke="${strokeColor}" stroke-width="4" />
    <g transform="translate(${cx},${cy})">${icon.render()}</g>`;
}

// ---------- main layout ----------
function buildSvg({ badges, checked }) {
  const phone = { x: 610, y: 130, w: 300, h: 610, r: 46 };
  const screen = { x: phone.x + 22, y: phone.y + 70, w: phone.w - 44, h: phone.h - 130, r: 22 };

  const rowsCount = 4, rowGap = 26, rowH = 56, rowsTop = screen.y + 96;
  const barWidths = [128, 150, 108, 138];
  let checklistSvg = "";
  for (let i = 0; i < rowsCount; i++) {
    const ry = rowsTop + i * (rowH + rowGap);
    const cx = screen.x + 34;
    const done = i < checked;
    checklistSvg += `
      <circle cx="${cx}" cy="${ry}" r="17" fill="${done ? LIME : "rgba(255,255,255,0.18)"}" />
      ${done ? `<path d="${checkPath(cx, ry, 22)}" stroke="${NAVY}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" />` : ""}
      <rect x="${cx + 34}" y="${ry - 7}" width="${barWidths[i]}" height="14" rx="7" fill="rgba(255,255,255,${done ? 0.85 : 0.35})" />
      <rect x="${cx + 34}" y="${ry + 13}" width="${barWidths[i] * 0.6}" height="8" rx="4" fill="rgba(255,255,255,${done ? 0.35 : 0.18})" />`;
  }

  let dots = "";
  for (let row = 0; row < 5; row++)
    for (let col = 0; col < 7; col++)
      dots += `<circle cx="${90 + col * 34}" cy="${610 + row * 34}" r="3.4" fill="rgba(255,255,255,0.16)" />`;

  const [tl, tr, bl, br] = badges;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${NAVY_DEEP}" />
      <stop offset="55%" stop-color="${NAVY}" />
      <stop offset="100%" stop-color="${TEAL_DARK}" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c3444" />
      <stop offset="100%" stop-color="${NAVY}" />
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)" />

  <circle cx="1320" cy="150" r="230" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />
  <circle cx="1320" cy="150" r="150" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2" />
  <circle cx="1320" cy="150" r="70" fill="rgba(26,192,183,0.12)" />

  ${dots}

  <rect x="${phone.x - 10}" y="${phone.y + 18}" width="${phone.w}" height="${phone.h}" rx="${phone.r}" fill="rgba(0,0,0,0.25)" />
  <rect x="${phone.x}" y="${phone.y}" width="${phone.w}" height="${phone.h}" rx="${phone.r}" fill="${WHITE}" />
  <rect x="${screen.x}" y="${screen.y}" width="${screen.w}" height="${screen.h}" rx="${screen.r}" fill="url(#screenGrad)" />
  <rect x="${phone.x + phone.w / 2 - 30}" y="${phone.y + 30}" width="60" height="7" rx="3.5" fill="rgba(20,36,48,0.25)" />

  <rect x="${screen.x + 24}" y="${screen.y + 26}" width="${screen.w - 48}" height="40" rx="12" fill="${TEAL}" />
  <circle cx="${screen.x + 46}" cy="${screen.y + 46}" r="9" fill="${WHITE}" opacity="0.9" />
  <rect x="${screen.x + 68}" y="${screen.y + 40}" width="90" height="12" rx="6" fill="rgba(255,255,255,0.85)" />

  ${checklistSvg}

  ${badge(560, 200, 62, tl, NAVY_DEEP)}
  ${badge(960, 200, 62, tr, NAVY_DEEP)}
  ${badge(560, 640, 62, bl, NAVY_DEEP)}
  ${badge(960, 660, 86, br, NAVY_DEEP)}
</svg>`.trim();
}

// ---------- run ----------
const args = parseArgs(process.argv.slice(2));
const badges = args.badges.split(",").map((s) => s.trim());
if (badges.length !== 4) {
  console.error(`Expected exactly 4 badges, got ${badges.length}: ${args.badges}`);
  process.exit(1);
}
const checked = Number(args.checked);

const svg = buildSvg({ badges, checked });
const outPath = path.join(ROOT, "public/images", `blog-${args.out}.webp`);

sharp(Buffer.from(svg), { density: 144 })
  .resize(W, H)
  .webp({ quality: 90 })
  .toFile(outPath)
  .then(() => console.log(`wrote ${path.relative(ROOT, outPath)}`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
