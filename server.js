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
	.use('SingleTokenizer')           // 词典识别	
	// .use('DictTokenizer')           // 词典识别
	// .use('ChsNameTokenizer')        // 人名识别，建议在词典识别之后

	// 优化模块
	.use('EmailOptimizer')          // 邮箱地址识别
	.use('ChsNameOptimizer')        // 人名识别优化
	// .use('DictOptimizer')           // 词典识别优化
	.use('DatetimeOptimizer')       // 日期时间识别优化

	// 字典文件
	// .loadDict('nodict.txt')           // 盘古词典
	// .loadDict('dict2.txt')          // 扩展词典（用于调整原盘古词典）
	// .loadDict('names.txt')          // 常见名词、人名
	.loadDict('wildcard.txt', 'WILDCARD', true)   // 通配符

app.use("/update", function(req, res){
	var query = url.parse(req.url, true).query;
	var dict = segment.doSegment(query.content);
	var words = ""
	for (i in dict) {
		words = words + " " + dict[i].w;
	}
	console.log(query.id, words);
	db.serialize(function() {
		db.run("CREATE VIRTUAL TABLE IF NOT EXISTS messages USING fts4(content TEXT, TOKENIZE SIMPLE)");
		var stmt = db.prepare("REPlACE INTO messages (docid, content) VALUES (?,?)");
		stmt.run(query.id, words);
		stmt.finalize();
	});
	res.end('OK');
})

app.use("/search", function(req, res){
	var query = url.parse(req.url, true).query;
	var offset   = parseInt(query.offset, 10);
	if (isNaN(offset)) {
		offset = 0;
	}
	var keywords = query.keywords;
	var quoted_keywords = "";
	var arr = keywords.split(/(\s+)/);
	for (i in arr) {
		if (arr[i].trim().length == 0) {
			continue;
		}
		var dict = segment.doSegment(arr[i]);
		if (dict.length > 1) {
			quoted_keywords +=' "'
			for (j in dict) {
				quoted_keywords += dict[j].w +" ";
			}
			quoted_keywords = quoted_keywords.trim()
			quoted_keywords +='"'
		} else {
			quoted_keywords += " "+ arr[i];
		}
	}
	var result = new Object();
	result.docs = [];
	var limit = " LIMIT 10 OFFSET " + offset;
	quoted_keywords = "'"+quoted_keywords.trim()+"'";	
	var sql = "SELECT docid FROM messages WHERE content MATCH " + quoted_keywords + limit;
	console.log(sql);
	db.each(sql, function(err, row) {		
		if (err) throw err;			
		result.docs.push(row.docid);
	}, function(err, num) {
		res.end(JSON.stringify(result));
	});	
})

app.use("/optimize", function(req, res){
	db.run("INSERT INTO messages(messages) VALUES('optimize');");
	res.end('OK');
})
 
//create node.js http server and listen on port 
console.log("Server starting ...");
http.createServer(app).listen(9000);