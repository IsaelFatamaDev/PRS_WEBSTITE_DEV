#!/bin/bash

# Script para construir y desplegar la aplicación con Docker

set -e

echo "🐳 Iniciando proceso de construcción de Docker..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con colores
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose no está disponible. Por favor instala Docker Compose."
    exit 1
fi

# Variables
IMAGE_NAME="sistema-jass-web"
TAG="latest"
CONTAINER_NAME="sistema-jass-frontend"

print_message "Limpiando contenedores e imágenes anteriores..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker rmi $IMAGE_NAME:$TAG 2>/dev/null || true

print_message "Construyendo la imagen Docker..."
docker build -t $IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    print_success "Imagen construida exitosamente: $IMAGE_NAME:$TAG"
else
    print_error "Error al construir la imagen Docker"
    exit 1
fi

print_message "Ejecutando contenedor..."
docker run -d \
    --name $CONTAINER_NAME \
    -p 80:80 \
    --restart unless-stopped \
    $IMAGE_NAME:$TAG

if [ $? -eq 0 ]; then
    print_success "Contenedor ejecutándose exitosamente"
    print_message "La aplicación está disponible en: http://localhost"
    print_message "Para ver los logs: docker logs $CONTAINER_NAME"
    print_message "Para detener el contenedor: docker stop $CONTAINER_NAME"
else
    print_error "Error al ejecutar el contenedor"
    exit 1
fi

print_success "🎉 Despliegue completado exitosamente!"
