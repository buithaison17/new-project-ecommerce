# Stage 1: Build the React app
FROM node:24 AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Pass API URL at build time (default to production backend)
ARG VITE_API_BASE_URL=http://221.121.4.43:8080/api/v1
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx configuration and html files
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend assets
COPY --from=build /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]