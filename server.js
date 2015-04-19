var connect = require('connect')
var http = require('http')

var app = connect()

// respond to all requests 
app.use(function(req, res){
	res.end('Full text search!')
})
 
//create node.js http server and listen on port 
console.log("Server starting ...")
http.createServer(app).listen(9000)