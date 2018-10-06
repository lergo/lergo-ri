FROM node:6.9.1

# BUILD: docker build -t lergo-ri .
# RUN: docker run -it lergo-ri
# GO INTO: docker run -it lergo-ri bash

ENV workdir /app/lergo
WORKDIR ${workdir}
ADD package.json ${workdir}
RUN npm install
ADD . ${workdir}
RUN ./node_modules/.bin/grunt build
CMD ["node", "server.js"]
