var express=require('express');
var bodyParser     = require('body-parser');
var app=express();
var methodOverride = require('method-override');
var port = 8080;
app.use(express.static(__dirname + '/packages/client')); 
app.use(express.static(__dirname + '/packages/client/assets/*'));
app.use(express.static(__dirname + '/node_modules'));	
app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(methodOverride('X-HTTP-Method-Override')); 		
app.listen(port,'10.20.3.125');  
	