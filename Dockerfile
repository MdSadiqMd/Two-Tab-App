FROM rust:1.72-slim as rust-builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl pkg-config libssl-dev git && \
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

COPY server ./server
RUN cd server && \
    cargo update && \
    wasm-pack build --target web

FROM node:18-slim AS react-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY --from=rust-builder /app/server/pkg ./server/pkg

COPY . .

RUN npm run build

FROM node:18-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=react-builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]