export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../vm4/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG4_CA=${PWD}/crypto-config/peerOrganizations/org4.example.com/peers/peer0.org4.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/../../artifacts/channel_NIPA_NFT/config/


export CHANNEL_NAME=digitalzonenipanft

setGlobalsForPeer0Org4() {
    export CORE_PEER_LOCALMSPID="Org4MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG4_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp
    export CORE_PEER_ADDRESS=localhost:21051

}

setGlobalsForPeer1Org4() {
    export CORE_PEER_LOCALMSPID="Org4MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG4_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org4.example.com/users/Admin@org4.example.com/msp
    export CORE_PEER_ADDRESS=localhost:22051

}

presetup() {
    echo Vendoring javascript dependencies ...
    pushd /home/fabric/go/src/fabric-samples/token-erc-721/chaincode-javascript/
    #GO111MODULE=on go mod vendor
    npm install
    npm run build
    popd
    echo Finished vendoring javascript dependencies
}
# presetup

CHANNEL_NAME="digitalzonenipanft"
CC_RUNTIME_LANGUAGE="node"
VERSION="1"
CC_SRC_PATH="/home/fabric/go/src/fabric-samples/token-erc-721/chaincode-javascript/"
CC_NAME="token_erc721"

packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    setGlobalsForPeer0Org4
    peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${VERSION}
    echo "===================== Chaincode is packaged on peer0.org4 ===================== "
}
# packageChaincode

installChaincode() {
    setGlobalsForPeer0Org4
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org4 ===================== "

}

# installChaincode

queryInstalled() {
    setGlobalsForPeer0Org4
    peer lifecycle chaincode queryinstalled >&log.txt

    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo PackageID is ${PACKAGE_ID}
    echo "===================== Query installed successful on peer0.org4 on channel ===================== "
}

# queryInstalled

approveForMyOrg4() {
    setGlobalsForPeer0Org4

    peer lifecycle chaincode approveformyorg -o 211.232.75.182:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${VERSION}

    echo "===================== chaincode approved from org 4 ===================== "
}
# queryInstalled
# approveForMyOrg4

checkCommitReadyness() {

    setGlobalsForPeer0Org4
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:21051 --tlsRootCertFiles $PEER0_ORG4_CA \
        --name ${CC_NAME} --version ${VERSION} --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from org 4 ===================== "
}

# checkCommitReadyness


presetup
packageChaincode
installChaincode
queryInstalled
approveForMyOrg4
checkCommitReadyness
