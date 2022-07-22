const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require("path");
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')


const helper = require('./helper')


const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name,transient) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));
        console.log("invoke.js_youngseok_invoke_transaction")

        const ccp = await helper.getCCP(org_name)
        console.log("invoke.js_youngseok_get_orgname")

        const walletPath = await helper.getWalletPath(org_name)

        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log("invoke.js_youngseok_get_wallet_complete")

        console.log(`invoke.js_Wallet path: ${walletPath}`);

        let identity = await wallet.get(username);
        if (!identity) {
            console.log(`invoke.js_An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('invoke.js_Run the registerUser.js application before retrying');
            return;
        }
        console.log("invoke.js_youngseok_get_wallet_identity")



        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: false },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
        }
        console.log("invoke.js_youngseok_connection_ready")

        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);
        const network = await gateway.getNetwork(channelName);
        console.log("invoke.js_youngseok_connection_complete")

        const contract = network.getContract(chaincodeName);
        console.log("invoke.js_youngseok_get_contract")

        let result
        let message;

        if (fcn ==="Interval_Random_Insert") {
          	result = await contract.submitTransaction(fcn ,args[0], args[1]);
          	message = "successfully transaction"
        } else if (fcn === "Read_NFT"){
          	result = await contract.submitTransaction(fcn ,args[0], args[1],args[2],args[3]);
          	message = "successfully transaction"
        } else if ( fcn === "Burn_NFT"){
	        result = await contract.submitTransaction(fcn ,args[0], args[1],args[2],args[3]);
          	message = "successfully transaction"
	} else if (fcn==="Verify_transaction"){
          	result = await contract.submitTransaction(fcn, args[0], args[1],args[2],args[3],args[4]);
		message = "successfully transaction"
	}
        else {
            return `Invocation require, got ${fcn}`
        }
        await gateway.disconnect();


        let response = {
            message: message
        }

        return response;


    } catch (error) {

        console.log(`invoke.js_Getting error: ${error}`)
        return error.message

    }
}

exports.invokeTransaction = invokeTransaction;
