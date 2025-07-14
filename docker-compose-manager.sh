#!/bin/bash

# Script para manejar la aplicación con Docker Compose

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

show_help() {
    echo "🐳 Docker Compose Manager para Sistema JASS"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponibles:"
    echo "  up          Construir y levantar todos los servicios"
    echo "  down        Detener y remover todos los servicios"
    echo "  build       Construir las imágenes"
    echo "  restart     Reiniciar todos los servicios"
    echo "  logs        Mostrar logs de todos los servicios"
    echo "  status      Mostrar estado de los servicios"
    echo "  clean       Limpiar contenedores e imágenes no utilizadas"
    echo "  help        Mostrar esta ayuda"
    echo ""
}

# Verificar si Docker Compose está disponible
check_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker-compose"
    elif docker compose version &> /dev/null; then
        DOCKER_COMPOSE_CMD="docker compose"
    else
        print_error "Docker Compose no está disponible."
        exit 1
    fi
}

case "$1" in
    "up")
        check_docker_compose
        print_message "Construyendo y levantando servicios..."
        $DOCKER_COMPOSE_CMD up -d --build
        print_success "Servicios levantados exitosamente"
        print_message "La aplicación está disponible en: http://localhost"
        ;;
    "down")
        check_docker_compose
        print_message "Deteniendo servicios..."
        $DOCKER_COMPOSE_CMD down
        print_success "Servicios detenidos"
        ;;
    "build")
        check_docker_compose
        print_message "Construyendo imágenes..."
        $DOCKER_COMPOSE_CMD build --no-cache
        print_success "Imágenes construidas"
        ;;
    "restart")
        check_docker_compose
        print_message "Reiniciando servicios..."
        $DOCKER_COMPOSE_CMD restart
        print_success "Servicios reiniciados"
        ;;
    "logs")
        check_docker_compose
        print_message "Mostrando logs..."
        $DOCKER_COMPOSE_CMD logs -f
        ;;
    "status")
        check_docker_compose
        print_message "Estado de los servicios:"
        $DOCKER_COMPOSE_CMD ps
        ;;
    "clean")
        print_message "Limpiando contenedores e imágenes no utilizadas..."
        docker system prune -f
        docker image prune -f
        print_success "Limpieza completada"
        ;;
    "help"|*)
        show_help
        ;;
esac
