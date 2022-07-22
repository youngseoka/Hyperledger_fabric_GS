export PEER0_ORG1_CA=${PWD}/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
export FABRIC_CFG_PATH=${PWD}/../../artifacts/channel_NIPA_NFT/config/
peer chaincode query -C digitalzonenipanft -n save_ipfs_hash -c '{"function": "query_item","Args":["youngseok1"]}'

