var mysql      = require('mysql')
    ,config = require('./config');
var connection = mysql.createConnection({
    host     : 'rdsuhj4j5g0829bpy484public.mysql.rds.aliyuncs.com',
    user     : 'fxft',
    password : 'fxft2014'
});
connection.connect();

var express = require('express');
var app = express();

app.get('/bs', function(req, res){
    var id = getID(req);
    //精确查询
    connection.query('select lat,lng from bs_location.m_bs where id = ' + id, function(err, rows, fields) {
        if (rows.length > 0) {
            rows[0].status = 200;
            res.send(rows[0]);
        }else{
            //范围查询
            var minId = mcc + addZero(mnc, 2) + addZero(lac, 5) + addZero(String(Number(cellid) - 5), 5);
            var maxId = mcc + addZero(mnc, 2) + addZero(lac, 5) + addZero(String(Number(cellid) + 5), 5);
            connection.query('select lat,lng from bs_location.m_bs where id > ' + minId + ' and id < ' + maxId, function(err, rows, fields) {
                if (rows.length > 0) {
                    rows[0].status = 200;
                    res.send(rows[0]);
                }else {
                    var result = {status: 404};
                    res.send(result);
                }
            });
        }
    });
});

app.get('update', function(req, res){
    var accessKey = req.query.accessKey;
    if(accessKey != 'fxft_bs_2015'){
        res.send({ error : 'Error AccessKey'});
        return;
    }
    var id = getID(req);
    var lng = req.query.lng, lat = req.query.lat;
    connection.query('update bs_location.m_bs set lng=' + lng + ' and ', function(err, rows, fields){

    });
});

function getID(req){
    var mcc = req.query.mcc;
    var mnc = req.query.mnc;
    var lac = req.query.lac;
    var cellid = req.query.cellid;
    if(cellid > 65535) {
        cellid = cellid % 65535;
        cellid = String(cellid);
    }
    //组合ID
    var id = mcc + addZero(mnc, 2) + addZero(lac, 5) + addZero(cellid, 5);
    return id;
}

app.listen(3000);

function addZero(str, length){
    return new Array(length - str.length + 1).join("0") + str;
}