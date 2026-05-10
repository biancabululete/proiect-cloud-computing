# Anunturi Cloud — platforma de anunturi

- **Link aplicatie publicata**: _https://proiect-cloud-computing-three.vercel.app/_

---

## 1. Introducere

`Anunturi Cloud` este o aplicatie web full-stack inspirata din OLX, care permite utilizatorilor sa publice si sa consulte anunturi de vanzare. Aplicatia este construita cu **Next.js 14** (App Router, React Server Components, TypeScript) si foloseste doua servicii cloud accesate prin **API REST**:

1. **Neon Postgres** — baza de date serverless gazduita in cloud, accesata prin protocolul Postgres / driver-ul `@prisma/client`.
2. **Vercel Blob Storage** — serviciu cloud de stocare obiecte (imagini), accesat prin REST API prin pachetul `@vercel/blob`.

Aplicatia este publicata pe **Vercel** (PaaS), iar codul sursa este versionat pe Git.

## 2. Descriere problema

Vanzarile intre persoane fizice (`peer-to-peer marketplace`) presupun o platforma simpla unde:
- vanzatorii isi pot crea cont si publica anunturi cu poza, descriere, pret si locatie;
- cumparatorii pot rasfoi si filtra anunturi fara cont, dar pot contacta vanzatorul (datele de contact sunt vizibile);
- proprietarul unui anunt poate edita sau sterge oricand propriul anunt.

Problema rezolvata este eliminarea infrastructurii proprii (server fizic, storage, backup): totul ruleaza in cloud, scaland automat in functie de trafic.

### Functionalitati implementate

- Inregistrare cont (`nume`, `email`, `telefon`, `parola`) cu parola hash-uita prin **bcrypt**.
- Autentificare cu **sesiune JWT** stocata in cookie httpOnly (semnat cu HS256).
- Pagina principala cu lista de anunturi + filtre (cautare text + categorie).
- Pagina de creare anunt (cu upload imagine in Vercel Blob).
- Pagina de editare/stergere anunt (doar pentru proprietarul anuntului).
- Middleware Next.js pentru protectia rutelor `/post` si `/listings/*`.

## 3. Descriere API

API-ul REST este expus prin route handler-ele din `src/app/api/`. Toate raspunsurile sunt JSON.

### Endpoint-uri autentificare

| Metoda | Cale                | Descriere                                  | Auth |
|--------|---------------------|--------------------------------------------|------|
| POST   | `/api/auth/register`| Creeaza cont nou si seteaza cookie sesiune | nu   |
| POST   | `/api/auth/login`   | Autentifica utilizator                     | nu   |
| POST   | `/api/auth/logout`  | Sterge cookie-ul de sesiune                | da   |
| GET    | `/api/auth/me`      | Returneaza utilizatorul curent             | -    |

### Endpoint-uri anunturi

| Metoda | Cale                  | Descriere                              | Auth          |
|--------|-----------------------|----------------------------------------|---------------|
| GET    | `/api/listings`       | Lista anunturilor (filtre `?q&category`) | nu            |
| POST   | `/api/listings`       | Creeaza anunt nou                      | da            |
| GET    | `/api/listings/{id}`  | Detaliile unui anunt                   | nu            |
| PUT    | `/api/listings/{id}`  | Editeaza anuntul                       | da, doar owner|
| DELETE | `/api/listings/{id}`  | Sterge anuntul                         | da, doar owner|

### Endpoint upload imagini (Vercel Blob)

| Metoda | Cale          | Descriere                                            | Auth |
|--------|---------------|------------------------------------------------------|------|
| POST   | `/api/upload` | Incarca fisier (multipart/form-data, camp `file`) si returneaza URL public | da |

## 4. Flux de date

### 4.1 Autentificare si autorizare

- Parolele sunt **hash-uite cu bcrypt** (cost 10) inainte de a fi salvate in baza de date.
- La login, se genereaza un **JWT** (HS256, semnat cu `JWT_SECRET`, expirare 7 zile) si se trimite catre client intr-un cookie `session`:
  - `HttpOnly` (inaccesibil din JavaScript, anti-XSS)
  - `Secure` in productie (doar HTTPS)
  - `SameSite=Lax` (protectie CSRF)
- Pentru endpoint-urile protejate, server-ul citeste cookie-ul, verifica semnatura JWT si extrage `userId`.
- Pentru `/post` si `/listings/*`, middleware-ul Next.js redirecteaza catre `/login` daca lipseste/expira sesiunea.

### 4.2 Servicii cloud — autentificare

| Serviciu          | Mecanism de autentificare                                                  |
|-------------------|----------------------------------------------------------------------------|
| Neon Postgres     | Connection string Postgres cu `sslmode=require` (variabila `DATABASE_URL`). Recomandat: connection string-ul **pooled** (pgbouncer). |
| Vercel Blob       | Token `BLOB_READ_WRITE_TOKEN` injectat de Vercel (sau setat manual local), folosit transparent de pachetul `@vercel/blob`. |

### 4.3 Exemple request / response

**Inregistrare cont** — `POST /api/auth/register`

Request:
```json
{
  "name": "Bianca",
  "email": "bianca@example.com",
  "phone": "0712345678",
  "password": "parolaSigura123"
}
```
Response `201 Created`:
```json
{
  "user": {
    "id": "clx9...",
    "name": "Bianca",
    "email": "bianca@example.com",
    "phone": "0712345678"
  }
}
```
Cookie setat: `session=<jwt>; HttpOnly; SameSite=Lax; Max-Age=604800`

**Login** — `POST /api/auth/login`

Request:
```json
{ "email": "bianca@example.com", "password": "parolaSigura123" }
```
Response `200 OK` (cu cookie de sesiune setat) sau `401 Unauthorized` daca datele sunt gresite:
```json
{ "error": "Email sau parola incorecte" }
```

**Listare anunturi** — `GET /api/listings?q=iphone&category=Electronice`

Response `200 OK`:
```json
{
  "listings": [
    {
      "id": "clx...",
      "title": "iPhone 13 Pro 128GB",
      "description": "Stare excelenta, cutie completa.",
      "price": 2800,
      "category": "Electronice",
      "location": "Bucuresti",
      "imageUrl": "https://xxx.public.blob.vercel-storage.com/listings/.../1700000000-abc123.jpg",
      "userId": "clx9...",
      "createdAt": "2026-05-08T12:34:56.000Z",
      "updatedAt": "2026-05-08T12:34:56.000Z",
      "user": { "id": "clx9...", "name": "Bianca", "phone": "0712345678" }
    }
  ]
}
```

**Creare anunt** — `POST /api/listings` (necesita cookie sesiune)

Request:
```json
{
  "title": "iPhone 13 Pro 128GB",
  "description": "Stare excelenta, cutie completa.",
  "price": 2800,
  "category": "Electronice",
  "location": "Bucuresti",
  "imageUrl": "https://xxx.public.blob.vercel-storage.com/listings/.../foto.jpg"
}
```
Response `201 Created`:
```json
{ "listing": { "id": "clx...", "title": "iPhone 13 Pro 128GB", "...": "..." } }
```

**Upload imagine** — `POST /api/upload` (multipart/form-data)

Request:
```
Content-Type: multipart/form-data; boundary=----xyz
file=<binar imagine>
```
Response `200 OK`:
```json
{ "url": "https://xxx.public.blob.vercel-storage.com/listings/<userId>/1700000000-abc.jpg" }
```

**Editare anunt** — `PUT /api/listings/{id}` (doar proprietarul):

Request:
```json
{ "price": 2500 }
```
Response `200 OK` sau `403 Forbidden` daca nu este al tau:
```json
{ "error": "Nu ai dreptul sa editezi" }
```

### 4.4 Diagrama flux

```
[Browser]
    │ 1. POST /api/auth/register
    ▼
[Next.js API Route]  ──hash bcrypt──▶ [Neon Postgres]   (INSERT user)
    │ 2. seteaza cookie JWT (HS256)
    ▼
[Browser]
    │ 3. POST /api/upload  (multipart imagine)
    ▼
[Next.js API Route] ──REST: PUT object──▶ [Vercel Blob Storage]
    │ 4. returneaza URL public
    ▼
[Browser]
    │ 5. POST /api/listings  { ..., imageUrl }
    ▼
[Next.js API Route] ──INSERT──▶ [Neon Postgres]
    │ 6. {listing}
    ▼
[Browser] ──GET /──▶ [Next.js Server Component] ──SELECT──▶ [Neon Postgres] ──▶ HTML
```

## 5. Capturi ecran aplicatie

> _Se vor adauga dupa publicare. Recomandat:_
> - `docs/screenshots/01-home.png` — pagina principala cu lista de anunturi
> - `docs/screenshots/02-register.png` — formular cont nou
> - `docs/screenshots/03-login.png` — formular autentificare
> - `docs/screenshots/04-post.png` — formular adaugare anunt + upload imagine
> - `docs/screenshots/05-edit.png` — pagina editare anunt
> - `docs/screenshots/06-neon.png` — dashboard Neon (tabelele User si Listing)
> - `docs/screenshots/07-blob.png` — dashboard Vercel Blob cu imaginile incarcate

## 6. Referinte

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma ORM](https://www.prisma.io/docs)
- [Neon Serverless Postgres](https://neon.tech/docs)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [jose — JWT in JavaScript](https://github.com/panva/jose)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)

---

## Configurare locala

### 1. Clonare si instalare

```bash
git clone <repo-url>
cd "Proiect Cloud Computing"
npm install
```

### 2. Configurare Neon Postgres

1. Cont gratuit pe [neon.tech](https://neon.tech) -> creeaza un proiect.
2. Copiaza connection string-ul **pooled** (apare in dashboard sub `Connection details`).
3. Pune-l in `.env.local` ca `DATABASE_URL`.
4. Ruleaza:
   ```bash
   npx prisma db push
   ```
   (creeaza tabelele `User` si `Listing` in baza de date Neon)

### 3. Configurare Vercel Blob

**Optiunea A** — dupa ce ai cont Vercel:
1. Vercel Dashboard -> proiectul tau -> tab `Storage` -> `Create Database` -> `Blob`.
2. Conecteaza store-ul la proiect; Vercel va injecta automat `BLOB_READ_WRITE_TOKEN`.
3. Pentru rulare locala: `vercel env pull .env.local`.

**Optiunea B** — token manual:
- In Vercel Dashboard -> Storage -> Blob store -> `.env.local` tab -> copiaza `BLOB_READ_WRITE_TOKEN` -> pune-l in `.env.local`.

### 4. Generare JWT secret

```bash
openssl rand -base64 32
```
Pune output-ul in `.env.local` la `JWT_SECRET`.

### 5. Pornire dev server

```bash
npm run dev
```
Aplicatia ruleaza la http://localhost:3000.

## Deploy pe Vercel

1. Push repo-ul pe GitHub.
2. [vercel.com/new](https://vercel.com/new) -> import repo.
3. Vercel detecteaza automat Next.js — apasa `Deploy`.
4. Adauga in `Settings -> Environment Variables`: `DATABASE_URL`, `JWT_SECRET` (`BLOB_READ_WRITE_TOKEN` se injecteaza automat la conectarea Blob store-ului).
5. Re-deploy. Aplicatia este online la `https://<numele-tau>.vercel.app`.

## Tehnologii folosite

- **Next.js 14** (App Router, Server Components, Route Handlers)
- **TypeScript**
- **Prisma** (ORM, generator client typesafe)
- **Neon Postgres** (cloud database, serverless Postgres)
- **Vercel Blob** (cloud object storage)
- **jose** (JWT signing/verification, edge-compatible)
- **bcryptjs** (password hashing)
- **Tailwind CSS** (styling)
- **Vercel** (PaaS deployment)
