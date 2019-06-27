"use strict;"
//RESOURCES
var cfg = require('../config.js');
var pixel = require("node-pixel");
var fs = require("fs");
var zlib = require("zlib");
//BOTS
var pbot = require('./pbot/pbot.js');
var fbot = require('./fbot/fbot.js');
var ebot = require('./ebot/ebot.js');
var xbot = require('./xbot/xbot.js'); //DEV ONLY

//CONNECT TO IRC
var tmi = require("tmi.js");
var options = {
	options: {
		debug: true,
		//clientId: "na for now"
	},
	connection: {
		cluster: "aws",
		reconnect: true
	},
	identity: { //Bot account
		username: cfg.twBotUsr,
		password: cfg.twBotKey
	},
	channels:  ["laboratory424", "#chatrooms:258148726:2bc7bf7b-7fe7-49e9-a6d7-43567491e167"]//Channel, bots room
	//The format is #chatrooms:<channel ID>:<room UUID>
	//You create a room on Twitch and then you need to find the channel ID and the room UUID
	//chat rooms: https://dev.twitch.tv/docs/irc/chat-rooms/
	//So once you make the room, replace its ID here: #chatrooms:258148726:<room UUID>
	//How to check where it came from:
	//channel === '#laboratory424', or channel === '#chatrooms:id:uuid'
	//Where id:uuid is the channel ID and room ID
};

var client = new tmi.client(options);
client.connect();
fbot.setTMIClient(client);//testing, pass off client to fbot so can talk.

//////////////////////////////////////////
client.on('connected', function (address, port) {
	client.action("laboratory424", "KB-23 Bot Commander Ready...");
});

//////////////////////////////////////////
client.on('chat', function (channel, user, message, self) {
	var bProcessed = false;

	if (!bProcessed) {
		bProcessed = processEvent(user, message);	//EVENTS
	}
	if (!bProcessed) {
		bProcessed = processUser(user, message);	//USER
	}
	if (!bProcessed) {
		bProcessed = processCommand(user, message);	//COMMANDS
	}
	if (!bProcessed) {
		bProcessed = ebot.processEmote(client, user, message);	//EMOTES
	}
});

//////////////////////////////////////////
client.on("subscription", (channel, username, method, message, userstate) => {
	var pic = "1e3s3e3s4e1s2f1s1e1s2f1s3e1s2f1s2f1s6e1s5f1s5e1s3f1s7e1s5f1s3e1s2f1s1f1s2f1s3e1s3f1s1f1s3f4s5f3s5e1s3f1s7e1s1f1s11e1s5e";
	var comm;

	comm = "!pb1d."+ pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb2d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb3d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb4d."+pic;
	pbot.processCommands(client,user,comm);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire5", true);
});

//////////////////////////////////////////
//TBD: Increase ball count by number of months
client.on("resub", (channel, username, months, message, userstate, methods) => {
	//let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
	var pic = "1e3s3e3s4e1s2f1s1e1s2f1s3e1s2f1s2f1s6e1s5f1s5e1s3f1s7e1s5f1s3e1s2f1s1f1s2f1s3e1s3f1s1f1s3f4s5f3s5e1s3f1s7e1s1f1s11e1s5e";
	var comm;

	comm = "!pb1d."+ pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb2d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb3d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb4d."+pic;
	pbot.processCommands(client,user,comm);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
	let senderCount = ~~userstate["msg-param-sender-count"];//add balls based on count.
	var pic = "1e3s3e3s4e1s2f1s1e1s2f1s3e1s2f1s2f1s6e1s5f1s5e1s3f1s7e1s5f1s3e1s2f1s1f1s2f1s3e1s3f1s1f1s3f4s5f3s5e1s3f1s7e1s1f1s11e1s5e";
	var comm;

	comm = "!pb1d."+ pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb2d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb3d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb4d."+pic;
	pbot.processCommands(client,user,comm);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
client.on("giftpaidupgrade", (channel, username, sender, userstate) => {
	var pic = "1e3s3e3s4e1s2f1s1e1s2f1s3e1s2f1s2f1s6e1s5f1s5e1s3f1s7e1s5f1s3e1s2f1s1f1s2f1s3e1s3f1s1f1s3f4s5f3s5e1s3f1s7e1s1f1s11e1s5e";
	var comm;

	comm = "!pb1d."+ pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb2d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb3d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb4d."+pic;
	pbot.processCommands(client,user,comm);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
client.on("anongiftpaidupgrade", (channel, username, userstate) => {
	var pic = "1e3s3e3s4e1s2f1s1e1s2f1s3e1s2f1s2f1s6e1s5f1s5e1s3f1s7e1s5f1s3e1s2f1s1f1s2f1s3e1s3f1s1f1s3f4s5f3s5e1s3f1s7e1s1f1s11e1s5e";
	var comm;

	comm = "!pb1d."+ pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb2d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb3d."+pic;
	pbot.processCommands(client,user,comm);
	comm = "!pb4d."+pic;
	pbot.processCommands(client,user,comm);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});
//////////////////////////////////////////
//TBD: Bits -> Bot function. Provide ability to direct contribution to bot function.
//Could be a command included in message when deployed, or (better) lab-bot asks
//them what to do (MC) based on amount.
client.on("cheer", (channel, userstate, message) => {
	var balls;
	var bits = Number(userstate.bits);
	var fireStr = "fire";
	
	if (bits >= 10 && bits < 20) {
		fbot.throwbbs();
		client.action("laboratory424", userstate['display-name'] + ", BBs deployed to make a mess for Jeff to clean!");
	} else {
		balls = Math.trunc(bits / 20);
		if (balls > 6) { balls = 6; }
		fireStr += balls;
		fbot.addToQue(client, userstate, fireStr, true);
		client.action("laboratory424", userstate['display-name'] + ", Ping Pong ball deployed to create chaos for Jeff!");
	}
});

//////////////////////////////////////////
client.on("hosted", (channel, username, viewers, autohost) => {
	//BBs
	fbot.throwbbs();
});

//////////////////////////////////////////
client.on("raided", (channel, username, viewers) => {
	var pic = "";
	var time = 500;

	if (viewers >= 10) {
		//BBs
		fbot.throwbbs();
		//Launcher
		fbot.addToQue(client, username, "fire6", true);
	} else {
		fbot.throwbbs();
	}
});

//////////////////////////////////////////
//Process an event in chat
//Follow and Tip handled via StreamElements user in Chat. Cheer and Sub handled above
function processEvent(user, message) {
	var time = 500;
	var bProcessed = false;
	var weaponSelect;

	if (user.username == "streamelements" && message.includes("following")) {
		weaponSelect = Math.floor(Math.random() * 2); //random number, 0 - 2
		if (weaponSelect == 0) { //Throw BBs
			fbot.throwbbs();
		} else if (weaponSelect == 1) { //Shoot a single ball on follow.
			fbot.addToQue(client, user, "fire1", true);
		}

		bProcessed = true;
	} else if (user.username == "streamelements" && message.includes("tipped")) {
		weaponSelect = Math.floor(Math.random() * 2); //random number, 0 - 2

		//Try to capture numerical amount for future bot rewards and triggers.
		var pos = message.search("$"); //loc of amount
		var amount;
		var substr;
		var subCharArray;
		if (pos > 0) {
			substr = message.substring(pos + 1, message.length - 1);
			subCharArray = substr.split(" ");
			amount = subCharArray[0];
			console.log("Tip Amount Captured: " + amount);
		}
		//client.action("laboratory424", "KB-23 captured Tip Event! Amount: " + amount);

		//Throw BBs
		fbot.throwbbs();
		//Launcher
		fbot.addToQue(client, user, "fire2", true);

		bProcessed = true;
	} else if (user.username == "streamelements" && message.includes("PPB01") && !message.includes('@')) {
		fbot.addToQue(client, user, "fire1", true);
	} else if (user.username == "streamelements" && message.includes("PPB03") && !message.includes('@')) {
		fbot.addToQue(client, user, "fire3", true);
	}

	return bProcessed;
}

//////////////////////////////////////////
//Do something special for users.
function processUser(user, message) {
	var bProcessed = false;

	if(cfg.specialUsrPPB.includes(user.username) && message.includes("fire")){
		fbot.addToQue(client, user, "fire4", true);
		bProcessed = true;
	}else if(cfg.specialUsrBBL.includes(user.username) && message.includes("throw")){
		fbot.throwbbs();
		bProcessed = true;
	}else if(cfg.adminUsr.includes(user.username) && message.includes("doit")){
		//fbot.throwbbs();
		var pic = "1e3s3e3s4e1s2f1s1e1s2f1s3e1s2f1s2f1s6e1s5f1s5e1s3f1s7e1s5f1s3e1s2f1s1f1s2f1s3e1s3f1s1f1s3f4s5f3s5e1s3f1s7e1s1f1s11e1s5e";
		var comm;

		comm = "!pb1d."+ pic;
		pbot.processCommands(client,user,comm);
		comm = "!pb2d."+pic;
		pbot.processCommands(client,user,comm);
		comm = "!pb3d."+pic;
		pbot.processCommands(client,user,comm);
		comm = "!pb4d."+pic;
		pbot.processCommands(client,user,comm);
		//fbot.addToQue(client, user, "fire2", true);
		bProcessed = true;
	}

	return bProcessed;
}

//////////////////////////////////////////
//Main Bot Control Commands
function processCommand(user, message) {
	var bProcessed = false;
	var i;
	var time = 1000;
	//TEMP: After pbot migration, change "commands = message.split(".",1)" for bo
	var commands = message.split(".", 145);
	var commStr = commands.slice().join(".");

	switch(commands[0]){
		case "!eb1":	
			commStr = commands.slice(1).join(".");//Temp, fix in ebot.js
			ebot.processCommands(client, user, commStr);
			break;
		case "!eb1a":
			client.action("laboratory424", user['display-name'] + ", !eb1a no longer supported. Use !eb1 instead.");
			break;
		case "!fb1":
			commStr = commands.slice(1).join(".");//temp, fix in fbot.js
			fbot.addToQue(client, user, commStr);
			break;
		case "!xb1":
		case "!xb1r":
		case "!xb1d":
		case "!xb1a":
		case "!xb1p":
		case "!xb1i":
		case "!xb1x":
			xbot.processCommands(commStr);
			break;
		case "!pb1":
		case "!pb1r":
		case "!pb1c":
		case "!pb1n"://Random pixel draw, !pb1n.[color][number of pix]
		case "!pbn":
		case "!pb1p"://Set panel color
		case "!pb1p":
		case "!pb2p":
		case "!pb3p":
		case "!pb4p":
		case "!pb1d"://Draw a picture
		case "!pb2d":
		case "!pb3d":
		case "!pb4d":
		case "!pbd":
		case "!pbdz":
		case "!pb1x"://Clear panel(s)
		case "!pb2x":
		case "!pb3x":
		case "!pb4x":
		case "!pbx":
		case "!pb1a"://Animation
		case "!pb2a":
		case "!pb3a":
		case "!pb4a":
		case "!pba":
		case "!pbaz":
			pbot.processCommands(client, user, commStr);
			break;
	}
	return bProcessed;
}
