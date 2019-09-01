/* Registration and Authentication Micro-Service */

//These should be global.

let sha256 = require('./sha256.js')
let express = require('express')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
let User = require('./userSchema.js')

let app = express()
let router = express.Router()
app.use(bodyParser.json({ type: 'application/json' }))
let options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}

//These should be located outside mongo-client connection.

function makeUser(userdata) {
    let promise = new Promise((resolve, reject) => {
        let newuser = new User({
            _id: new mongoose.Types.ObjectId(),
            username: userdata.username,
            name: userdata.name,
            email: userdata.email,
            password: userdata.password,
            secret: userdata.secret,
            organisation: userdata.organisation
        })
        newuser.save((err) => {
            if(err){
                console.log(err)
                reject()
            }
            let respbody = {
                'status' : 'successful',
                'dbid' : newuser._id
            }
            resolve(respbody)
        })
    })
    return promise
}

function cleanse(userdata){
    if(typeof userdata.username == 'undefined'){
        return false
    }
    if(typeof userdata.name == 'undefined' || userdata.name.length <= 7){
        return false
    }
    if(typeof userdata.organisation == 'undefined'){
        return false
    }
    if(typeof userdata.email == 'undefined' || userdata.email.indexOf('@') == -1 || userdata.email.indexOf('.') == -1){
        return false
    }
    if(typeof userdata.secret == 'undefined'){
        return false
    }
    if(typeof userdata.password == 'undefined' || userdata.password.length != 64){
        return false
    }
    return true
}

function checkExistence(userdata) {
    var username = userdata.username.toLowerCase();
    var k = {};
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = User.find({
            'username': username
        }, function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                k.status = true;
                resolve(k);
            } else {
                k.status = false;
                k.reason="Username already used."
                resolve(k);
            }
        });
    });
    return promiseforcheck;
}

function authUser(userdata) {
    var username = userdata.username.toLowerCase();
    var password = userdata.password+sha256(userdata.password);
    var k = {}
    var promiseforcheck = new Promise(function (resolve, reject) {
        var userrecord = User.find({
            'username': username,
            'password': password
        }, function (err, docs) {
            if (err || typeof docs[0] === 'undefined') {
                k.status = false
                k.reason = "Wrong Credentials."
                reject(k)
            } else {
                k.status = true
                k.id=docs[0]._id
                resolve(k);
            }
        });
    });
    return promiseforcheck
}

router.post('/auth/:uid',(req, res) => {
    let uid = req.params.uid
    if(uid!=req.body.username){
        res.statusCode=400
        res.end()
    }
    let exist = checkExistence(req.body)
    exist.then((k) => {
        if(!k.status){
            let prom = authUser(req.body)
            prom.then((respbody) => {
                res.json(respbody)
                res.statusCode=200
                res.end()
            }).catch((k) => {
                res.statusCode=400
                res.end()
            })
        }
        else{
            res.statusCode=404
            res.end()            
        }
    }).catch((k) => {
        res.statusCode=404
        res.json(k)
        res.end()
    })
})

router.post('/register',(req, res)=>{
    if(cleanse(req.body)){
        var preprom=checkExistence(req.body)
        preprom.then((k) => {
            if(k.status){
                let data={}
                data.name=req.body.name
                data.username=req.body.username
                data.email=req.body.email
                data.password=req.body.password+sha256(req.body.password)
                data.secret=sha256(req.body.secret)
                data.organisation=req.body.organisation
                let prom=makeUser(data)
                prom.then((respbody)=>{
                    res.json(respbody)
                    res.statusCode=201
                    res.end()
                })
                prom.catch(()=>{
                    res.statusCode=400
                    res.end()
                })
            }
            else{
                res.statusCode=403
                let x={'Reason':"Username already in use."}
                res.json(x)
                res.end()
            }
        })
        preprom.catch((k)=>{
            res.statusCode=403
            res.json(k)
            res.end()
        })
    }
    else{
        res.statusCode=400
        res.end()
    }
})

//This is the mongo-client part, replace the url according to the database. Also, replace the port with your own port number.

var url='mongodb://127.0.0.1:27017/collection-name'
var port=8080
mongoose.connect(url, options, function (err) {
    app.use('/',router)
    app.listen(port)
})

/*
"password" field is SHA256 hash of the actual password
Input for Registration:
To: /register
{
	"username":"utkarshgx",
	"name":"Utkarsh Gupta",
	"organisation":"Indian Institute of Technology, Kanpur",
	"email":"utkarshgx@gmail.com",
	"secret":"attitude",
	"password":"75aeece691efe421485670398fc322265e9357da149c969f04bb3196414bb5bb"
}
Input for Authentication:
To: /auth/<username>
{
	"username":"utkarshg",
	"password":"75aeece691efe421485670398fc322265e9357da149c969f04bb3196414bb5bb"
}
*/