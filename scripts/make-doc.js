// Generates Documentatie.docx from README.md content (Romanian, with diacritics)
const fs = require("fs");
const path = require("path");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  AlignmentType,
  LevelFormat,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  PageNumber,
  PageBreak,
} = require("docx");

// ======== STYLE HELPERS ========

const FONT = "Calibri";
const MONO_FONT = "Consolas";

const codeBg = { fill: "F2F2F2", type: ShadingType.CLEAR, color: "auto" };
const headerBg = { fill: "002F34", type: ShadingType.CLEAR, color: "auto" };

const borderColor = "BFBFBF";
const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
const cellBorders = {
  top: cellBorder,
  bottom: cellBorder,
  left: cellBorder,
  right: cellBorder,
};

const CONTENT_W = 9360; // US Letter, 1" margins (DXA)
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: [new TextRun({ text, font: FONT, ...(opts.run || {}) })],
  });
}

function pBold(text, opts = {}) {
  return p(text, { ...opts, run: { bold: true, ...(opts.run || {}) } });
}

// Mixed-content paragraph: array of {text, bold?, italic?, mono?, color?}
function mixed(parts, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    ...opts,
    children: parts.map(
      (part) =>
        new TextRun({
          text: part.text,
          font: part.mono ? MONO_FONT : FONT,
          bold: part.bold,
          italics: part.italic,
          color: part.color,
        })
    ),
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 32 })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 26 })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 100 },
    children: [new TextRun({ text, font: FONT, bold: true, size: 22 })],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text, font: FONT })],
  });
}

function bulletMixed(parts) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 60 },
    children: parts.map(
      (part) =>
        new TextRun({
          text: part.text,
          font: part.mono ? MONO_FONT : FONT,
          bold: part.bold,
          italics: part.italic,
        })
    ),
  });
}

function code(text) {
  // Multi-line code block, each line as paragraph with gray bg + monospace
  const lines = text.split("\n");
  return lines.map(
    (line, i) =>
      new Paragraph({
        spacing: { after: i === lines.length - 1 ? 200 : 0 },
        shading: codeBg,
        children: [
          new TextRun({ text: line || " ", font: MONO_FONT, size: 18 }),
        ],
      })
  );
}

function tableHeader(text, width) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: headerBg,
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [
          new TextRun({ text, font: FONT, bold: true, color: "FFFFFF" }),
        ],
      }),
    ],
  });
}

function tableCell(text, width, opts = {}) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: opts.mono ? MONO_FONT : FONT,
            bold: opts.bold,
            size: opts.mono ? 18 : undefined,
          }),
        ],
      }),
    ],
  });
}

// ======== CONTENT ========

const titlePage = [
  new Paragraph({ spacing: { before: 2400 }, children: [new TextRun("")] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: [
      new TextRun({
        text: "Anunțuri Cloud",
        font: FONT,
        bold: true,
        size: 56,
        color: "002F34",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 480 },
    children: [
      new TextRun({
        text: "Platformă de anunțuri inspirată din OLX",
        font: FONT,
        italics: true,
        size: 28,
        color: "555555",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "Bianca Bululete", font: FONT, size: 28, bold: true }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "Grupa: ____", font: FONT, size: 24 }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 720 },
    children: [
      new TextRun({
        text: "Proiect Cloud Computing",
        font: FONT,
        size: 22,
        italics: true,
        color: "666666",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1200, after: 60 },
    children: [
      new TextRun({ text: "Link video prezentare: ", font: FONT, bold: true }),
      new TextRun({
        text: "[de adăugat după înregistrare YouTube — public nelistat]",
        font: FONT,
        italics: true,
        color: "777777",
      }),
    ],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "Link aplicație publicată: ", font: FONT, bold: true }),
      new TextRun({
        text: "[de adăugat după deploy pe Vercel]",
        font: FONT,
        italics: true,
        color: "777777",
      }),
    ],
  }),
  new Paragraph({ children: [new PageBreak()] }),
];

// === Section 1: Introducere ===
const sec1 = [
  h1("1. Introducere"),
  mixed([
    { text: "Anunțuri Cloud", bold: true },
    {
      text:
        " este o aplicație web full-stack inspirată din OLX, care permite utilizatorilor să publice și să consulte anunțuri de vânzare. Aplicația este construită cu ",
    },
    { text: "Next.js 14", bold: true },
    {
      text:
        " (App Router, React Server Components, TypeScript) și folosește două servicii cloud accesate prin ",
    },
    { text: "API REST", bold: true },
    { text: ":" },
  ]),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "Neon Postgres", font: FONT, bold: true }),
      new TextRun({
        text:
          " — bază de date serverless găzduită în cloud, accesată prin protocolul Postgres / driver-ul ",
        font: FONT,
      }),
      new TextRun({ text: "@prisma/client", font: MONO_FONT, size: 20 }),
      new TextRun({ text: ".", font: FONT }),
    ],
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 120 },
    children: [
      new TextRun({ text: "Vercel Blob Storage", font: FONT, bold: true }),
      new TextRun({
        text:
          " — serviciu cloud de stocare obiecte (imagini), accesat prin REST API prin pachetul ",
        font: FONT,
      }),
      new TextRun({ text: "@vercel/blob", font: MONO_FONT, size: 20 }),
      new TextRun({ text: ".", font: FONT }),
    ],
  }),
  mixed([
    { text: "Aplicația este publicată pe " },
    { text: "Vercel", bold: true },
    { text: " (PaaS), iar codul sursă este versionat pe Git." },
  ]),
];

// === Section 2: Descriere problema ===
const sec2 = [
  h1("2. Descriere problemă"),
  mixed([
    { text: "Vânzările între persoane fizice (" },
    { text: "peer-to-peer marketplace", mono: true },
    { text: ") presupun o platformă simplă unde:" },
  ]),
  bullet(
    "vânzătorii își pot crea cont și publica anunțuri cu poză, descriere, preț și locație;"
  ),
  bullet(
    "cumpărătorii pot răsfoi și filtra anunțuri fără cont, dar pot contacta vânzătorul (datele de contact sunt vizibile);"
  ),
  bullet(
    "proprietarul unui anunț poate edita sau șterge oricând propriul anunț."
  ),
  p(
    "Problema rezolvată este eliminarea infrastructurii proprii (server fizic, storage, backup): totul rulează în cloud, scalând automat în funcție de trafic."
  ),
  h2("Funcționalități implementate"),
  bulletMixed([
    { text: "Înregistrare cont (" },
    { text: "nume", mono: true },
    { text: ", " },
    { text: "email", mono: true },
    { text: ", " },
    { text: "telefon", mono: true },
    { text: ", " },
    { text: "parolă", mono: true },
    { text: ") cu parola hash-uită prin " },
    { text: "bcrypt", bold: true },
    { text: "." },
  ]),
  bulletMixed([
    { text: "Autentificare cu " },
    { text: "sesiune JWT", bold: true },
    { text: " stocată în cookie httpOnly (semnat cu HS256)." },
  ]),
  bullet(
    "Pagină principală cu lista de anunțuri + filtre (căutare text + categorie)."
  ),
  bullet("Pagină de creare anunț (cu upload imagine în Vercel Blob)."),
  bullet(
    "Pagină de editare/ștergere anunț (doar pentru proprietarul anunțului)."
  ),
  bulletMixed([
    { text: "Middleware Next.js pentru protecția rutei " },
    { text: "/post", mono: true },
    { text: "." },
  ]),
];

// === Section 3: Descriere API ===
function apiTable(rows, colWidths) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((row, i) =>
      i === 0
        ? new TableRow({
            tableHeader: true,
            children: row.map((cellText, j) =>
              tableHeader(cellText, colWidths[j])
            ),
          })
        : new TableRow({
            children: row.map((cellText, j) =>
              tableCell(cellText, colWidths[j], { mono: j === 1 })
            ),
          })
    ),
  });
}

const sec3 = [
  h1("3. Descriere API"),
  mixed([
    { text: "API-ul REST este expus prin route handler-ele din " },
    { text: "src/app/api/", mono: true },
    { text: ". Toate răspunsurile sunt JSON." },
  ]),
  h2("Endpoint-uri autentificare"),
  apiTable(
    [
      ["Metodă", "Cale", "Descriere", "Auth"],
      [
        "POST",
        "/api/auth/register",
        "Creează cont nou și setează cookie sesiune",
        "nu",
      ],
      ["POST", "/api/auth/login", "Autentifică utilizator", "nu"],
      ["POST", "/api/auth/logout", "Șterge cookie-ul de sesiune", "da"],
      ["GET", "/api/auth/me", "Returnează utilizatorul curent", "—"],
    ],
    [1100, 2700, 4660, 900]
  ),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] }),
  h2("Endpoint-uri anunțuri"),
  apiTable(
    [
      ["Metodă", "Cale", "Descriere", "Auth"],
      [
        "GET",
        "/api/listings",
        "Lista anunțurilor (filtre ?q & ?category)",
        "nu",
      ],
      ["POST", "/api/listings", "Creează anunț nou", "da"],
      ["GET", "/api/listings/{id}", "Detaliile unui anunț", "nu"],
      ["PUT", "/api/listings/{id}", "Editează anunțul", "da, doar owner"],
      ["DELETE", "/api/listings/{id}", "Șterge anunțul", "da, doar owner"],
    ],
    [1100, 2700, 4060, 1500]
  ),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] }),
  h2("Endpoint upload imagini (Vercel Blob)"),
  apiTable(
    [
      ["Metodă", "Cale", "Descriere", "Auth"],
      [
        "POST",
        "/api/upload",
        "Încarcă fișier (multipart/form-data, câmp file) și returnează URL public",
        "da",
      ],
    ],
    [1100, 2200, 5160, 900]
  ),
];

// === Section 4: Flux de date ===
const sec4 = [
  h1("4. Flux de date"),

  h2("4.1 Autentificare și autorizare"),
  bulletMixed([
    { text: "Parolele sunt " },
    { text: "hash-uite cu bcrypt", bold: true },
    { text: " (cost 10) înainte de a fi salvate în baza de date." },
  ]),
  bulletMixed([
    { text: "La login, se generează un " },
    { text: "JWT", bold: true },
    { text: " (HS256, semnat cu " },
    { text: "JWT_SECRET", mono: true },
    { text: ", expirare 7 zile) și se trimite către client într-un cookie " },
    { text: "session", mono: true },
    { text: ":" },
  ]),
  bulletMixed([
    { text: "    " },
    { text: "HttpOnly", mono: true },
    { text: " (inaccesibil din JavaScript, anti-XSS)" },
  ]),
  bulletMixed([
    { text: "    " },
    { text: "Secure", mono: true },
    { text: " în producție (doar HTTPS)" },
  ]),
  bulletMixed([
    { text: "    " },
    { text: "SameSite=Lax", mono: true },
    { text: " (protecție CSRF)" },
  ]),
  bulletMixed([
    {
      text:
        "Pentru endpoint-urile protejate, server-ul citește cookie-ul, verifică semnătura JWT și extrage ",
    },
    { text: "userId", mono: true },
    { text: "." },
  ]),
  bulletMixed([
    { text: "Pentru " },
    { text: "/post", mono: true },
    {
      text:
        ", middleware-ul Next.js redirectează către /login dacă lipsește/expiră sesiunea.",
    },
  ]),

  h2("4.2 Servicii cloud — autentificare"),
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: [
      new TableRow({
        tableHeader: true,
        children: [tableHeader("Serviciu", 2400), tableHeader("Mecanism de autentificare", 6960)],
      }),
      new TableRow({
        children: [
          tableCell("Neon Postgres", 2400, { bold: true }),
          new TableCell({
            borders: cellBorders,
            width: { size: 6960, type: WidthType.DXA },
            margins: cellMargins,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Connection string Postgres cu ",
                    font: FONT,
                  }),
                  new TextRun({ text: "sslmode=require", font: MONO_FONT, size: 18 }),
                  new TextRun({ text: " (variabila ", font: FONT }),
                  new TextRun({ text: "DATABASE_URL", font: MONO_FONT, size: 18 }),
                  new TextRun({
                    text:
                      "). Recomandat: connection string-ul pooled (pgbouncer).",
                    font: FONT,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          tableCell("Vercel Blob", 2400, { bold: true }),
          new TableCell({
            borders: cellBorders,
            width: { size: 6960, type: WidthType.DXA },
            margins: cellMargins,
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: "Token ", font: FONT }),
                  new TextRun({ text: "BLOB_READ_WRITE_TOKEN", font: MONO_FONT, size: 18 }),
                  new TextRun({
                    text:
                      " injectat de Vercel (sau setat manual local), folosit transparent de pachetul ",
                    font: FONT,
                  }),
                  new TextRun({ text: "@vercel/blob", font: MONO_FONT, size: 18 }),
                  new TextRun({ text: ".", font: FONT }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  }),
  new Paragraph({ spacing: { after: 200 }, children: [new TextRun("")] }),

  h2("4.3 Exemple request / response"),
  h3("Înregistrare cont — POST /api/auth/register"),
  pBold("Request:"),
  ...code(`{
  "name": "Bianca",
  "email": "bianca@example.com",
  "phone": "0712345678",
  "password": "parolaSigura123"
}`),
  pBold("Response 201 Created:"),
  ...code(`{
  "user": {
    "id": "clx9...",
    "name": "Bianca",
    "email": "bianca@example.com",
    "phone": "0712345678"
  }
}`),
  mixed([
    { text: "Cookie setat: " },
    { text: "session=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800", mono: true },
  ]),

  h3("Login — POST /api/auth/login"),
  pBold("Request:"),
  ...code(`{ "email": "bianca@example.com", "password": "parolaSigura123" }`),
  pBold("Response 200 OK (cu cookie de sesiune setat) sau 401 Unauthorized:"),
  ...code(`{ "error": "Email sau parola incorecte" }`),

  h3("Listare anunțuri — GET /api/listings?q=iphone&category=Electronice"),
  pBold("Response 200 OK:"),
  ...code(`{
  "listings": [
    {
      "id": "clx...",
      "title": "iPhone 13 Pro 128GB",
      "description": "Stare excelenta, cutie completa.",
      "price": 2800,
      "category": "Electronice",
      "location": "Bucuresti",
      "imageUrl": "https://xxx.public.blob.vercel-storage.com/listings/.../foto.jpg",
      "userId": "clx9...",
      "createdAt": "2026-05-08T12:34:56.000Z",
      "updatedAt": "2026-05-08T12:34:56.000Z",
      "user": { "id": "clx9...", "name": "Bianca", "phone": "0712345678" }
    }
  ]
}`),

  h3("Creare anunț — POST /api/listings (necesită cookie sesiune)"),
  pBold("Request:"),
  ...code(`{
  "title": "iPhone 13 Pro 128GB",
  "description": "Stare excelenta, cutie completa.",
  "price": 2800,
  "category": "Electronice",
  "location": "Bucuresti",
  "imageUrl": "https://xxx.public.blob.vercel-storage.com/listings/.../foto.jpg"
}`),
  pBold("Response 201 Created:"),
  ...code(`{ "listing": { "id": "clx...", "title": "iPhone 13 Pro 128GB", ... } }`),

  h3("Upload imagine — POST /api/upload (multipart/form-data)"),
  pBold("Request:"),
  ...code(`Content-Type: multipart/form-data; boundary=----xyz
file=<binar imagine>`),
  pBold("Response 200 OK:"),
  ...code(`{ "url": "https://xxx.public.blob.vercel-storage.com/listings/<userId>/...jpg" }`),

  h3("Editare anunț — PUT /api/listings/{id} (doar proprietarul)"),
  pBold("Request:"),
  ...code(`{ "price": 2500 }`),
  pBold("Response 200 OK sau 403 Forbidden dacă nu este al tău:"),
  ...code(`{ "error": "Nu ai dreptul sa editezi" }`),

  h2("4.4 Diagrama flux"),
  ...code(`[Browser]
    | 1. POST /api/auth/register
    v
[Next.js API Route]  --hash bcrypt-->  [Neon Postgres]   (INSERT user)
    | 2. seteaza cookie JWT (HS256)
    v
[Browser]
    | 3. POST /api/upload  (multipart imagine)
    v
[Next.js API Route] --REST: PUT object--> [Vercel Blob Storage]
    | 4. returneaza URL public
    v
[Browser]
    | 5. POST /api/listings  { ..., imageUrl }
    v
[Next.js API Route] --INSERT--> [Neon Postgres]
    | 6. {listing}
    v
[Browser] --GET /--> [Next.js Server Component] --SELECT--> [Neon Postgres] --> HTML`),
];

// === Section 5: Capturi ecran ===
const sec5 = [
  h1("5. Capturi ecran aplicație"),
  p(
    "Capturile de ecran ale aplicației sunt salvate în folder-ul docs/screenshots/ din repository. Mai jos este lista recomandată de capturi:"
  ),
  bullet("01-home.png — pagina principală cu lista de anunțuri"),
  bullet("02-register.png — formular cont nou (cu validări)"),
  bullet("03-login.png — formular autentificare"),
  bullet("04-post.png — formular adăugare anunț + upload imagine"),
  bullet("05-detail.png — pagina de detalii anunț (cu telefon vânzător)"),
  bullet("06-edit.png — pagina editare anunț"),
  bullet("07-neon.png — dashboard Neon (tabelele User și Listing)"),
  bullet("08-blob.png — dashboard Vercel Blob cu imaginile încărcate"),
];

// === Section 6: Referinte ===
const sec6 = [
  h1("6. Referințe"),
  bullet("Next.js App Router — https://nextjs.org/docs/app"),
  bullet("Prisma ORM — https://www.prisma.io/docs"),
  bullet("Neon Serverless Postgres — https://neon.tech/docs"),
  bullet("Vercel Blob Storage — https://vercel.com/docs/storage/vercel-blob"),
  bullet("jose — JWT in JavaScript — https://github.com/panva/jose"),
  bullet("bcryptjs — https://github.com/dcodeIO/bcrypt.js"),
  bullet("Tailwind CSS — https://tailwindcss.com/docs"),
  bullet(
    "OWASP Password Storage Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"
  ),
];

// === Anexe ===
const anexe = [
  new Paragraph({ children: [new PageBreak()] }),
  h1("Anexa A — Configurare locală"),
  h3("1. Clonare și instalare"),
  ...code(`git clone <repo-url>
cd "Proiect Cloud Computing"
npm install`),
  h3("2. Configurare Neon Postgres"),
  bullet("Cont gratuit pe https://neon.tech → creează un proiect."),
  bulletMixed([
    { text: "Copiază " },
    { text: "Pooled connection string", bold: true },
    { text: " (vizibil în dashboard la „Connection details”)." },
  ]),
  bulletMixed([
    { text: "Pune-l în " },
    { text: ".env", mono: true },
    { text: " ca " },
    { text: "DATABASE_URL", mono: true },
    { text: "." },
  ]),
  bulletMixed([
    { text: "Rulează " },
    { text: "npx prisma db push", mono: true },
    { text: " (creează tabelele User și Listing în Neon)." },
  ]),
  h3("3. Configurare Vercel Blob"),
  bulletMixed([
    { text: "Vercel Dashboard → proiectul tău → Storage → Create → " },
    { text: "Blob", bold: true },
    { text: "." },
  ]),
  bullet(
    "Conectează store-ul la proiect; Vercel injectează automat BLOB_READ_WRITE_TOKEN."
  ),
  bulletMixed([
    { text: "Pentru rulare locală: " },
    { text: "vercel env pull .env.local", mono: true },
    { text: "." },
  ]),
  h3("4. Generare JWT secret (PowerShell)"),
  ...code(
    `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))`
  ),
  bulletMixed([
    { text: "Copiază output-ul în " },
    { text: ".env", mono: true },
    { text: " la " },
    { text: "JWT_SECRET", mono: true },
    { text: "." },
  ]),
  h3("5. Pornire dev server"),
  ...code(`npm run dev`),
  mixed([
    { text: "Aplicația rulează la " },
    { text: "http://localhost:3000", mono: true },
    { text: "." },
  ]),

  h1("Anexa B — Deploy pe Vercel"),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 60 },
    children: [new TextRun({ text: "Push repo-ul pe GitHub.", font: FONT })],
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "Mergi la ", font: FONT }),
      new TextRun({ text: "https://vercel.com/new", font: MONO_FONT, size: 18 }),
      new TextRun({ text: " → import repo.", font: FONT }),
    ],
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: "Vercel detectează automat Next.js — apasă Deploy.",
        font: FONT,
      }),
    ],
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 60 },
    children: [
      new TextRun({ text: "Adaugă în ", font: FONT }),
      new TextRun({
        text: "Settings → Environment Variables",
        font: FONT,
        bold: true,
      }),
      new TextRun({ text: ": ", font: FONT }),
      new TextRun({ text: "DATABASE_URL", font: MONO_FONT, size: 18 }),
      new TextRun({ text: ", ", font: FONT }),
      new TextRun({ text: "JWT_SECRET", font: MONO_FONT, size: 18 }),
      new TextRun({
        text:
          " (BLOB_READ_WRITE_TOKEN se injectează automat la conectarea Blob store-ului).",
        font: FONT,
      }),
    ],
  }),
  new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    spacing: { after: 120 },
    children: [
      new TextRun({
        text: "Re-deploy. Aplicația este online la ",
        font: FONT,
      }),
      new TextRun({
        text: "https://<numele-tau>.vercel.app",
        font: MONO_FONT,
        size: 18,
      }),
      new TextRun({ text: ".", font: FONT }),
    ],
  }),

  h1("Anexa C — Tehnologii folosite"),
  bulletMixed([
    { text: "Next.js 14", bold: true },
    { text: " (App Router, Server Components, Route Handlers)" },
  ]),
  bullet("TypeScript"),
  bullet("Prisma (ORM, generator client typesafe)"),
  bullet("Neon Postgres (cloud database, serverless Postgres)"),
  bullet("Vercel Blob (cloud object storage)"),
  bullet("jose (JWT signing/verification, edge-compatible)"),
  bullet("bcryptjs (password hashing)"),
  bullet("Tailwind CSS (styling)"),
  bullet("Vercel (PaaS deployment)"),
];

// ======== DOCUMENT ========

const doc = new Document({
  creator: "Bianca Bululete",
  title: "Anunturi Cloud — Documentatie",
  description: "Documentatie proiect Cloud Computing",
  styles: {
    default: { document: { run: { font: FONT, size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: "002F34" },
        paragraph: {
          spacing: { before: 360, after: 180 },
          outlineLevel: 0,
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 6,
              color: "23E5DB",
              space: 4,
            },
          },
        },
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: "002F34" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 22, bold: true, font: FONT, color: "444444" },
        paragraph: { spacing: { before: 180, after: 100 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
            },
          },
        ],
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 720, hanging: 360 } },
            },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: "Anunțuri Cloud · Proiect Cloud Computing",
                  font: FONT,
                  size: 18,
                  color: "888888",
                  italics: true,
                }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: "Proiect Cloud Computing - Bululete Bianca-Maria",
                  font: FONT,
                  size: 18,
                  color: "666666",
                }),
              ],
            }),
          ],
        }),
      },
      children: [
        ...titlePage,
        ...sec1,
        ...sec2,
        ...sec3,
        ...sec4,
        ...sec5,
        ...sec6,
        ...anexe,
      ],
    },
  ],
});

const outPath = path.join(__dirname, "..", "Documentatie.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outPath, buf);
  console.log("Wrote: " + outPath + " (" + buf.length + " bytes)");
});
