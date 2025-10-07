FROM node:latest

WORKDIR /u23629810

COPY . /u23629810

# explicit copy of env file
COPY .env /u23629810/.env

RUN npm install

RUN npm run build

CMD [ "npm", "start" ]

EXPOSE 5000
