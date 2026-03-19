## API Cuidajunto (Neon + Prisma)

1. Crie um arquivo `.env` em `server/` baseado em `.env.example` e cole a sua `DATABASE_URL` da Neon.
2. No diretório `server/` rode:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

3. No diretório raiz do front-end, garanta que `VITE_API_BASE_URL` em `.env` aponte para `http://localhost:4000`.

