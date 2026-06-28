# Dockerfile

# --- Etapa Base ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Etapa 1: Instalación de Dependencias ---
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalamos todas las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# --- Etapa 2: Compilación de la Aplicación ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

# Desactivamos la telemetría de Next.js durante la compilación
ENV NEXT_TELEMETRY_DISABLED=1

# Inyectamos URLs ficticias OBLIGATORIAS para que Prisma compile los tipos sin romper el build
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV DIRECT_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Generamos el cliente de Prisma adaptado a la versión 7 y compilamos Next.js
RUN npx prisma generate
RUN npm run build

# --- Etapa 3: Entorno de Ejecución en Producción ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Creamos un usuario de sistema con privilegios reducidos por motivos de seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos los recursos públicos estáticos
COPY --from=builder /app/public ./public

# Configuramos los permisos correctos para la caché interna de prerenderizado
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiamos el build 'standalone' optimizado y los archivos estáticos necesarios
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Cambiamos al usuario sin privilegios root
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Iniciamos el servidor de Node.js nativo autogenerado por Next.js
CMD ["node", "server.js"]