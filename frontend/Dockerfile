FROM node:18 as build

WORKDIR /app

ARG VITE_USERNAME
ARG VITE_PASSWORD
ARG VITE_API_BASE

ENV VITE_USERNAME=$VITE_USERNAME
ENV VITE_PASSWORD=$VITE_PASSWORD
ENV VITE_API_BASE=$VITE_API_BASE

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install

EXPOSE 4173

CMD ["npm", "run", "preview"]