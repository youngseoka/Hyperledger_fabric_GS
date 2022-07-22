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
VERSION="2"
CC_SRC_PATH="/home/fabric/Hyperledger_Fabric_NFT_TEST/artifacts/src/github.com/save_ipfs_hash/go"
CC_NAME="save_ipfs_hash"



checkCommitReadyness() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${VERSION} \
        --sequence ${VERSION} --output json --init-required
    echo "===================== checking commit readyness from org 1 ===================== "
}

# checkCommitReadyness

commitChaincodeDefination() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode commit -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com \
	--tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
	--channelID "digitalzonenipanft" --name "save_ipfs_hash" \
        --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles $PEER0_ORG2_CA  \
        --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles $PEER0_ORG3_CA\
        --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles $PEER0_ORG4_CA \
	--version ${VERSION}  --sequence ${VERSION}  --init-required
}

# commitChaincodeDefination

queryCommitted() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

}

# queryCommitted

chaincodeInvokeInit() {
    setGlobalsForPeer0Org1

    peer chaincode invoke -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C "digitalzonenipanft" -n "save_ipfs_hash" \
	--peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
	--peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles $PEER0_ORG2_CA  \
	--peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles $PEER0_ORG3_CA\
	--peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles $PEER0_ORG4_CA \
        --isInit -c '{"Args":[]}'

}

chaincodeInvokeInit_not_insert() {
    setGlobalsForPeer0Org1g
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA \
         --peerAddresses localhost:11051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --isInit -c '{"Args":[]}'

}


# chaincodeInvokeInit

chaincodeInvoke() {
    setGlobalsForPeer0Org1
    peer chaincode invoke -o orderer.example.com:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C "digitalzonenipanft" -n "save_ipfs_hash" \
        --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles $PEER0_ORG2_CA  \
        --peerAddresses peer0.org3.example.com:11051 --tlsRootCertFiles $PEER0_ORG3_CA\
        --peerAddresses peer0.org4.example.com:21051 --tlsRootCertFiles $PEER0_ORG4_CA \
        -c '{"function": "Register_NFT","Args":["initial_nft_id", "initial_balancd","initial_timestamp","initial_tokenuri","initial_tokenid","initial_minter","initial_fcn","initial_title","initial_category","initial_nft_num","initial_nft_status"]}'


}

# chaincodeInvoke

chaincodeQuery() {
    setGlobalsForPeer0Org1
    peer chaincode query -C digitalzonenipanft -n save_ipfs_hash -c '{"function": "query_item","Args":["youngseok1"]}'
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"
echo "fabric setup, createchannel, joinchannel, deploychaincode, invokechaincode, querychaincode is done"

}

# chaincodeQuery




 checkCommitReadyness
 commitChaincodeDefination
 queryCommitted
 chaincodeInvokeInit
 sleep 5
 chaincodeInvoke
 sleep 3
 chaincodeQuery
