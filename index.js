"use strict";

var fork = require('child_process').fork;

var pendingMsgs = {};

var search = require.resolve('./server');

var searchProcess = fork(search);

var msgId = 1;
function sendMsg(msg){
    var mid = msgId++;
    msg.mid = mid;
    var p = new Promise(function(resolve, reject){
        pendingMsgs[mid] = function(msg){
            if(msg.success === true){
                resolve(msg.result);
            }else{
                reject(msg.result);
            }
        };
        searchProcess.send(msg);
    });
    return p;
}

searchProcess.on('message',function(msg){
    if(msg.mid){
        var p = pendingMsgs[msg.mid];
        delete pendingMsgs[msg.mid];
        p && p(msg);
    }
})

exports.update = function(id, content){
    return sendMsg({
        action:'update',
        params:{
            id:id,
            content:content
        }
    })
}

exports.search = function(keywords, offset){
    return sendMsg({
        action:'search',
        params:{
            keywords:keywords,
            offset: offset
        }
    })
}
