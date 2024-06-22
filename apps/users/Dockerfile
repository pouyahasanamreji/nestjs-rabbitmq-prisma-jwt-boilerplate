FROM node:alpine As development

# Install dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:alpine as production

# Install dependencies for bcrypt and other native modules
RUN apk add --no-cache python3 make g++

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

# Rebuild bcrypt for production
RUN npm rebuild bcrypt --build-from-source

CMD ["node", "dist/apps/users/main"]