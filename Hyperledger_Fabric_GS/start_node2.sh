sudo rm -r couchdb/

# docker network profile and driver create
docker network create --attachable --driver overlay artifacts_test

# docker compose at vm1 directory
pushd setup/vm1/
docker-compose up -d
popd

# docker compose at vm2 directory
pushd setup/vm2/
docker-compose up -d
popd

# docker compose at vm3 directory
pushd setup/vm3/
docker-compose up -d
popd

# docker compose at vm3_sub directory
pushd setup/vm3_sub/
docker-compose up -d
popd

# docker compose at vm4 directory
pushd setup/vm4/
docker-compose up -d
popd

sleep 5

pushd setup/vm1/create-certificate-with-ca/
docker-compose up -d
popd

pushd setup/vm2/create-certificate-with-ca/
docker-compose up -d
popd

pushd setup/vm3/create-certificate-with-ca/
docker-compose up -d
popd

pushd setup/vm3_sub/create-certificate-with-ca/
docker-compose up -d
popd

pushd setup/vm4/create-certificate-with-ca/
docker-compose up -d
popd

pushd setup/vm1/
./createChannel.sh
popd

sleep 5

pushd setup/vm2/
./joinChannel.sh
popd

pushd setup/vm3/
./joinChannel.sh
popd

pushd setup/vm3_sub/
./joinChannel.sh
popd

pushd setup/vm1/
./deployChaincode_init.sh
popd

pushd setup/vm2/
./installAndApproveChaincode.sh
popd

pushd setup/vm3/
./installAndApproveChaincode.sh
popd

pushd setup/vm3_sub/
./installAndApproveChaincode.sh
popd


sleep 5

pushd setup/vm1/
./deployChaincode_insertchaincode.sh
popd
