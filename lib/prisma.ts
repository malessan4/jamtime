// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {    // Inicialización limpia: Prisma leerá automáticamente el archivo .env gracias al schema
    return new PrismaClient();
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;