#!/bin/sh
export DB_USER_MIGRATION="SA"
export DB_PASSWORD_MIGRATION="Yolo123456"
export DB_USER="SA"
export DB_SERVER="localhost"
export DB_PASSWORD="Yolo123456"
export DB_NAME="MyDatabase"
export DB_INSTANCE=""

sudo docker start mssql || sudo docker run -e 'ACCEPT_EULA=Y' -e "SA_PASSWORD=$DB_PASSWORD" -p 1433:1433 --name mssql -d mcr.microsoft.com/mssql/server:2017-latest;
sleep 15s;
sudo docker exec -it mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U $DB_USER -P $DB_PASSWORD -Q "DROP DATABASE $DB_NAME;CREATE DATABASE $DB_NAME;" && \

npm run knex migrate:latest
