# DOCKERFILE
# einkaufsliste-svelte frontend image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
COPY .env .
EXPOSE 3000
ENV NODE_ENV=production
# build and include variables in .env file
CMD [ "node","-r","dotenv/config", "build" ]
#CMD [ "node", "build" ]
