'use strict';

const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const bodyParser = require('body-parser');
const http = require('http')
const util = require('util');
const express = require('express')
const app = express();
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const constants = require('./config/constants.json')
const request = require('request');

var querystring = require('querystring')

const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;


const helper = require('./app/helper')
const helper2 = require('./app/helper2')
const invoke = require('./app/invoke')
const qscc = require('./app/qscc')
const query = require('./app/query')

const fs = require("fs");

const { create, urlSource } = require('./ipfs-http-client')

const ipfs = create('http://localhost:5001')

const sdk = require("./trustid-sdk");
const wal = sdk.Wallet.Instance;
console.log(wal)

const ks = new sdk.FileKeystore("file", "./keystore");
wal.setKeystore(ks)
ks.loadKeystore("file","./keystore")

const config = {
    stateStore: '/tmp/statestore',
    caURL: 'https://peer0.org1.example.com:7054',
    caName: 'ca.org1.example.com',
    caAdmin: 'admin',
    caPassword: 'adminpw',
    tlsOptions: {
        trustedRoots: "-----BEGIN CERTIFICATE-----MIICFzCCAb2gAwIBAgIUCEVrm05983fEjN3lDmDRde6ASPAwCgYIKoZIzj0EAwIwaDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMtY2Etc2VydmVyMB4XDTIxMDYxMDA2MjAwMFoXDTM2MDYwNjA2MjAwMFowaDELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRkwFwYDVQQDExBmYWJyaWMtY2Etc2VydmVyMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEZV31xR+G0jlrq8F0EqiYmbArMC3OxzfLjJ3g8V+QC/sL25psRpid+o0X4AzDqG1b5VkuRtggvOIM8uMMQwr5t6NFMEMwDgYDVR0PAQH/BAQDAgEGMBIGA1UdEwEB/wQIMAYBAf8CAQEwHQYDVR0OBBYEFLN13/zFdtwCMEm/0ySsRL9vW8YHMAoGCCqGSM49BAMCA0gAMEUCIQCpG2GH+NkgS9n0FV+xHoHJYww96ENq6iN0QhoQRayLPwIgdprv9MHtjTUO3LLP9umXUcn4as3I8RdamlFbgn1ttpA=-----END CERTIFICATE-----",
        verify: false
    },
    mspId: 'Org1MSP',
    walletID: 'admin',
    asLocalhost: false,
    ccp:{
        "version": "1.0.0",
        "client": {
            "organization":"Org1",
            "logging": {
                "level": "debug"
            },
            "peer": {
                "timeout": {
                    "connection": "15s",
                    "response": "180s",
                    "discovery": {
                        "greylistExpiry": "10s"
                    }
                }
            },
            "orderer": {
                "timeout": {
                    "connection": "15s",
                    "response": "15s"
                }
            },
            "global": {
                "timeout": {
                    "query": "180s",
                    "execute": "180s",
                    "resmgmt": "180s"
                },
                "cache": {
                    "connectionIdle": "30s",
                    "eventServiceIdle": "2m",
                    "channelConfig": "30m",
                    "channelMembership": "30s",
                    "discovery": "10s",
                    "selection": "10m"
                }
            },
            "cryptoconfig": {
                "path": "/etc/hyperledger/vm1"
            },
            "credentialStore": {
                "path": "/etc/hyperledger/vm1/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp",
                "cryptoStore": {
                    "path": "/etc/hyperledger/vm1/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
                }
            },
            "BCCSP": {
                "security": {
                    "enabled": true,
                    "default": {
                        "provider": "SW"
                    },
                    "hashAlgorithm": "SHA2",
                    "softVerify": true,
                    "level": 256
                }
            },
            "tlsCerts": {
                "systemCertPool": false,
                "client": {
                    "key": {
                        "path": ""
                    },
                    "cert": {
                        "path": ""
                    }
                }
            }
        },
        "channels": {
            "digitalzonelowtech": {
                "peers": {
                    "peer0.org1.example.com": {
                        "endorsingPeer": true,
                        "chaincodeQuery": true,
                        "ledgerQuery": true,
                        "eventSource": true
                    }

                },
                "orderers": [
                    "orderer.example.com"
                ],
                "policies": {
                    "queryChannelConfig": {
                        "minResponses": 1,
                        "maxTargets": 1,
                        "retryOpts": {
                            "attempts": 5,
                            "initialBackoff": "500ms",
                            "maxBackoff": "5s",
                            "backoffFactor": 2.0
                        }
                    }
                }
            }
        },
        "organizations": {
            "Org1": {
                "mspid": "Org1MSP",
                "cryptoPath": "/etc/hyperledger/vm1/peerOrganizations/org1.example.com/msp",
                "peers": [
                    "peer0.org1.example.com"
                ],
                "certificateAuthorities": [
                    "ca.org1.example.com"
                ]
            },
            "ordererorg": {
                "mspID": "OrdererMSP",
                "cryptoPath": "/etc/hyperledger/vm4/ordererOrganizations/example.com/msp"
            }
        },
        "orderers": {
            "orderer.example.com": {
                "url": "grpcs://localhost:7050",
                "grpcOptions": {
                    "ssl-target-name-override": "orderer.example.com"
                },
                "tlsCACerts": {
                    "path": "/etc/hyperledger/vm4/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
                }
            },
            "orderer2.example.com": {
                "url": "grpcs://localhost:8050",
                "grpcOptions": {
                    "ssl-target-name-override": "orderer2.example.com"
                },
                "tlsCACerts": {
                    "path": "/etc/hyperledger/vm4/ordererOrganizations/example.com/orderers/orderer2.example.com/tls/ca.crt"
                }
            },
            "orderer3.example.com": {
                "url": "grpcs://localhost:9050",
                "grpcOptions": {
                    "ssl-target-name-override": "orderer3.example.com"
                },
                "tlsCACerts": {
                    "path": "/etc/hyperledger/vm4/ordererOrganizations/example.com/orderers/orderer3.example.com/tls/ca.crt"
                }
            }
        },


        "peers": {
            "peer0.org1.example.com": {
                "url": "grpcs://localhost:7051",
                "grpcOptions": {
                    "ssl-target-name-override": "peer0.org1.example.com"
                },
                "tlsCACerts": {
    		"path": "/etc/hyperledger/vm1/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
                }
            }
        },

        "certificateAuthorities": {
            "ca.org1.example.com": {
                "url": "https://localhost:7054",
                "tlsCACerts": {
                    "path": "/etc/hyperledger/vm1/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem"

                },
                "registrar": {
                    "enrollId": "org1admin",
                    "enrollSecret": "org1adminpw"
                },
                "caName": "ca.org1.example.com"
            }
        }
    }
,
    chaincodeName: "trustID",
    fcn: "proxy",
    channel: "digitalzonelowtech"
}

var trustID = new sdk.TrustIdHf(config);
wal.addNetwork("hf", trustID);
wal.networks["hf"].configureDriver();


/***************20211125 Verify 추가 및 수정************/
var CryptoJS = require("crypto-js")
var crypto = require("crypto")


/***************20220223 postgre delete 추가************/
const { Client }= require('pg')



/***************20220223 postgre delete 추가************/


/***************smtp************/
const nodemailer = require('nodemailer')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";



/***************file************/
const multer  = require('multer')
const stream = require('stream');
const urlencode = require('urlencode');
const BufferList = require('bl/BufferList')


//const randomnum = crypto.randomBytes(32).toString('hex');
var arr = new Array();
var nowdate = new Date();
//console.log(nowdate)
//console.log(typeof(nowdate))
//console.log(nowdate.toString());
//console.log("1 : " + Date.now());
//console.log("2 : " + nowdate.getTime());
nowdate.setFullYear(nowdate.getFullYear()+1);
//console.log(nowdate.toString());
//console.log(nowdate.getTime());
//console.log(Date.now())

async function interval_random(){
        var time_interval;
        //await invoke.invokeTransaction("digitalzonenipanft", "interval_random", "Interval_Random_Insert", arr,  "user_interval", "Org1");
        for(var i = 0; ; i++){
                  time_interval = (Math.floor(Math.random() * 9)+3)*10000;
                  arr[0] = "digitalzone";
                  arr[1] = Date.now();

                  await invoke.invokeTransaction("digitalzonenipanft", "interval_random", "Interval_Random_Insert", arr,  "user_interval", "Org1");
                  await sleep_interval(time_interval);
        }
}

interval_random()

async function interval_random_lowtech(){
        var time_interval;
       // await invoke.invokeTransaction("digitalzonenipanft", "interval_random", "Interval_Random_Insert", arr,  "user_interval", "Org1");
        for(var i = 0; ; i++){
                  time_interval = (Math.floor(Math.random() * 9)+3)*10000;
                  arr[0] = "digitalzone";
                  arr[1] = Date.now();

                  await invoke.invokeTransaction("digitalzonelowtech", "interval_random", "Interval_Random_Insert", arr,  "user_interval", "Org1");
                  await sleep_interval(time_interval);
        }
}

interval_random_lowtech()


async function register_view(){

let response = await helper.getRegisteredUser("viewer", "Org1", true);
logger.debug(response);

}


function sleep_interval(ms) {
  return new Promise((r) => setTimeout(r, ms));
}


app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.set('secret', 'thisismysecret');
app.use(expressJWT({
    secret: 'thisismysecret'
}).unless({
  path: ['/users','/NFT_Get', '/test','/API_Health_check','/upload','/download']
}));
app.use(bearerToken());

logger.level = 'debug';

app.use((req, res, next) => {
    logger.debug('New req for %s', req.originalUrl);
    if (req.originalUrl.indexOf('/users') >= 0||req.originalUrl.indexOf('/NFT_Get') >= 0 || req.originalUrl.indexOf('/test') >= 0 || req.originalUrl.indexOf('/API_Health_check') >= 0|| req.originalUrl.indexOf('/upload') >= 0 || req.originalUrl.indexOf('/download') >= 0) {
        return next();
    }
    var token = req.token;
    jwt.verify(token, app.get('secret'), (err, decoded) => {
        if (err) {
            console.log(`Error ================:${err}`)
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                    'token returned from /users call in the authorization header ' +
                    ' as a Bearer token'
            });
            return;
        } else {
            req.username = decoded.username;
            req.orgname = decoded.orgName;
            logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s', decoded.username, decoded.orgName));
            return next();
        }
    });
});

var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 24000;

register_view()

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

app.post('/users', async function (req, res) {
    var username = req.body.username;
    var orgName = "Org1";
    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    logger.debug('Org name  : ' + orgName);
    if (!username || !(username==='digitalzonenipanft')) {
        res.json(getErrorMessage('\'username\''));
        return;
    }

    if (username === 'digitalzonenipanft')
       username = username.concat(Date.now())

    var token = jwt.sign({
        username: username,
        orgName: orgName
    }, app.get('secret') ,{ expiresIn: '1h' });

    let response = await helper.getRegisteredUser(username, orgName, true);

    logger.debug('-- returned from registering the username %s for organization %s', username, orgName);
    if (response && typeof response !== 'string') {
        logger.debug('Successfully registered the username %s for organization %s', username, orgName);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the username %s for organization %s with::%s', username, orgName, response);
        res.json({ success: false, message: response });
    }

});


app.post('/NFT_Create', async function (req, res) {

	var file = req.body.file;
	var timestamp = req.body.timestamp;
	var minter = req.body.minter;
	var owner = req.body.owner;
	var uri = req.body.URI;
	var fcn = req.body.fcn;
	var title = req.body.title;
	var category = req.body.category;
	var nft_num = req.body.nft_num;

	var ipfsoptions = "2";
	console.log(uri)
	const file_insert = {
		content : file,
	}
	const result1 = await ipfs.add(file_insert, {digitalzone_nft_uri:uri,digitalzone_nft_minter:minter,digitalzone_nft_owner:owner,digitalzone_nft_timestamp:timestamp,digitalzone_nft_fcn:fcn,digitalzone_nft_title:title,digitalzone_nft_category:category,digitalzone_nft_num:nft_num,digitalzone_setting:ipfsoptions, chunker:'size-1024'})


	console.log("ipfs cid: ", result1);

	const response  = {
             success: "true",
             error: null
        }

	res.status(200).send(response)

});

app.post('/NFT_Get', async function (req, res) {

	var nft_id = req.body.nft_id;
	var arr = new Array();
	var args = new Array();
	var argt = new Array();
	var timestamp = req.body.timestamp;
	var fcn = 'Read_NFT';
	console.log(req.username)

	var cidcontent;

	var timestamp_Read_NFT = new Date().getTime();
	arr[0] = "Read_NFT_"+nft_id+"_"+timestamp_Read_NFT;
	arr[1] = timestamp;
	arr[2] = fcn;
	arr[3] = nft_id;

	args[0]= nft_id
	let message = await query.query("digitalzonenipanft", "save_ipfs_hash", args, "query_item", "viewer", "Org1");
	console.log("query_item_done")

	argt[0]= message.token_id
	let message_NFT = await query.query("digitalzonenipanft", "token_erc721", argt, "OwnerOf_cid", "viewer", "Org1");
	console.log("OwnerOf_cid_done")


	for await (const ipfscontent of ipfs.cat(message_NFT.toString())) {
 		cidcontent = ipfscontent.toString();
	}
	console.log("ipfs_cat_done")

	await invoke.invokeTransaction("digitalzonenipanft", "save_ipfs_hash", "Read_NFT", arr,"viewer" , "Org1");
	console.log("transaction_done")

	 const response  = {
             success: "true",
	     content: cidcontent,
             error: null
        }

        res.status(200).send(response).on('error', err => console.error(err))

});

app.post('/NFT_Burn', async function (req, res) {

  var nft_id = req.body.nft_id;
  var arr = new Array();
	var fcn = 'Burn_NFT';
	var timestamp = req.body.timestamp;

  arr[0] = nft_id;
  arr[1] = req.body.timestamp;
	arr[2] = fcn;
	arr[3] = "Burn_NFT"



	const client = new Client({
		user:'hppoc',
		host:'localhost',
		database:'fabricexplorer',
		password:'password',
		port:5432
	});

	const deleteUser = async(nft_id) => {
		try {
			await client.connect();
			await client.query('DELETE FROM transactions WHERE "nft_id"=$1',[nft_id]);
			await client.query('DELETE FROM transactions_nipanft WHERE "nft_id"=$1',[nft_id]);
			return true;
		}catch(error){
			console.error(error.stack);
			return false;
		}finally{
			await client.end();
		}
	};

	deleteUser(nft_id).then((result) => {
		if (result){
			console.log('nft delete');
		}
	});

	await invoke.invokeTransaction("digitalzonenipanft", "save_ipfs_hash", "Burn_NFT", arr, req.username , "Org1");

	const response  = {
             success: "true",
             error: null
        }

  	res.status(200).send(response)

});


app.post('/API_Health_check', async function (req, res) {


	var timestamp = new Date().getTime();

	const result1 = await ipfs.add("file_insert", {digitalzone_nft_timestamp:timestamp,digitalzone_nft_fcn:"health_check"})
	console.log("ipfs cid: ", result1);
	const response  = {
             success: "true",
             error: null
        }



	res.status(200).send(response)

});

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.post('/upload', upload.single('file'), async function (request,response) {


        console.log("-------------------------------------------------")
        console.log("start file upload");
        console.log("-------------------------------------------------")
        console.log(request.file);
        console.log("title : " + request.body.title);
        console.log(request.file.buffer);

        const file = {
                content: request.file.buffer
        }

        console.log("-------------------------------------------------")
        console.log("complete upload");
        console.log("start ipfs upload");
        console.log("-------------------------------------------------")
        const result = await ipfs.add(file)
        console.log(result)

        const response1  = {
                success: "true",
                ipfs_cid : result.path,
                error: null
        }

        response.send(response1)

        console.log("-------------------------------------------------")
        console.log("complete ipfs upload");



});

app.post('/download', async function (request,response) {


        var cid = request.body.cid;
        var title = request.body.title;

        console.log("-------------------------------------------------")
        console.log("start ipfs file download");
        console.log("-------------------------------------------------")
        for await (const file of ipfs.ls(cid)) {
                console.log(file)
        }


        const content = new BufferList()

        for await (const file of ipfs.cat(cid)) {
                content.append(file)
        }

        var buf = Buffer.concat(content._bufs);
        console.log(buf);

        console.log("-------------------------------------------------")
        console.log("complete ipfs file download");
        console.log("start response file download");
        console.log("-------------------------------------------------")

        //입력 받은 데이터를 다시 출력해주는 스트림
        var readStream = new stream.PassThrough();
        //console.log(readStream);
        readStream.end(buf);


        title = urlencode.encode(title, "UTF-8");
        //title = new String(title.getBytes("UTF-8"), "ISO-8859-1");
        response.set('Content-disposition', 'attachment; filename=' + title);
        response.set('Content-Type', 'image/jpeg');
        readStream.pipe(response);

        console.log("-------------------------------------------------")
        console.log("complete response file download");
        console.log("-------------------------------------------------")

});





app.get('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');

        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;
        let peer = req.query.peer;

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
        console.log('args==========', args);
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
        logger.debug(args);

        let message = await query.query(channelName, chaincodeName, args, fcn, req.username, req.orgname);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.get('/qscc/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');

        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;
        // let peer = req.query.peer;

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
        console.log('args==========', args);
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
        logger.debug(args);

        let response_payload = await qscc.qscc(channelName, chaincodeName, args, fcn, req.username, req.orgname);

        // const response_payload = {
        //     result: message,
        //     error: null,
        //     errorData: null
        // }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});



app.post('/Create_personal_DID', async function (req, res) {
  var ci = req.body.ci;
  if (!ci) {
      res.json(getErrorMessage('\'ci\''));
      return;
  }

  const did = await wal.generateDID("RSA", "controller", ci) //const did = await wal.generateDID("RSA", "controller", "passphrase")
  await did.unlockAccount(ci);
  const did_priv = did.privkey;
  const did_pub = did.pubkey;
  console.log(did);
  console.log(did_priv);
  console.log(did_pub);
  console.log("*********************************************************************")

  try{
	await wal.updatePassword(did.id,ci,did.id).catch(
        function (error) {
                console.log("wait");
        });
	await wal.networks.hf.createSelfIdentity(did);
	console.log("create");
  }catch(err){
    console.log("err : " + err);
  }

  const did_insert_split = did.id.split(":")
  console.log(did);
  console.log(did.privkey);
  console.log(did.pubkey);
  console.log(did.id)
  console.log("youngseok decrypto")

const decrypted = CryptoJS.AES.decrypt(did.privkey, CryptoJS.enc.Utf8.parse(did.id), {
    mode: CryptoJS.mode.ECB
});


  try{
  var did_privkey = CryptoJS.AES.decrypt(did.privkey,did.id).toString(CryptoJS.enc.Utf8);
  }catch(err){
	  console.log("err: " + err);
  }

  console.log(did_privkey)
  console.log("youngseokenddd")

  var encmsg = crypto.privateEncrypt(did_privkey, Buffer.from(did.id, 'utf8') ).toString('base64');

  console.log("Encrypted with private key : "+encmsg + '\n');


  let response = await helper2.getRegisteredUser(did_insert_split[3], "Org1", true);


  var token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
      username: did_insert_split[3],
      orgName: "Org1"
  }, app.get('secret'));







  if (response && typeof response !== 'string') {
      response.token = token;
      response.did = did.id;
      response.privkey = did_privkey;
      response.recoverykey = did.recoveryKey_digitalzone;
      response.expiredid = did.expireDid_digitalzone;
      res.json(response);
  } else {
      res.json({ success: false, message: response });
  }
});



/*
 *
 *	Keep DID &  Reset pubkey, privkey
 *
 */

app.post('/Restore', async function (req, res) {

  var didid = req.body.didid; // did
  var ci = req.body.ci; // new ci
  var recoverykey = req.body.rekey; // recovery key

  if (!didid) {
      res.json(getErrorMessage('\'didid\''));
      return;
  }

  const did = await wal.getDID(didid); // Call DID existing wallet
  console.log(did);
  try{
  	await did.restoreKey(ci, recoverykey); // Reset pubkey, privkey
  }catch(err){
      console.log("did.restoreKey error");
      res.json(getErrorMessage('\'error\''));
      return;
  }
  console.log(did);

  const did_insert_split = did.id.split(":");

  let response = await helper2.getRegisteredUser(did_insert_split[3], "Org1", true);

	console.log(response);


  if (response && typeof response !== 'string') {
      response.did = did.id;
      response.privkey = did.privkey;
      response.recoverykey = did.recoveryKey_digitalzone; // show digitalzone recovery key
      res.json(response);
  } else {
      res.json({ success: false, message: response });
  }


});

/*
 *
 *      DID encrypt with privatekey  -> check method with did wallet
 *
 */
app.post('/verify_1', async function (req, res) {

  var didid = req.body.didid; // did
  var encdid = req.body.encdid; // encrypt did
  var enctimestamp = req.body.enctimestamp;

  var arr = new Array();
  console.log(encdid);
  console.log(didid);
  console.log(enctimestamp);

  const did = await wal.getDID(didid);
  console.log(did);

  const did_pub = did.pubkey;

  console.log(did_pub)
  var decmsg = crypto.publicDecrypt(did_pub, Buffer.from(encdid,"base64")); // DID decrypt with did wallet pubkey
  console.log("Decrypted with public key : "+decmsg);


  var dectimestamp = crypto.publicDecrypt(did_pub, Buffer.from(enctimestamp,"base64")); // DID decrypt with did wallet pubkey
  console.log("Decrypted with public key : "+ dectimestamp);

  arr[0] = didid;
  arr[1] = dectimestamp;
  arr[2] = encdid;
  arr[3] = "null";
  arr[4] = "verify_1";

  if(didid != decmsg){ // If the two values are not equal, an error is returned
     res.json(getErrorMessage("error"));
     return;
  }

  await invoke2.invokeTransaction("digitalzonelowtech", "save_ipfs_hash2", "Verify_transaction", arr, "user_test", "Org1");

  const did_insert_split = did.id.split(":");

  let response = await helper2.getRegisteredUser(did_insert_split[3], "Org1", true);

  const tmp = "okay"; // if two values(decrypt encdid, diddid) are equal

  if (response && typeof response !== 'string') {
      response.check = tmp;
      res.json(response);
  } else {
      res.json({ success: false, message: response });
  }


});

/*
 *
 *      DID encrypt with privatekey  -> check method with received values
 *
 */
app.post('/verify_2', async function (req, res) {

  var didid = req.body.didid; // did
  var encdid = req.body.encdid; // encrypt did
  var pub = req.body.pub; // pubkey
  var enctimestamp = req.body.enctimestamp;
  var arr = new Array();

  console.log("did : " + didid + '\n');
  console.log("암호화did : " + encdid + '\n');
  console.log("공개키 : " + pub + '\n');

  const did = await wal.getDID(didid);
  console.log(did);

  var pub2 = stringtopem(pub); // Convert the value called in Android to pem format

  console.log(pub2);

  var decmsg = crypto.publicDecrypt(pub2, Buffer.from(encdid,"base64")); // Decrypt with converted pubkey
  console.log("Decrypted with public key : "+ decmsg);

  var dectimestamp = crypto.publicDecrypt(pub2, Buffer.from(enctimestamp,"base64")); // Decrypt with converted pubkey
  console.log("Decrypted with public key : "+ dectimestamp);

  arr[0] = didid;
  arr[1] = dectimestamp;
  arr[2] = encdid;
  arr[3] = pub;
  arr[4] = "verify_2";

 if(didid != decmsg){ // If the two values are not equal, an error is returned
     res.json(getErrorMessage("error"));
     return;
   }

  await invoke2.invokeTransaction("digitalzonelowtech", "save_ipfs_hash2", "Verify_transaction", arr, "user_test", "Org1");

  const did_insert_split = did.id.split(":");

  let response = await helper.getRegisteredUser(did_insert_split[3], "Org1", true);

  const tmp = "okay"; // if two values(decrypt encdid, diddid) are equal

  if (response && typeof response !== 'string') {
      response.did = decmsg.toString(); // show decrypt eccdid with pubkey
      response.check = tmp;
      res.json(response);
  } else {
      res.json({ success: false, message: response });
  }

});

/*
 *
 *      Convert string to pem
 *
 */
function stringtopem(key){

 var con1 = key.replace(/(.{64})/g,"$1\n")

 console.log(con1);

 var con2 = `-----BEGIN PUBLIC KEY-----\n` + con1 + `\n-----END PUBLIC KEY-----`;

 console.log(con2);

 return con2;

}
