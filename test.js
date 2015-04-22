"use strict";

/**
 *  Use mocha to test , install mocha fist : npm install -g mocha ,  then run : mocha test.js
 */
var expect = require('expect.js');
var assert = require("assert");
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
            search.update(4,'叫小明明天来找我'),
            search.update(5,'Sanduo，明天下午5点一起开会。地点在西溪园区'),
            search.update(6,'@三多，来开会')
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
        },function(reason){
        })

        search.search('晚饭').then(function (data) {
            expect(data).to.be.ok();
            expect(data.docs).to.be.an('array');
            expect(data.docs.length).to.be.ok();
        },function(reason){
        })

        search.search('三多').then(function (data) {
            assert.equal(6, data.docs[0]);
        },function(reason){
        })

        search.search('开会').then(function (data) {
            assert.equal(5, data.docs[0]);
            assert.equal(6, data.docs[1]);
        },function(reason){
        })

        search.search('Sanduo 开会').then(function (data) {
            assert.equal(5, data.docs[0]);
            done();
        },function(reason){
        })
    });
})