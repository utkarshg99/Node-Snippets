var mongoose = require('mongoose')
var getKey = require('./keygen.js')
var Schema = mongoose.Schema
var rtts = {
    type: String,
    required: true
}
var user = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: rtts,
    name: rtts,
    email: rtts,
    password: rtts,
    secret: rtts,
    organisation: rtts,
    created: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', user)