#!/usr/bin/env bash
docker-compose down 
rm -rf ./volumes

mkdir -p ./volumes
mkdir -p ./volumes/postgres ./volumes/geth

docker-compose up -d
