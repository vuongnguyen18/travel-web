FROM node:18-alpine
WORKDIR /app
# API deps
COPY api/package*.json ./api/
RUN cd api && npm ci --only=production
# API + web code
COPY api ./api
COPY web ./web
ENV PORT=3000
EXPOSE 3000
CMD ["node", "api/src/server.js"]
