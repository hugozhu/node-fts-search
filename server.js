var connect = require('connect');
var http 	= require('http');
var url  	= require('url');
var sqlite3 = require('sqlite3').verbose();
var db 		= new sqlite3.Database('./test.db');
var Segment = require('segment');

var app = connect();
var segment = new Segment();
segment
	// 识别模块
	// 强制分割类单词识别
	.use('URLTokenizer')            // URL识别
	.use('WildcardTokenizer')       // 通配符，必须在标点符号识别之前
	.use('PunctuationTokenizer')    // 标点符号识别
	.use('ForeignTokenizer')        // 外文字符、数字识别，必须在标点符号识别之后
	// 中文单词识别
	.use('DictTokenizer')           // 词典识别
	.use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

	// 优化模块
	.use('EmailOptimizer')          // 邮箱地址识别
	.use('ChsNameOptimizer')        // 人名识别优化
	.use('DictOptimizer')           // 词典识别优化
	.use('DatetimeOptimizer')       // 日期时间识别优化

	// 字典文件
	.loadDict('dict.txt')           // 盘古词典
	.loadDict('dict2.txt')          // 扩展词典（用于调整原盘古词典）
	.loadDict('names.txt')          // 常见名词、人名
	.loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符

app.use("/update", function(req, res){
	var query = url.parse(req.url, true).query;
	console.dir(query);
	db.serialize(function() {
		db.run("CREATE VIRTUAL TABLE IF NOT EXISTS messages USING fts4(content TEXT)");
		var stmt = db.prepare("REPlACE INTO messages (docid, content) VALUES (?,?)");
		stmt.run(query.id, query.content);
		stmt.finalize();
	});
	res.end('OK');
})

app.use("/search", function(req, res){
	console.dir(req)
	res.end('OK')
})

app.use("/optimize", function(req, res){
	db.run("INSERT INTO messages(messages) VALUES('optimize');");
	res.end('OK');
})
 
//create node.js http server and listen on port 
console.log("Server starting ...")
http.createServer(app).listen(9000)