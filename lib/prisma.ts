// lib/prisma.ts

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // 1. Inicializamos el Pool de conexiones nativo con la URL de Supabase
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    // 2. Envolvemos el pool con el adaptador oficial de Prisma para Postgres
    const adapter = new PrismaPg(pool);

    // 3. Prisma 7 requiere que le pases el adapter en lugar de datasources
    return new PrismaClient({ adapter });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;