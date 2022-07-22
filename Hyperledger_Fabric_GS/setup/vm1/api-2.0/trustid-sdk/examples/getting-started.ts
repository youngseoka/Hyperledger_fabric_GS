import { exit } from "process";

// Load SDK library.
const sdk = require("../../trustid-sdk");
const fs = require("fs");
// Create new wallet. It follows a singleton approach.
const wal = sdk.Wallet.Instance;
console.log(wal)

// Initialize new FileKeystore with storage at ./keystore
const ks = new sdk.FileKeystore("file", "./keystore");
wal.setKeystore(ks)

const ccp = JSON.parse(fs.readFileSync("../connection-profile.json", 'utf8'));
const config = {
    stateStore: '/tmp/statestore',
    caURL: 'https://211.232.75.182:7054',
    caName: 'ca.org1.example.com',
    caAdmin: 'admin',
    caPassword: 'adminpw',
    tlsOptions: {
        trustedRoots: "-----BEGIN CERTIFICATE-----MIICFzCCAb2gAwIBAgIUCEVrm05983fEjN3lDmDRde6ASPAwCgYIKoZIzj0EAwIwaDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMtY2Etc2VydmVyMB4XDTIxMDYxMDA2MjAwMFoXDTM2MDYwNjA2MjAwMFowaDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMtY2Etc2VydmVyMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZV31xR+G0jlrq8F0EqiYmbArMC3OxzfLjJ3g8V+QC/sL25psRpid+o0X4AzDqG1b5VkuRtggvOIM8uMMQwr5t6NFMEMwDgYDVR0PAQH/BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQEwHQYDVR0OBBYEFLN13/zFdtwCMEm/0ySsRL9vW8YHMAoGCCqGSM49BAMCA0gAMEUCIQCpG2GH+NkgS9n0FV+xHoHJYww96ENq6iN0QhoQRayLPwIgdprv9MHtjTUO3LLP9umXUcn4as3I8RdamlFbgn1ttpA=-----END CERTIFICATE-----",
        verify: false
    },
    mspId: 'Org1MSP',
    walletID: 'admin',
    asLocalhost: true,
    ccp: ccp,
    chaincodeName: "trustID",
    fcn: "proxy",
    channel: "digitalzonenipanft"
}
async function configureNetwork() {
    console.log("[*] Configuring network driver...")
    // Create HF driver
    var trustID = new sdk.TrustIdHf(config);
    // Add and configure the network driver in our wallet.
    wal.addNetwork("hf", trustID);
    await wal.networks["hf"].configureDriver();

}

// Create you own DID key pair and register it in the TrustID platform.
async function createDID(){

/*
    // Generate key pair locally.
    const did = await wal.generateDID("RSA", "test", "test")
    console.log("[*] Generated DID: \n", did)
    await did.unlockAccount("test")

    // Register in the platform.
    await wal.networks.hf.createSelfIdentity(did)
    console.log("[*] Self identity registered")
    wal.setDefault(did)

    // Get the registered identity.
    let res = await wal.networks.hf.getIdentity(did, did.id)
    console.log("[*] Get registered identity\n", res)
*/

    // Existing DID
    const did_insert = "did:vtn:trustid:96a81a34b9ce0f000fa29ec64f72af90e5209b87d6550dbd79e3dc9fb5a851d7";
    const did = await wal.getDID(did_insert)
    console.log(did)

    // Restore DID
     const re_corgi = await did.restoreKey("dogdog","7070db2bbca16f36ea9d3f70c7bc035cc0728766c332fb7a8562201dde7a74d0");
     await did.unlockAccount("dogdog");
     console.log(re_corgi);
     await wal.updateDID(did);
	console.log("========== start create transaction ===========");
     await wal.networks.hf.createSelfIdentity(re_corgi);

}

// Interact with a service in the platform (you need to create a service before
// being able to call it).
async function serviceInteraction(){
	console.log("serviceinteraction1111111")
    const did = await wal.getDID("default")
    // Get service
	console.log("22")
	await wal.networks.hf.createService(did,"service_name","trustID",true,"digitalzone")
	console.log("22332233")
    let res = await wal.networks.hf.getService(did, "service_name")
	console.log("33")
    console.log("[*] Service info:\n", res)
    // Create an asset in the service
    const asset = {assetId: "test"+Date.now(), data:{"a":1, "b":2}, metadata: {"c": 4}}
	console.log("4444")
    const assetStr = JSON.stringify(asset)
	console.log("55")
	console.log(assetStr)
	console.log("66")
 	res =  await wal.networks.hf.invoke(did,"service_name",["createAsset", assetStr],"digitalzone")
    console.log("[*] Asset creation:\n", res)
	console.log("181818")
    // Get the created asset.
    res = await wal.networks.hf.invoke(did, "service_name",["getAsset", JSON.stringify({assetId: asset.assetId})], "digitalzonenipanft")
    console.log("[*] Asset registered\n", res)
}

// Use the wallet to make offchain interactions with your DID
async function walletInteraction(){
    const did = await wal.getDID("default")
    const payload = {hello: "AWESOME PROJECT!!!"}
    console.log("[*] Signing payload: \n", payload)
    const sign = await did.sign(payload)
    console.log("[*] DID signature\n", sign)
    let verify = await did.verify(sign, did)
    console.log("[*] Signature verification\n", verify)
    // const did2 = await wal.generateDID("RSA", "test", "test")
    // verify = await did.verify(sign, did2)
    // console.log("[*] Signature wrong verification\n", verify)
}

// Main async function.
async function main() {
	await configureNetwork()
	await createDID()
//	await serviceInteraction()
//await walletInteraction()
	exit(1);
}

main().then(() =>{} ).catch(console.log)
// tsc getting-started.ts && node getting-started.js
