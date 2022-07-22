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
CC_RUNTIME_LANGUAGE="golang"
VERSION="1"
CC_SRC_PATH="/home/fabric/go/src/TrustID/fabric-chaincode"
CC_NAME="trustID"


checkCommitReadyness() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from org 1 ===================== "
}


commitChaincodeDefination() {
    setGlobalsForPeer0Org1
    docker exec cli peer lifecycle chaincode commit -o 211.232.75.182:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile /etc/hyperledger/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
        --channelID "digitalzonenipanft" --name "trustID" \
        --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
        --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt \
        --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt \
        --version ${VERSION} --sequence ${VERSION} --init-required
}


queryCommitted() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

}


chaincodeInvokeInit() {
    setGlobalsForPeer0Org1
    docker exec cli peer chaincode invoke -o 211.232.75.182:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile /etc/hyperledger/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem \
        -C "digitalzonenipanft" -n "trustID" \
	--peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt \
         --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt \
         --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles /etc/hyperledger/channel/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt \
         --isInit -c '{"Args":["Init","{\"did\":\"did:vtn:trustid:1b8453bd496091c0a0074037ad72caf2f7d0faccda45a3dc7c3b0972de7e547e\",\"controller\":\"did:vtn:trustid:1b8453bd496091c0a0074037ad72caf2f7d0faccda45a3dc7c3b0972de7e547e\",\"publicKey\":\"-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzanXfDHVAMx8KNOXDPuFF9gGTFGOZk1xg38tY1FjErYwoe4IC9Bjl6/Jda3HLYN9qa04YvaM6o7/AkSGTjPjQzz/9RQ1brE7WvB6Bmcwk/bQljqTtE/WHj1Oozrl5wDfUJ1xajMx/SLESOQsqkqRmuKiAL8Lylmx5hhHZq4ZQkOxRNeCma/uGFuP4hJggJcPSd0Gqiz40gui2pXcHqr8p1Q1hiBdA76EKFFu9cvV8uXwfEqMMQyyLn1nVFmau6RNJNTxhWlgrXwXX8VzbWmh7sgJkX+8/V4TgB0pigpEDX+0eqGLy7qI5wVY6LgsHOjU0O1j3k+tBjEYZm86RAzYcQIDAQAB-----END PUBLIC KEY-----\"}"]}'
}

 checkCommitReadyness
 commitChaincodeDefination
 queryCommitted
 chaincodeInvokeInit
