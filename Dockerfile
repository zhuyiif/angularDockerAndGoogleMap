FROM node:6.5.0-slim

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY dashboard /usr/src/app/
RUN npm install

EXPOSE 8000

CMD [ "npm", "start" ]
