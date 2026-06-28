# deploy.ps1
Write-Host "Iniciando despliegue de JamTime (Produccion)..." -ForegroundColor Cyan

# 1. Cargar variables de entorno desde el archivo .env si existe
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        # Ignoramos lineas vacias o comentarios
        if ($line -and !$line.StartsWith("#") -and $line.Contains("=")) {
            $key, $value = $line.Split("=", 2)
            
            # Limpiamos espacios y eliminamos comillas dobles o simples
            $cleanKey = $key.Trim()
            $cleanValue = $value.Trim().Trim("'", '"')
            
            [System.Environment]::SetEnvironmentVariable($cleanKey, $cleanValue, "Process")
        }
    }
}

Write-Host "Sincronizando esquema de base de datos con Supabase..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Error al sincronizar la base de datos. Abortando despliegue." -ForegroundColor Red
    exit 
}

Write-Host "Compilando imagen de Docker..." -ForegroundColor Yellow
docker build -t jamtime-app .
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Error en Docker Build. Asegurate de que Docker Desktop este abierto." -ForegroundColor Red
    exit 
}

Write-Host "Deteniendo contenedor anterior si existe..." -ForegroundColor Yellow
$oldContainer = docker ps -a -q --filter "name=jamtime-container"
if ($oldContainer) {
    docker stop jamtime-container
    docker rm jamtime-container
}

Write-Host "Levantar nueva version de JamTime..." -ForegroundColor Green
docker run -d `
  --name jamtime-container `
  -p 3000:3000 `
  --env-file .env `
  --restart always `
  jamtime-app

if ($LASTEXITCODE -eq 0) {
    Write-Host "Despliegue completado con exito! Aplicacion corriendo en http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "Hubo un problema al levantar el contenedor final." -ForegroundColor Red
}