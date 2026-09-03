# Alpine keeps the image small, and argon2 ships a prebuilt musl binary, so the
# password hashing dependency is not compiled during the build.
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# The process runs as a non-root user; nothing here needs write access.
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
