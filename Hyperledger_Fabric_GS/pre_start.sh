pushd setup/vm1/create-certificate-with-ca/
docker-compose up -d
sleep 5
./create-certificate-with-ca.sh
sleep 5
docker-compose down
popd

pushd setup/vm2/create-certificate-with-ca/
docker-compose up -d
sleep 5
./create-certificate-with-ca.sh
sleep 5
docker-compose down
popd

pushd setup/vm3/create-certificate-with-ca/
docker-compose up -d
sleep 5
./create-certificate-with-ca.sh
sleep 5
docker-compose down
popd

pushd setup/vm3_sub/create-certificate-with-ca/
docker-compose up -d
sleep 5
./create-certificate-with-ca.sh
sleep 5
docker-compose down
popd

pushd setup/vm4/create-certificate-with-ca/
docker-compose up -d
sleep 5
./create-certificate-with-ca.sh
sleep 5
docker-compose down
popd


pushd artifacts/channel/
./create-artifacts.sh
sleep 5
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


pushd setup/vm1/
./deployChaincode_trustID_init.sh
popd

pushd setup/vm2/
./installAndApproveChaincode_trustID.sh
popd

pushd setup/vm3/
./installAndApproveChaincode_trustID.sh
popd

pushd setup/vm3_sub/
./installAndApproveChaincode_trustID.sh
popd


pushd setup/vm1/
./deployChaincode_trustID_insert.sh
popd

pushd setup/vm1/
./deployChaincode_NFT_init.sh
popd

pushd setup/vm2/
./installAndApproveChaincode_NFT.sh
popd

pushd setup/vm3/
./installAndApproveChaincode_NFT.sh
popd

pushd setup/vm3_sub/
./installAndApproveChaincode_NFT.sh
popd

pushd setup/vm1/
./deployChaincode_NFT_insertchaincode.sh
popd


pushd setup/vm1/
./deployChaincode_interval_random_init.sh
popd

pushd setup/vm2/
./installAndApproveChaincode_Interval_random.sh
popd

pushd setup/vm3/
./installAndApproveChaincode_Interval_random.sh
popd

pushd setup/vm3_sub/
./installAndApproveChaincode_Interval_random.sh
popd

pushd setup/vm1/
./deployChaincode_interval_random_insert.sh
popd
