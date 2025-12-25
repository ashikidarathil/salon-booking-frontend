# 1️⃣ Build React app
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2️⃣ Serve with Nginx
FROM nginx:alpine

# 🔥 Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🔥 Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]