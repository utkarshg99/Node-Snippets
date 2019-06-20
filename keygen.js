var sha256=require('./sha256.js')
function getKey(s){
    var x=sha256(s)
    var y=sha256(x)
    return x+y
}
module.exports=getKey;