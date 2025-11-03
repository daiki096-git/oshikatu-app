FROM node:22
WORKDIR /usr/src

# 依存関係インストール用に package.json と tsconfig.json を先にコピー
COPY package*.json tsconfig.json ./

RUN npm install

# コピー（本番用 dist ビルドに必要）
COPY src ./src
COPY public ./public

# ビルドと views コピー
RUN npx tsc && mkdir -p dist/views && cp -r src/views/* dist/views/

# 起動
CMD ["npm", "run", "start"]
