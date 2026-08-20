FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies without native scripts (uses pure-JS tedious driver in Linux/Docker)
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Health check using IPv4 127.0.0.1 to avoid Alpine IPv6 localhost resolution issues
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

CMD ["node", "src/server.js"]
