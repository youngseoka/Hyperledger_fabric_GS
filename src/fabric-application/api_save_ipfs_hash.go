package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/gateway"
)

func main() {
	log.Println("============ application-golang starts ============")

	err := os.Setenv("DISCOVERY_AS_LOCALHOST", "true")
	if err != nil {
		log.Fatalf("Error setting DISCOVERY_AS_LOCALHOST environemnt variable: %v", err)
	}

	wallet, err := gateway.NewFileSystemWallet("wallet")
	if err != nil {
		log.Fatalf("Failed to create wallet: %v", err)
	}

	if !wallet.Exists("appUser") {
		err = populateWallet(wallet)
		if err != nil {
			log.Fatalf("Failed to populate wallet contents: %v", err)
		}
	}
	log.Println("youngseok_count_7")

	ccpPath := filepath.Join(
		"./connection-org1.json",
	)
	log.Println("youngseok_count_8")

	gw, err := gateway.Connect(
		gateway.WithConfig(config.FromFile(filepath.Clean(ccpPath))),
		gateway.WithIdentity(wallet, "appUser"),
	)
	log.Println("youngseok_count_9")
	if err != nil {
		log.Fatalf("Failed to connect to gateway: %v", err)
	}
	log.Println("youngseok_count_10")
	defer gw.Close()
	log.Println("youngseok_count_11")

	network, err := gw.GetNetwork("digitalzone")
	log.Println("youngseok_count_12")
	if err != nil {
		log.Fatalf("Failed to get network: %v", err)
	}
	log.Println("youngseok_count_13")

	contract := network.GetContract("token_erc721")
	log.Println("youngseok_count_14")
  log.Println(contract)
/*
	log.Println("--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger")
	result, err := contract.SubmitTransaction("InitLedger")
	if err != nil {
		log.Fatalf("Failed to Submit transaction: %v", err)
	}
	log.Println(string(result))

	log.Println("--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger")
	result, err = contract.EvaluateTransaction("GetAllAssets")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v", err)
	}
	log.Println(string(result))
*/
	result, err := contract.SubmitTransaction("MintWithTokenURI", "101231", "https://example.com/nft101123.json")
	if err != nil {
		log.Fatalf("Failed to Submit transaction: %v", err)
	}
	log.Println(string(result))
/*
	log.Println("--> Evaluate Transaction: ReadAsset, function returns an asset with a given assetID")
	result, err = contract.EvaluateTransaction("ReadAsset", "asset13")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v\n", err)
	}
	log.Println(string(result))

	log.Println("--> Evaluate Transaction: AssetExists, function returns 'true' if an asset with given assetID exist")
	result, err = contract.EvaluateTransaction("AssetExists", "asset1")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v\n", err)
	}
	log.Println(string(result))

	log.Println("--> Submit Transaction: TransferAsset asset1, transfer to new owner of Tom")
	_, err = contract.SubmitTransaction("TransferAsset", "asset1", "Tom")
	if err != nil {
		log.Fatalf("Failed to Submit transaction: %v", err)
	}

	log.Println("--> Evaluate Transaction: ReadAsset, function returns 'asset1' attributes")
	result, err = contract.EvaluateTransaction("ReadAsset", "asset1")
	if err != nil {
		log.Fatalf("Failed to evaluate transaction: %v", err)
	}
	log.Println(string(result))
	log.Println("============ application-golang ends ============")
  */
}

func populateWallet(wallet *gateway.Wallet) error {
	log.Println("============ Populating wallet ============")
	credPath := filepath.Join(
		"/home/fabric/Hyperledger_Fabric_NFT/setup/vm1/crypto-config/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp",
	)
	log.Println("youngseok_count_1")
	certPath := filepath.Join(credPath, "signcerts", "cert.pem")
	// read the certificate pem
	log.Println("youngseok_count_2")
	cert, err := ioutil.ReadFile(filepath.Clean(certPath))
	log.Println("youngseok_count_3")
	if err != nil {
		return err
	}
	log.Println("youngseok_count_4")
	keyDir := filepath.Join(credPath, "keystore")
	log.Println("youngseok_count_5")
	// there's a single file in this dir containing the private key
	files, err := ioutil.ReadDir(keyDir)
	log.Println("youngseok_count_6")
	if err != nil {
		return err
	}
	if len(files) != 1 {
		return fmt.Errorf("keystore folder should have contain one file")
	}
	keyPath := filepath.Join(keyDir, files[0].Name())
	key, err := ioutil.ReadFile(filepath.Clean(keyPath))
	if err != nil {
		return err
	}

	identity := gateway.NewX509Identity("Org1MSP", string(cert), string(key))

	return wallet.Put("appUser", identity)
}
