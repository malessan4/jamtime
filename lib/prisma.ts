// lib/prisma.ts

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // 1. Limpiamos cualquier comilla que Docker haya inyectado por accidente
  const cleanUrl = process.env.DATABASE_URL?.replace(/['"]/g, '');

  // 2. Inicializamos el Pool. 
  const pool = new Pool({ 
    connectionString: cleanUrl 
  });
  
    // 3. Envolvemos el pool con el adaptador oficial de Prisma para Postgres 
  const adapter = new PrismaPg(pool);
  
    // 4. Prisma 7 requiere que le pases el adapter en lugar de datasources
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;3