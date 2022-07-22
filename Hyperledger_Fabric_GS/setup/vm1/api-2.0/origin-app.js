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
const invoke = require('./app/invoke')
const qscc = require('./app/qscc')
const query = require('./app/query')

const fs = require("fs");

const { create, urlSource } = require('./ipfs-http-client')

const ipfs = create('http://211.232.75.182:5001')


/***************20211125 Verify 추가 및 수정************/
var CryptoJS = require("crypto-js")
var crypto = require("crypto")


/***************20220223 postgre delete 추가************/
const { Client }= require('pg')



/***************20220223 postgre delete 추가************/


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
	await invoke.invokeTransaction("digitalzonenipanft", "interval_random", "Interval_Random_Insert", arr,  "user_interval", "Org1");
	for(var i = 0; ; i++){
	          time_interval = (Math.floor(Math.random() * 10)+1)*1000;
		  arr[0] = "digitalzone";
		  arr[1] = Date.now();

	          await invoke.invokeTransaction("digitalzonenipanft", "interval_random", "Interval_Random_Insert", arr,  "user_interval", "Org1");
		  await sleep_interval(time_interval);
	}
}

//interval_random()



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
  path: ['/users','/NFT_Get','/NFT_Create']
}));
app.use(bearerToken());

logger.level = 'debug';

app.use((req, res, next) => {
    logger.debug('New req for %s', req.originalUrl);
    if (req.originalUrl.indexOf('/users') >= 0||req.originalUrl.indexOf('/NFT_Get') >= 0 || req.originalUrl.indexOf('/NFT_Create') >= 0 ) {
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
	var uri = req.body.URI;
	var fcn = req.body.fcn;
	var title = req.body.title;
	var category = req.body.category;
	var nft_num = req.body.nft_num;
	console.log(uri)
	const file_insert = {
		content : file,
	}
	const result1 = await ipfs.add(file_insert, {digitalzone_nft_uri:uri,digitalzone_nft_minter:minter,digitalzone_nft_timestamp:timestamp,digitalzone_nft_fcn:fcn,digitalzone_nft_title:title,digitalzone_nft_category:category,digitalzone_nft_num:nft_num, chunker:'size-1024'})


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
	console.log("Tlqkf")
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

        res.status(200).send(response)

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
		host:'211.232.75.182',
		database:'fabricexplorer',
		password:'password',
		port:5432
	});

	const deleteUser = async(nft_id) => {
		try {
			await client.connect();
			await client.query('DELETE FROM transactions WHERE "nft_id"=$1',[nft_id]);
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
