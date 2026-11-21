/**
 * Génère le site statique AGAPHOS à partir des textes Desktop/Agaphos.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = "C:\\Users\\franc\\OneDrive\\Desktop\\Agaphos";

const CATALOG = [
  { file: "quand dieu nous fait confiance.txt", slug: "quand-dieu-nous-fait-confiance", category: "Foi et cheminement spirituel", publish: true },
  { file: "le lien invisible entre dieu et nous.txt", slug: "le-lien-invisible-entre-dieu-et-nous", category: "Foi et cheminement spirituel", publish: true },
  { file: "dieu ne cesse jamais de nous aimer.txt", slug: "dieu-ne-cesse-jamais-de-nous-aimer", category: "Foi et cheminement spirituel", publish: true },
  { file: "l abondance de dieu ne se mesure pas en argent.txt", slug: "labondance-de-dieu-ne-se-mesure-pas-en-argent", category: "Foi et cheminement spirituel", publish: true },
  { file: "Parler a dieu, apprendre a aimer.txt", slug: "parler-a-dieu-apprendre-a-aimer", category: "Foi et cheminement spirituel", publish: true },
  { file: "quand nos gestes nous éloignent de la lumiere.txt", slug: "quand-nos-gestes-nous-eloignent-de-la-lumiere", category: "Foi et cheminement spirituel", publish: true },
  { file: "pardonner ne signifie pas ouvrir sa porte.txt", slug: "pardonner-ne-signifie-pas-ouvrir-sa-porte", category: "Amour et relations humaines", publish: true },
  { file: "nos enfants peuvent aussi nous faire grandir.txt", slug: "nos-enfants-peuvent-aussi-nous-faire-grandir", category: "Amour et relations humaines", publish: true },
  { file: "croire en quelqu'un avant meme qu il reussisse.txt", slug: "croire-en-quelquun-avant-meme-quil-reussisse", category: "Amour et relations humaines", publish: true },
  { file: "le plus beau cadeau est celuui qui touche le coeur.txt", slug: "le-plus-beau-cadeau-est-celui-qui-touche-le-coeur", category: "Amour et relations humaines", publish: true },
  { file: "le respect, la fondation de l'amour.txt", slug: "le-respect-la-fondation-de-lamour", category: "Amour et relations humaines", publish: true },
  { file: "la colere ne m'habite plus.txt", slug: "la-colere-ne-mhabite-plus", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "la véritable richesse de la vie.txt", slug: "la-veritable-richesse-de-la-vie", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "reconnaitre ses erreurs, c est grandir dans la lumiere.txt", slug: "reconnaitre-ses-erreurs-cest-grandir-dans-la-lumiere", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "avant de juger, apprenons à comprendre.txt", slug: "avant-de-juger-apprenons-a-comprendre", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "la solitude, une bénédiction parfois méconnue.txt", slug: "la-solitude-une-benediction-parfois-meconnue", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "mon hypersensibilité, mon plus beau cadeau.txt", slug: "mon-hypersensibilite-mon-plus-beau-cadeau", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "ma liberté, ma responsabilité.txt", slug: "ma-liberte-ma-responsabilite", category: "Connaissance de soi et évolution intérieure", publish: true },
  { file: "sois un phare, pas un sauveteur.txt", slug: "sois-un-phare-pas-un-sauveteur", category: "Entraide et réflexion", publish: true, authorNote: "Adaptation inspirée d’Anne Lamott" },
  { file: "les paroles qui blessent et celles qui guérissent.txt", slug: "les-paroles-qui-blessent-et-celles-qui-guerissent", category: "Entraide et réflexion", publish: true, pending: true },
];

const HOLD = [
  "apprendre à donner, apprendre à recevoir.txt",
  "plusieurs chemins, une meme dignité.txt",
];

const PUB_DATE = "2026-11-21";

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseTeaching(raw) {
  let text = raw.replace(/^\uFEFF/, "").trim();
  let title = "";
  if (text.startsWith("#")) {
    const nl = text.indexOf("\n");
    title = text.slice(1, nl >= 0 ? nl : text.length).trim();
    text = nl >= 0 ? text.slice(nl + 1).trim() : "";
  }
  // Drop machine metadata blocks if any at top
  const metaStop = text.search(/\n\n(?![A-ZÉÂÀ][^\n]{0,40}:)/);
  const lines = text.split(/\r?\n/);
  const bodyLines = [];
  let started = false;
  for (const line of lines) {
    const t = line.trim();
    if (!started) {
      if (
        /^(Catégorie|Texte|Inspiration|Statut|Auteur)\s*:/i.test(t) ||
        t === ""
      ) {
        continue;
      }
      started = true;
    }
    bodyLines.push(line);
  }
  let body = bodyLines.join("\n").trim();
  // Convert markdown-ish to HTML paragraphs
  const blocks = body.split(/\n\s*\n/);
  const htmlParts = [];
  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;
    if (b === "—" || b === "-" || b === "–") {
      htmlParts.push('<hr class="sep">');
      continue;
    }
    // multi-line block: treat each non-empty line as paragraph if short lines
    const sub = b.split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of sub) {
      let h = esc(line);
      h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      h = h.replace(/\*(.+?)\*/g, "<em>$1</em>");
      if (h.startsWith("<em>") && h.endsWith("</em>") && !h.includes("<strong>")) {
        htmlParts.push(`<p class="signature">${h}</p>`);
      } else {
        htmlParts.push(`<p>${h}</p>`);
      }
    }
  }
  return { title, bodyHtml: htmlParts.join("\n") };
}

function layout({ title, description, depth = 0, body, active }) {
  const prefix = depth === 0 ? "" : depth === 1 ? "../" : "../../";
  return `<!doctype html>
<html lang="fr-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${esc(description)}">
<title>${esc(title)} — Agaphos</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${prefix}css/site.css">
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="${prefix}index.html">Agaphos</a>
    <p class="tagline">Unis par l’amour, guidés par la lumière.</p>
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav id="menu" class="nav" aria-label="Principale">
      <a href="${prefix}index.html"${active === "accueil" ? ' aria-current="page"' : ""}>Accueil</a>
      <a href="${prefix}unir/index.html"${active === "unir" ? ' aria-current="page"' : ""}>Unir</a>
      <a href="${prefix}eclairer/index.html"${active === "eclairer" ? ' aria-current="page"' : ""}>Éclairer</a>
      <a href="${prefix}agir/index.html"${active === "agir" ? ' aria-current="page"' : ""}>Agir</a>
      <a href="${prefix}charte/index.html"${active === "charte" ? ' aria-current="page"' : ""}>12 Lumières</a>
      <a href="${prefix}soutenir/index.html"${active === "soutenir" ? ' aria-current="page"' : ""}>Soutenir</a>
    </nav>
  </div>
</header>
<main id="contenu" class="wrap">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <p><strong>Agaphos</strong> — Unis par l’amour, guidés par la lumière.</p>
    <p class="small">Le Temple de Dieu est le foyer spirituel francophone d’Agaphos. Ouvert à toutes les traditions et aux personnes sans religion.</p>
    <p class="small"><a href="${prefix}connexion-divine/index.html">Connexion divine</a> · <a href="${prefix}charte/index.html">Charte</a></p>
  </div>
</footer>
<script src="${prefix}js/site.js" defer></script>
</body>
</html>
`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

// --- Build teachings ---
const teachingsDir = path.join(ROOT, "eclairer", "enseignements");
ensureDir(teachingsDir);

const published = [];
const missing = [];

for (const item of CATALOG) {
  const srcPath = path.join(SRC, item.file);
  if (!fs.existsSync(srcPath)) {
    missing.push(item.file);
    continue;
  }
  let raw = fs.readFileSync(srcPath, "utf8");
  // Correction validée : « montagnes escarpées » (pas « montagnes russes »)
  if (item.slug === "la-veritable-richesse-de-la-vie") {
    raw = raw.replace(/montagnes russes/gi, "montagnes escarpées");
  }
  const { title, bodyHtml } = parseTeaching(raw);
  const finalTitle = title || item.slug;
  const author =
    item.authorNote ||
    (raw.includes("Une pensée de Francis Manseau")
      ? "Francis Manseau"
      : raw.includes("Anne Lamott")
        ? "Adaptation — inspiration Anne Lamott"
        : "Agaphos");

  const pageBody = `
<article class="teaching" data-slug="${esc(item.slug)}" data-view-counter>
  <p class="crumb"><a href="../index.html">Éclairer</a> · ${esc(item.category)}</p>
  <h1>${esc(finalTitle)}</h1>
  <p class="meta">
    <span>${esc(author)}</span>
    · <time datetime="${PUB_DATE}">${PUB_DATE}</time>
    · <span class="views" data-views-display>Lectures : —</span>
  </p>
  ${item.pending ? '<p class="badge-pending">Réflexion proposée — présentation provisoire.</p>' : ""}
  <div class="teaching-body">
${bodyHtml}
  </div>
  <p class="back"><a href="../index.html">← Retour à la bibliothèque</a></p>
</article>
<script src="../../js/views.js" defer></script>
`;

  fs.writeFileSync(
    path.join(teachingsDir, `${item.slug}.html`),
    layout({
      title: finalTitle,
      description: `${finalTitle} — bibliothèque Éclairer, Agaphos`,
      depth: 2,
      body: pageBody,
      active: "eclairer",
    }),
    "utf8"
  );

  published.push({ ...item, title: finalTitle, author });
}

// Group by category
const byCat = new Map();
for (const t of published) {
  if (!byCat.has(t.category)) byCat.set(t.category, []);
  byCat.get(t.category).push(t);
}

const catOrder = [
  "Foi et cheminement spirituel",
  "Amour et relations humaines",
  "Connaissance de soi et évolution intérieure",
  "Entraide et réflexion",
];

let eclairerList = "";
for (const cat of catOrder) {
  const items = byCat.get(cat) || [];
  if (!items.length) continue;
  eclairerList += `<section class="cat-block"><h2>${esc(cat)}</h2><ul class="teach-list">`;
  for (const t of items) {
    eclairerList += `<li><a href="enseignements/${t.slug}.html">${esc(t.title)}</a>${t.pending ? ' <span class="tag">à valider</span>' : ""}</li>`;
  }
  eclairerList += `</ul></section>`;
}

const eclairerBody = `
<section class="page-intro">
  <h1>Éclairer</h1>
  <p class="lead">Le chemin de la lumière</p>
  <p>Bibliothèque spirituelle d’Agaphos. Textes accessibles gratuitement, sans compte. Ce sont des réflexions personnelles et des adaptations — non des vérités imposées, ni un classement de sagesse.</p>
  <p class="small">Mise en avant : <strong>Les lumières à cultiver</strong> — à travers ces enseignements sur l’amour, le pardon, la connaissance de soi et l’entraide.</p>
</section>
${eclairerList}
<p class="note">Les textes « Apprendre à donner… » et « Plusieurs chemins… » restent hors publication en attendant validation distincte.</p>
`;

fs.writeFileSync(
  path.join(ROOT, "eclairer", "index.html"),
  layout({
    title: "Éclairer",
    description: "Bibliothèque spirituelle Agaphos — Le chemin de la lumière",
    depth: 1,
    body: eclairerBody,
    active: "eclairer",
  }),
  "utf8"
);

// Save manifest for views
fs.writeFileSync(
  path.join(ROOT, "eclairer", "manifest.json"),
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      teachings: published.map((t) => ({
        slug: t.slug,
        title: t.title,
        category: t.category,
        published: PUB_DATE,
      })),
    },
    null,
    2
  ),
  "utf8"
);

console.log("Published:", published.length);
console.log("Missing files:", missing);
console.log("Held back:", HOLD);
