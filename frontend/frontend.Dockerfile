FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom Nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy your HTML files to Nginx's serving directory
COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]