FROM node:22-alpine AS build
WORKDIR /app/frontend
# Empty by default so the built app uses relative URLs, proxied same-origin by nginx
# (see nginx.conf) — works from any host/IP that can reach this container, phones included.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
