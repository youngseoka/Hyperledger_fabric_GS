export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../vm4/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/../vm2/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/../vm3/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export PEER0_ORG4_CA=${PWD}/../vm3_sub/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/../../artifacts/channel_NIPA_NFT/config/


export CHANNEL_NAME=digitalzonenipanft

setGlobalsForPeer0Org1() {
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer1Org1() {
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:8051

}


CHANNEL_NAME="digitalzonenipanft"
CC_RUNTIME_LANGUAGE="node"
VERSION="1"
CC_SRC_PATH="/home/fabric/go/src/fabric-samples/token-erc-721/chaincode-javascript/"
CC_NAME="token_erc721"





chaincodeInvoke_NFT1() {
    setGlobalsForPeer0Org1
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile /etc/hyperledger/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
        -C "digitalzonenipanft" -n "token_erc721" \
        --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
        --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt \
  --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt \
        -c '{"function": "MintWithTokenURI","Args":["6646315066423778111", "https://youngseok.com/nft103.json","123"]}'
}
#chaincodeInvoke_NFT


chaincodeQuery() {
    setGlobalsForPeer0Org1
    peer chaincode query -C digitalzonenipanft -n token_erc721 -c '{"function": "ClientAccountBalance","Args":[]}'
}

# chaincodeQuery

chaincodeQuery() {
    setGlobalsForPeer0Org1
    peer chaincode query -C digitalzonenipanft -n token_erc721 -c '{"function": "OwnerOf","Args":["102"]}'
}

#chaincodeQuery

chaincodeQuery() {
    setGlobalsForPeer0Org1
    peer chaincode query -C digitalzonenipanft -n token_erc721 -c '{"function": "ClientAccountID","Args":[]}'
}

#chaincodeQuery


export MINTER="x509::/C=US/ST=North Carolina/O=Hyperledger/OU=admin/CN=org1admin::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=fabric-ca-server"
export RECIPIENT="x509::/C=US/ST=North Carolina/O=Hyperledger/OU=admin/CN=org2admin::/C=US/ST=North Carolina/O=Hyperledger/OU=Fabric/CN=fabric-ca-server"

chaincodeInvoke_NFT() {
    setGlobalsForPeer0Org1
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile /etc/hyperledger/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
        -C "digitalzonenipanft" -n "token_erc721" \
        --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
        --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt \
  --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt \
        -c '{"function": "MintWithTokenURI","Args":["101","https://example.com/nft101.json"]}'
}

test_NFT() {
    setGlobalsForPeer0Org1
    docker exec cli peer chaincode invoke -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile /etc/hyperledger/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
        -C "digitalzonenipanft" -n "token_erc721" \
        --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
        --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt \
  --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt \
        -c '{"function": "","Args":[""]}'
}

test_tt(){
setGlobalsForPeer0Org1
peer chaincode query \
-C  digitalzonenipanft \
-n  token_erc721 \
-c '{"function": "TotalSupply","Args":[""]}'
}

test_tt2(){
setGlobalsForPeer0Org1
peer chaincode query \
-C  digitalzonenipanft \
-n  token_erc721 \
-c '{"function": "TokenURI","Args":["102"]}'
}

test_tt3(){
setGlobalsForPeer0Org1
peer chaincode query \
-C  digitalzonenipanft \
-n  token_erc721 \
-c '{"function": "Name","Args":[""]}'
}

test_tt4(){
setGlobalsForPeer0Org1
peer chaincode query \
-C  digitalzonenipanft \
-n  token_erc721 \
-c '{"function": "_readNFT","Args":["103"]}'
}

test_tt5(){
setGlobalsForPeer0Org1
peer chaincode query \
-C  digitalzonenipanft \
-n  token_erc721 \
-c '{"function": "OwnerOf_cid","Args":["4912434088"]}'
}



#chaincodeInvoke_NFT1
#test_NFT
#test_tt
#test_tt2
#test_tt3
#test_tt4
test_tt5
