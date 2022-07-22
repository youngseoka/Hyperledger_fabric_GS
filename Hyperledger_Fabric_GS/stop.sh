pushd setup/blockchain-explorer/
docker-compose down
popd

pushd setup/vm1/create-certificate-with-ca/
docker-compose down
popd

pushd setup/vm2/create-certificate-with-ca/
docker-compose down
popd

pushd setup/vm3/create-certificate-with-ca/
docker-compose down
popd

pushd setup/vm4/create-certificate-with-ca/
docker-compose down
popd

pushd setup/vm1/api-2.0/
docker-compose down
popd

pushd setup/vm1/
docker-compose down
popd

pushd setup/vm2/
docker-compose down
popd

pushd setup/vm3/
docker-compose down
popd

pushd setup/vm4/
docker-compose down
popd

docker rm -f $(docker ps -aq)

docker network prune -f

docker volume prune -f
