FROM node:14-alpine
LABEL maintainer="Max Meinhold <mxmeinhold@gmail.com>"

RUN mkdir /opt/impeach
WORKDIR /opt/impeach

COPY package*.json ./

RUN npm install

COPY ./gulpfile.js ./gulpfile.js/
COPY ./scss ./scss/

RUN npx gulp css && rm -rf gulpfile.js scss && npm prune --production

CMD ["node", "src/server.js"]
