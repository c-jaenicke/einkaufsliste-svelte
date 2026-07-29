# DOCKERFILE FOR BUILDING SVELTEKIT FRONTEND IMAGE
# BUILD USING `docker build -f Dockerfile . -t einkaufsliste-frontend:latest`

## BUILD STAGE
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package config
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Run production build
RUN pnpm run build

# Drop devDependencies now that the build output exists, so the runtime
# image doesn't ship the whole dev toolchain (vite, vitest, playwright, ...)
RUN pnpm prune --prod

## RUNTIME STAGE
FROM node:20-alpine AS runner

WORKDIR /app

# Copy package config and built files
COPY --from=builder --chown=node:node /app/package.json ./
COPY --from=builder --chown=node:node /app/build ./build
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# node:alpine ships a non-root "node" user (uid/gid 1000), matching the
# Helm chart's podSecurityContext.
USER node

# Expose SvelteKit port
EXPOSE 3000

# Set default runtime environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000
ENV API_BASE=http://api:8080
ENV PUBLIC_API_BASE=http://localhost:8080

CMD ["node", "build/index.js"]
