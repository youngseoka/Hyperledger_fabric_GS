FROM node:12.16.0

COPY . .

RUN cd /app/persistence/fabric/postgreSQL/db && \
    ./createdb.sh

CMD npm start
