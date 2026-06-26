// prisma.config.ts

import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Mejor práctica: Para la CLI (hacer push, migraciones, etc.), 
    // SIEMPRE usamos la URL directa de Supabase, no el pooler.
    url: env("DIRECT_URL"),
  },
});