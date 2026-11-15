# APAR-CAR · Backend

API de APAR-CAR hecha con Node.js + Express + Prisma (PostgreSQL en Neon).

## Requisitos

- Node.js 22
- Git

## Instalación

1. Entra a la carpeta del backend:

```bash
   cd backend
```

2. Instala las dependencias:

```bash
   npm install
```

   Al terminar, Prisma genera el cliente solo (script `postinstall`).
   Debes ver: `✔ Generated Prisma Client`.

3. Crea tu archivo `.env` copiando el ejemplo:

```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Mac / Linux
   cp .env.example .env
```

4. Pide la `DATABASE_URL` **por privado** a la líder del equipo y pégala en tu `.env`.

   > ⚠️ Es la URL del proyecto **`aparcar-dev`** de Neon.
   > **No** uses la base compartida con TICS.
   > Nunca subas el `.env` al repositorio.

5. Aplica las migraciones a la base de datos:

```bash
   npx prisma migrate dev
```

6. Arranca el servidor en modo desarrollo:

```bash
   npm run dev
```

7. Prueba que funciona abriendo en el navegador:

   <http://localhost:3000/api/health>

## Notas

- La configuración de Prisma está en `prisma.config.ts`.
  Prisma la encuentra sola, no hace falta pasar `--config`.
- El schema está en `prisma/schema.prisma`.