# Base image: Official NGINX Unprivileged Alpine (runs as non-root on port 8080)
FROM nginxinc/nginx-unprivileged:alpine

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy application static files
COPY src/ /usr/share/nginx/html/

# Expose unprivileged HTTP port
EXPOSE 8080

# Run NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]
