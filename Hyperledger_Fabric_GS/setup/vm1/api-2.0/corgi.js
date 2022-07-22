const nodemailer = require('nodemailer')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function test () {


let transporter = nodemailer.createTransport({
    host: '// server ip 211.232.75.160',
    secure: false,
    port: 25,
    tls: {
	 servername: "mail.digitalzone.blockchain.kr"
    }
});

/*
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
   },
*/


//console.log(transporter);

let info = await transporter.sendMail({
    from: "test@main.digitalzone.blockchain.kr",
    to: 'kec@digitalzone.co.kr',
    subject: 'corgicorgi',
    text: 'cutecute\naaaaaa',
});

  console.log("Message sent: %s", info.messageId);


};

test().catch(console.error);;
