let sha256 = require('./sha256.js')
let express = require('express')
let bodyParser = require('body-parser')
let mongoose = require('mongoose')
let getKey = require('./keygen.js')
let User = require('./userSchema.js')

let app = express()
let router = express.Router()
app.use(bodyParser.json({ type: 'application/json' }))
let options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
}

router.get('/keygen/:uid', (req, res) => {
    let u = getKey(req.params.uid)
    res.statusCode=200
    res.json({
        key:u
    });
    res.end()
})

mongoose.connect('mongodb://127.0.0.1:27017/geomapi', options, function (err) {
    app.use('/',router)
    app.listen(8080)
})
