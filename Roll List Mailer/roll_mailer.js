let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')
let axios = require('axios')
let cors = require('cors')
let nodemailer = require('nodemailer')

let rolllist="";
let content={};
let username="";
let password="";

let app = express()
app.use(cors())
let router = express.Router()
app.use(bodyParser.json({
    type: 'application/json'
}))

async function sendmail() {
    let transporter = nodemailer.createTransport({
        host: 'smtp.cc.iitk.ac.in',
        port: 25,
        secure: false, // true for 465, false for other ports
        auth: {
            user: username,
            pass: password
        }
    });
    let info = await transporter.sendMail({
        from: '"Utkarsh Gupta" <utkarshg@iitk.ac.in>', // sender address
        to: rolllist, // list of receivers, comma separated
        subject: content.subject,
        // text: content.text, // plain text body
        html: content.html // html body
    });
    console.log("Done!!!");
}

function tolist(roll){
    let x="";
    let retval="";
    for(var i=0; i<roll.length; i++){
        x=roll[i]+"@iitk.ac.in, ";
        retval+=x;
    }
    return retval;
}

router.post('/sendmassmail', (req, res) => {
    let data = req.body;
    if(data.key=='UtkarshMassMailer'){
        rolllist=tolist(data.list);
        username=data.user;
        password=data.pass;
        content=data.content;
        sendmail();
        res.statusCode=200;
        res.json({
            mailedto: rolllist,
            status: "Success"
        });
        res.end();
    }
    else{
        res.statusCode=400;
        res.json({
            status: "Wrong Key"
        });
        res.end();
    }
});

let port=8080;
app.use('/', router)
app.listen(port)

/*

POST-Request

{
    "key":"UtkarshMassMailer",
    "user": "<SMTP IITK USERNAME>",
    "pass": "<SMTP IITK PASSWORD>",
    "list": [list_of_rollnumbers_numerics_only],
    "content": {
        "subject": "<Subject>",
        "text": "<Text Content>",
        "html": "<HTML Content>"
    }
}

*/