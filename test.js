"use strict";

/**
 *  Use mocha to test , install mocha fist : npm install -g mocha ,  then run : mocha test.js
 */


var expect = require('expect.js');
var search = require('./index');

describe('#update',function(){
    it('should return a promise object , and resolve as true',function(done){
        search.update(1,'你吃晚饭了吗?').then(function(data){
            console.log(data);
            expect(data).to.be(true);
            done();
        },function(){
        })
    })
})

describe('#query', function(){
    before(function(done){
        Promise.all([
            search.update(1,'你吃晚饭了吗?'),
            search.update(2,'明天上午十点开会'),
            search.update(3,'我明天休假哦'),
            search.update(4,'叫小明明天来找我')
        ]).then(function(){
            done();
        },function(){
            done();
        })
    })

    it('should return the result', function(done) {
        search.search('晚饭').then(function (data) {
            expect(data).to.be.ok();
            expect(data.docs).to.be.an('array');
            expect(data.docs.length).to.be.ok();
            done();
        },function(reason){
        })
    });
})