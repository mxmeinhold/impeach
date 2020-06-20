FROM alpine:3.12
LABEL maintainer="Max Meinhold <mxmeinhold@gmail.com>"

ENV NODE_VERSION 14.3.0

EXPOSE 8080

RUN apk add 'nodejs-current=14.3.0-r0' 'nodejs-npm=12.17.0-r0'

RUN mkdir /opt/impeach
WORKDIR /opt/impeach

COPY package*.json ./

RUN npm install

COPY ./assets ./assets/
COPY ./gulpfile.js ./gulpfile.js/
COPY ./src/scss ./src/scss

RUN npx gulp gen-static && rm -rf gulpfile.js && npm prune --production

COPY ./src/ ./src/

USER 1001

CMD ["node", "src/server.js"]
