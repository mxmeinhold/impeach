FROM alpine:3.12
LABEL maintainer="Max Meinhold <mxmeinhold@gmail.com>"

ENV NODE_VERSION 14.5.0

EXPOSE 8080

RUN apk add 'nodejs-current=14.5.0-r0' 'nodejs-npm=12.17.0-r0'

RUN mkdir /opt/impeach
WORKDIR /opt/impeach

COPY package*.json ./

RUN npm install

COPY ./assets ./assets/
COPY ./gulpfile.js ./gulpfile.js/
COPY ./src/scss ./src/scss

RUN npx gulp gen-static &&  npm prune --production

COPY . /opt/impeach

USER 1001

CMD ["node", "src/server.js"]
