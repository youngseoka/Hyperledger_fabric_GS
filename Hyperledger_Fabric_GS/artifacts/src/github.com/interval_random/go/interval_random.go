package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	sc "github.com/hyperledger/fabric-protos-go/peer"
	"github.com/hyperledger/fabric/common/flogging"

)

type SmartContract struct {
}

type Random struct{
	Random_number string `json:"random_number"`
	Timestamp string `json:"timestamp"`
}


func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

var logger = flogging.MustGetLogger("interval_random_cc")

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()
	logger.Infof("Function name is:  %d", function)
	logger.Infof("Args length is : %d", len(args))

	switch function {
	case "initLedger":
		return s.initLedger(APIstub)
	case "Interval_Random_Insert":
		return s.Interval_Random_Insert(APIstub, args)
	default:
		return shim.Error("Invalid Smart Contract function name.")
	}
}


func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response{

	randoms := []Random{
		Random{ Random_number:"11", Timestamp: "22" },
		Random{ Random_number:"11", Timestamp: "22" },
	}

	i := 0
	for i < len(randoms){
		randomAsBytes, _ :=json.Marshal(randoms[i])
		APIstub.PutState("INTERVAL_RANDOM"+strconv.Itoa(i),randomAsBytes)
		i = i + 1
	}
	return shim.Success(nil)
}



func (s *SmartContract) Interval_Random_Insert(APIstub shim.ChaincodeStubInterface, args[]string) sc.Response{


	var random = Random{Random_number:args[0], Timestamp: args[1]}
	randomAsBytes, _ := json.Marshal(random)
	APIstub.PutState(args[0], randomAsBytes)

	indexName := "owner~key"
	colorNameIndexKey, err :=APIstub.CreateCompositeKey(indexName, []string{"digitalzonenipanft", "Interval_Random"})
	if err != nil {
		return shim.Error(err.Error())
	}
	value := []byte{0x00}
	APIstub.PutState(colorNameIndexKey, value)
	return shim.Success(randomAsBytes)
}




func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
