FROM nginx:alpine

COPY y /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]