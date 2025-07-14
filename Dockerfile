# Multi-stage build para optimizar el tamaño de la imagen final

# Etapa 1: Build de la aplicación Angular
FROM node:18-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build --prod

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar los archivos construidos desde la etapa anterior
COPY --from=build /app/dist/sistema-jass /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
