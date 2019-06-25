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
	var pic = "1z3r3z3r4z1r2f1r1z1r2f1r3z1r2f1r2f1r6z1r5f1r5z1r3f1r7z1r5f1r3z1r2f1r1f1r2f1r3z1r3f1r1f1r3f4r5f3r5z1r3f1r7z1r1f1r11z1r5z";

	pbot.clearPanel();
	pbot.drawPicture(pic, 1);
	pbot.drawPicture(pic, 2);
	pbot.drawPicture(pic, 3);
	pbot.drawPicture(pic, 4);
	pbot.show(1);
	pbot.show(2);
	pbot.show(3);
	pbot.show(4);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
//TBD: Increase ball count by number of months
client.on("resub", (channel, username, months, message, userstate, methods) => {
	//let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
	var pic = "1z3r3z3r4z1r2f1r1z1r2f1r3z1r2f1r2f1r6z1r5f1r5z1r3f1r7z1r5f1r3z1r2f1r1f1r2f1r3z1r3f1r1f1r3f4r5f3r5z1r3f1r7z1r1f1r11z1r5z";

	pbot.clearPanel(1);
	pbot.clearPanel(2);
	pbot.clearPanel(3);
	pbot.clearPanel(4);
	pbot.drawPicture(pic, 1);
	pbot.drawPicture(pic, 2);
	pbot.drawPicture(pic, 3);
	pbot.drawPicture(pic, 4);
	pbot.show(1);
	pbot.show(2);
	pbot.show(3);
	pbot.show(4);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
	let senderCount = ~~userstate["msg-param-sender-count"];//add balls based on count.
	var pic = "1z3r3z3r4z1r2f1r1z1r2f1r3z1r2f1r2f1r6z1r5f1r5z1r3f1r7z1r5f1r3z1r2f1r1f1r2f1r3z1r3f1r1f1r3f4r5f3r5z1r3f1r7z1r1f1r11z1r5z";
	var time = 500;

	pbot.clearPanel(1);
	pbot.clearPanel(2);
	pbot.clearPanel(3);
	pbot.clearPanel(4);
	pbot.drawPicture(pic, 1);
	pbot.drawPicture(pic, 2);
	pbot.drawPicture(pic, 3);
	pbot.drawPicture(pic, 4);
	pbot.show(1);
	pbot.show(2);
	pbot.show(3);
	pbot.show(4);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
client.on("giftpaidupgrade", (channel, username, sender, userstate) => {
	var pic = "1z3r3z3r4z1r2f1r1z1r2f1r3z1r2f1r2f1r6z1r5f1r5z1r3f1r7z1r5f1r3z1r2f1r1f1r2f1r3z1r3f1r1f1r3f4r5f3r5z1r3f1r7z1r1f1r11z1r5z";

	pbot.clearPanel(1);
	pbot.clearPanel(2);
	pbot.clearPanel(3);
	pbot.clearPanel(4);
	pbot.drawPicture(pic, 1);
	pbot.drawPicture(pic, 2);
	pbot.drawPicture(pic, 3);
	pbot.drawPicture(pic, 4);
	pbot.show(1);
	pbot.show(2);
	pbot.show(3);
	pbot.show(4);

	//BBs
	fbot.throwbbs();

	//PPB Launcher
	fbot.addToQue(client, username, "fire3", true);
});

//////////////////////////////////////////
client.on("anongiftpaidupgrade", (channel, username, userstate) => {
	var pic = "1z3r3z3r4z1r2f1r1z1r2f1r3z1r2f1r2f1r6z1r5f1r5z1r3f1r7z1r5f1r3z1r2f1r1f1r2f1r3z1r3f1r1f1r3f4r5f3r5z1r3f1r7z1r1f1r11z1r5z";

	pbot.clearPanel(1);
	pbot.clearPanel(2);
	pbot.clearPanel(3);
	pbot.clearPanel(4);
	pbot.drawPicture(pic, 1);
	pbot.drawPicture(pic, 2);
	pbot.drawPicture(pic, 3);
	pbot.drawPicture(pic, 4);
	pbot.show(1);
	pbot.show(2);
	pbot.show(3);
	pbot.show(4);

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
		fbot.addToQue(client, user, "fire2", true);
		bProcessed = true;
	}

	return bProcessed;
}

//////////////////////////////////////////
//Main Bot Control Commands
//This needs to be converted to a case statement once pbot.processCommands()
//is implemented. like this:
/*switch(commands[0]){
	case "!eb1":
		ebot.processCommands();
	case "!fb1":
		fbot.addToQue();
	case "!pb1":
	case "!pb1r":
	so on..
		pbot.processCommands();
}*/
function processCommand(user, message) {
	var bProcessed = false;
	var command;
	var i;
	var time = 1000;
	var commands = message.split(".", 145);
	var pixelColor;

	//TBD: Convert to switch.	
	if (commands[0] === "!eb1") {
		var commStr = commands.slice(1).join(".");//TEMP: Later, change "commands = message.split(".",1)" for bot
		ebot.processCommands(client, user, commStr);
	} else if (commands[0] === "!eb1a") {
		client.action("laboratory424", user['display-name'] + ", !eb1a no longer supported. Use !eb1 instead.");
	} else if (commands[0] === "!fb1") {
		var commStr = commands.slice(1).join(".");//TEMP: Later, change "commands = message.split(".",1)" for bot
		fbot.addToQue(client, user, commStr);
	}else if (commands[0].startsWith("!xb1")) {
		var commStr = commands.slice().join(".");//TEMP: Later, change "commands = message.split(".",1)" for bot
		xbot.processCommands(commStr);
	}/*else if (commands[0] === "!xb1") {
		var commStr = commands.slice(1).join(".");//TEMP: Later, change "commands = message.split(".",1)" for bot
		xbot.processCommands(commStr);
	}*/else if (commands[0] === "!pb1") {
		var pixArr = [];
		var clrArr = [];

		//Load Array data
		for (var i = 1; i < commands.length; i++) {
			command = commands[i].split(/[a-z]+/);
			pixArr.push(command[1]);//add pixel
			command = commands[i].split(/[0-9]+/);
			clrArr.push(command[0]);//add color
		}
		//Set Pixels
		for (var j = 0; j < pixArr.length; j++) {
			if (!isNaN(pixArr[j]) && pixArr[j] >= 1 && pixArr[j] <= 144) {
				pbot.setPix(pbot.pbotHW.pbot1Strip.pixel(pixArr[j] - 1), clrArr[j]);
			}
		}
		pbot.show(1);
	} else if (commands[0] === "!pb1r") {
		for (var i = 1; i < commands.length; i++) {
			command = commands[i].split(/[a-z]+/);
			var row = command[1];
			command = commands[i].split(/[0-9]+/);
			pixelColor = command[0];
			pbot.setRow(row, pixelColor, pbot.pbotHW.pbot1Strip);
		}
		pbot.show(1);
	} else if (commands[0] === "!pb1c") {
		for (var i = 1; i < commands.length; i++) {
			command = commands[i].split(/[a-z]+/);
			var col = command[1];
			command = commands[i].split(/[0-9]+/);
			pixelColor = command[0];
			pbot.setCol(col, pixelColor, pbot.pbotHW.pbot1Strip);
		}
		pbot.show(1);
	} else if (commands[0] === "!pb1x") {
		pbot.clearPanel(1);
		setTimeout(function () { pbot.show(1); }, 500);
		//strip.show();
	} else if (commands[0] === "!pb1n") { //Random pixel draw, !pb1n.[color][number of pix]
		var numOfPix;
		var colorOfPix;
		var time = 0;

		command = commands[1].split(/[a-z]+/);
		numOfPix = command[1];//num of pixels to select
		command = commands[1].split(/[0-9]+/);
		colorOfPix = command[0];//add color

		if (!isNaN(numOfPix) && numOfPix >= 1 && numOfPix <= 144) {
			pbot.clearPanel(1);
			//Set Pixels
			for (var j = 1; j <= numOfPix; j++) {
				var curPix = Math.floor(Math.random() * 144);// 0-143
				var curColor = colorOfPix;
				pbot.animatePix(curPix, curColor, time += 300);
			}
		}
	} else if (commands[0] === "!pb1p") { //Set panel color, !pb1p.m
		var panelColor = commands[1];
		pbot.clearPanel(1);
		setTimeout(function () { pbot.pbotHW.pbot1Strip.color(pbot.getHexColor(panelColor)); pbot.show(1); }, 500);
	} else if (commands[0] === "!pb1d") { //Draw a picture
		var colors = commands[1];//RLE encoding representing picture

		if (pbot.isValidDrawMap(colors) != false) {
			pbot.clearPanel(1);
			setTimeout(function () { pbot.drawPicture(colors, 1); pbot.show(1); }, 500);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb1a") { //Draw animated picture from editor
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(1);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
				} else {
					pic = commands[i];
					pbot.gPBOT1PicArray.push(pic);
				}
			}
			loopFramesPB1(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb1st") { //Scroll Text
		/*var str = commands[1];//str to draw
		var time = 300;
		var curCol = 11;
		var pic;
		var curChar;
		var charIndex;
		var picFrames = 5 * str.length+8;//8 is temp until we get this working. Just to push it off the screen
					var approvedChars = new RegExp("^[0-9A-Za-z ]+$");

					if(approvedChars.test(str)){
				 clearPanel(1);
				 for(var i = 0; i < picFrames; i++){
							pic = pbot.generateFrame(str,i);//i represents index into str col data
							pbot.gPBOT1PicArray.push(pic);
				 }
				 loopFrames(pbot.gPBOT1PicArray,time);
				 }else{
			 client.action("laboratory424",user['display-name'] + ", Sorry, Bad character in text.");
		 }*/
		client.action("laboratory424", user['display-name'] + ", Sorry, scroll feature disabled for now.");
	} else if (commands[0] === "!pb2d") { //PIXELBOT 2
		var colors = commands[1];//RLE encoding representing picture

		if (pbot.isValidDrawMap(colors) != false) {
			pbot.clearPanel(2);
			setTimeout(function () { pbot.drawPicture(colors, 2); pbot.show(2); }, 500);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb2a") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(2);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
				} else {
					pic = commands[i];
					pbot.gPBOT2PicArray.push(pic);
				}
			}
			loopFramesPB2(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb2x") {
		pbot.clearPanel(2);
		setTimeout(function () { pbot.show(2); }, 500);
		//strip.show();
	} else if (commands[0] === "!pb2p") { //Set panel color, !pb1p.m
		var panelColor = commands[1];
		pbot.clearPanel(2);
		setTimeout(function () { pbot.pbotHW.pbot2Strip.color(pbot.getHexColor(panelColor)); pbot.show(2); }, 500);
	} else if (commands[0] === "!pb3d") { //PIXELBOT 2
		var colors = commands[1];//RLE encoding representing picture

		if (pbot.isValidDrawMap(colors) != false) {
			pbot.clearPanel(3);
			setTimeout(function () { pbot.drawPicture(colors, 3); pbot.show(3); }, 500);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb3a") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(3);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
				} else {
					pic = commands[i];
					pbot.gPBOT3PicArray.push(pic);
				}
			}
			loopFramesPB3(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb3x") {
		pbot.clearPanel(3);
		setTimeout(function () { pbot.show(3); }, 500);
		//strip.show();
	} else if (commands[0] === "!pb3p") { //Set panel color, !pb1p.m
		var panelColor = commands[1];
		pbot.clearPanel(3);
		setTimeout(function () { pbot.pbotHW.pbot3Strip.color(pbot.getHexColor(panelColor)); pbot.show(3); }, 500);
	} else if (commands[0] === "!pb4d") { //PIXELBOT 2
		var colors = commands[1];//RLE encoding representing picture

		if (pbot.isValidDrawMap(colors) != false) {
			pbot.clearPanel(4);
			setTimeout(function () { pbot.drawPicture(colors, 4); pbot.show(4); }, 500);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb4a") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(4);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
				} else {
					pic = commands[i];
					pbot.gPBOT4PicArray.push(pic);
				}
			}
			loopFramesPB4(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb4x") {
		pbot.clearPanel(4);
		setTimeout(function () { pbot.show(4); }, 500);
		//strip.show();
	} else if (commands[0] === "!pb4p") { //Set panel color, !pb1p.m
		var panelColor = commands[1];
		pbot.clearPanel(4);
		setTimeout(function () { pbot.pbotHW.pbot4Strip.color(pbot.getHexColor(panelColor)); pbot.show(4); }, 500);
	} else if (commands[0] === "!pbd") { //!pbd.pb1.pb2.pb3.pb4, !pbd.pb1..pb3
		var bDrawPB1 = false;
		var bDrawPB2 = false;
		var bDrawPB3 = false;
		var bDrawPB4 = false;

		var commLen = commands.length;
		//PB1
		if (commLen - 1 >= 1 && commands[1] !== '') {
			if (pbot.isValidDrawMap(commands[1]) == false) {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT1 cannot draw this. Bad syntax in drawing.");
			} else {
				bDrawPB1 = true;
			}
		}
		//PB2
		if (commLen - 1 >= 2 && commands[2] !== '') {
			if (pbot.isValidDrawMap(commands[2]) == false) {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT2 cannot draw this. Bad syntax in drawing.");
			} else {
				bDrawPB2 = true;
			}
		}
		//PB3
		if (commLen - 1 >= 3 && commands[3] !== '') {
			if (pbot.isValidDrawMap(commands[3]) == false) {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT3 cannot draw this. Bad syntax in drawing.");
			} else {
				bDrawPB3 = true;
			}
		}
		//PB4
		if (commLen - 1 >= 4 && commands[4] !== '') {
			if (pbot.isValidDrawMap(commands[4]) == false) {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT4 cannot draw this. Bad syntax in drawing.");
			} else {
				bDrawPB4 = true;
			}
		}
		pbot.clearAllPanels();
		if (bDrawPB1) {
			pbot.clearPanel(1);
			setTimeout(function () { pbot.drawPicture(commands[1], 1); pbot.show(1); }, 500);
		}
		if (bDrawPB2) {
			pbot.clearPanel(2);
			setTimeout(function () { pbot.drawPicture(commands[2], 2); pbot.show(2); }, 500);
		}
		if (bDrawPB3) {
			pbot.clearPanel(3);
			setTimeout(function () { pbot.drawPicture(commands[3], 3); pbot.show(3); }, 500);
		}
		if (bDrawPB4) {
			pbot.clearPanel(4);
			setTimeout(function () { pbot.drawPicture(commands[4], 4); pbot.show(4); }, 500);
		}
	} else if (commands[0] === "!pbx") {
		pbot.clearAllPanels();
		setTimeout(function () { pbot.show(1); }, 500);
		setTimeout(function () { pbot.show(2); }, 500);
		setTimeout(function () { pbot.show(3); }, 500);
		setTimeout(function () { pbot.show(4); }, 500);
	} else if (commands[0] === "!pba") {
		var pic = "";
		var time = 500;//Default
		var i;
		var panels;
		var bGoodDrawing = true;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearAllPanels();
			for (i = 1; i < commands.length; i += 4) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					i = 2;
					if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
				}
				if (i < commands.length) pbot.gPBOT1PicArray.push(commands[i]);
				if (i + 1 < commands.length) pbot.gPBOT2PicArray.push(commands[i + 1]);
				if (i + 2 < commands.length) pbot.gPBOT3PicArray.push(commands[i + 2]);
				if (i + 3 < commands.length) pbot.gPBOT4PicArray.push(commands[i + 3]);
			}
			loopAllFrames(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pbw") {
		//TBD: Write and append long animations/pics to server.
	} else if (commands[0] === "!pbr") {
		//TBD: Read saved long animations/pics from server.
	} else if (commands[0] === "!pbdz") {
		if (commands[1] != null) {

			var buffer = new Buffer(commands[1], 'base64');
			zlib.unzip(buffer, function (err, buffer) {
				if (!err) {
					//console.log(buffer.toString());
					var drawCommand = "!pbd." + buffer.toString();//Decoded & decompressed
					processCommand(user, drawCommand);
				}
				else {
					console.log("ERROR UNCOMPRESSING!");
				}
			});
		}
	} else if (commands[0] === "!pbaz") {
		var buffer = new Buffer(commands[1], 'base64');
		zlib.unzip(buffer, function (err, buffer) {
			if (!err) {
				//console.log(buffer.toString());
				var drawCommand = "!pba." + buffer.toString();//Decoded & decompressed
				//var drawCommand = "!pbax." + buffer.toString();//Decoded & decompressed
				processCommand(user, drawCommand);
			}
			else {
				console.log("ERROR UNCOMPRESSING!");
			}
		});
	} else if (commands[0] === "!pb1ax") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;
		var picArray = [];
		var picDiffArray = [];
		var pixMap;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(1);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					if (time < 300) { time = 300; }//TEMP, testing locking to 300ms
				} else {
					pixMap = pbot.rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = pbot.diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				pbot.gPBOT1PicArray.push(picDiffArray[j]); //put into array for processing
			}
			pbot.loopDiffFramesPB1(time);//Loop forever.
		}
	} else if (commands[0] === "!pb2ax") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;
		var picArray = [];
		var picDiffArray = [];
		var pixMap;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(2);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
				} else {
					pixMap = pbot.rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = pbot.diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				pbot.gPBOT2PicArray.push(picDiffArray[j]); //put into array for processing
			}
			loopDiffFramesPB2(time);//Loop forever.
		}
	} else if (commands[0] === "!pb3ax") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;
		var picArray = [];
		var picDiffArray = [];
		var pixMap;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(3);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
				} else {
					pixMap = pbot.rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = pbot.diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				pbot.gPBOT3PicArray.push(picDiffArray[j]); //put into array for processing
			}
			loopDiffFramesPB3(time);//Loop forever.
		}
	} else if (commands[0] === "!pb4ax") {
		var pic = "";
		var time = 500;//Default
		var i;
		var bGoodDrawing = true;
		var picArray = [];
		var picDiffArray = [];
		var pixMap;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearPanel(4);//restore if flag doesn't work below.
			//pbot.gClearPB4 = true;//Set flag to purge previous animation.
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
				} else {
					pixMap = pbot.rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = pbot.diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				pbot.gPBOT4PicArray.push(picDiffArray[j]); //put into array for processing
			}
			loopDiffFramesPB4(time);//Loop forever.
		}
	} else if (commands[0] === "!pbax") {
		var pic = "";
		var time = 500;//Default
		var i;
		var panels;
		var bGoodDrawing = true;
		var picArray1 = [];
		var picArray2 = [];
		var picArray3 = [];
		var picArray4 = [];
		var picDiffArray1 = [];
		var picDiffArray2 = [];
		var picDiffArray3 = [];
		var picDiffArray4 = [];
		var pixMap;

		//Let check all the data sent before we update display
		for (i = 1; i < commands.length; i++) {
			if (isNaN(commands[i])) {	//If time entered, skip validation.
				if (pbot.isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			pbot.clearAllPanels();
			for (i = 1; i < commands.length; i += 4) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					//if (time < 300) { time = 300; }//Temp, testing.
					i = 2;
				}

				if (i < commands.length) {
					pixMap = pbot.rleToPixPanel(commands[i]); //convert to pix map
					picArray1.push(pixMap);
				}
				if (i + 1 < commands.length) {
					pixMap = pbot.rleToPixPanel(commands[i + 1]); //convert to pix map
					picArray2.push(pixMap);
				}
				if (i + 2 < commands.length) {
					pixMap = pbot.rleToPixPanel(commands[i + 2]); //convert to pix map
					picArray3.push(pixMap);
				}
				if (i + 3 < commands.length) {
					pixMap = pbot.rleToPixPanel(commands[i + 3]); //convert to pix map
					picArray4.push(pixMap);
				}
			}
			//diff frames.
			picDiffArray1 = pbot.diffPanelFrames(picArray1);
			picDiffArray2 = pbot.diffPanelFrames(picArray2);
			picDiffArray3 = pbot.diffPanelFrames(picArray3);
			picDiffArray4 = pbot.diffPanelFrames(picArray4);
			//loop
			for (j = 0; j < picDiffArray1.length; j++) {
				pbot.gPBOT1PicArray.push(picDiffArray1[j]); //put into array for processing
				pbot.gPBOT2PicArray.push(picDiffArray2[j]); //put into array for processing
				pbot.gPBOT3PicArray.push(picDiffArray3[j]); //put into array for processing
				pbot.gPBOT4PicArray.push(picDiffArray4[j]); //put into array for processing
			}
			loopAllDiffFrames(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pbn") {
		var numOfPix;
		var colorOfPix;
		var time = 0;

		command = commands[1].split(/[a-z]+/);
		numOfPix = command[1];//num of pixels to select
		command = commands[1].split(/[0-9]+/);
		colorOfPix = command[0];//add color

		if (!isNaN(numOfPix) && numOfPix >= 1 && numOfPix <= 576) {
			//Set Pixels
			for (var j = 1; j <= numOfPix; j++) {
				var curPanel = Math.floor(Math.random() * 4);// 0-3
				var curPix = Math.floor(Math.random() * 144);// 0-143
				var curColor = colorOfPix;

				switch (curPanel) {
					case 0://PB1
						pbot.animateAllPanelPix(curPix, curColor, time += 200, pbot.pbotHW.pbot1Strip);
						break;
					case 1://PB2
						pbot.animateAllPanelPix(curPix, curColor, time += 200, pbot.pbotHW.pbot2Strip);
						break;
					case 2://PB3
						pbot.animateAllPanelPix(curPix, curColor, time += 200, pbot.pbotHW.pbot3Strip);
						break;
					case 3://PB4
						pbot.animateAllPanelPix(curPix, curColor, time += 200, pbot.pbotHW.pbot4Strip);
						break;

				}
			}
		}
	} else if (commands[0] === "!pb1f") { //draw saved drawing to panel.
		//Proto: To pull a saved drawing and display. Includes a credit to artist.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = pbot.getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			pbot.clearPanel(1);
			setTimeout(function () { pbot.drawPicture(strs[0], 1); pbot.show(1); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot1 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!pb2f") { //draw saved drawing to panel.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = pbot.getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			pbot.clearPanel(2);
			setTimeout(function () { pbot.drawPicture(strs[0], 2); pbot.show(2); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot2 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!pb3f") { //draw saved drawing to panel.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = pbot.getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			pbot.clearPanel(3);
			setTimeout(function () { pbot.drawPicture(strs[0], 3); pbot.show(3); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot3 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!pb4f") { //draw saved drawing to panel.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = pbot.getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			pbot.clearPanel(4);
			setTimeout(function () { pbot.drawPicture(strs[0], 4); pbot.show(4); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot4 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	}else if (commands[0] === "!zddt") {
		//if(commands[1] == "on"){lights.on();}
		//if(commands[1] == "off"){lights.off();}
	} else if (commands[0] === "!bs") {
		//Game to try once pbot code cleaned up.
		//pbs.chatIn(user, message);
	}

	return bProcessed;
}

/////////////////////////////////////////////////
/////////////////////////////////////////////////
/*
The functions below need to be moved into pbot.js. When I attempt this
I crash due to some issue with the way I'm declaring or scope of data
like gPBOT1IntervalPtr and gPBOT1PicArray as well as other exported
supporting functions.
*/

/////////////////////////////////////////////////////////
//loopFrames()
//	Takes an array of RLE picture commands and displayes them based on time. Loops forever.
//	TBD: Add param and associated command to only go through animation once. Useful for gaming/effects
/////////////////////////////////////////////////////////
function loopFramesPB1(time) {
	var i = 0;
	pbot.gPBOT1IntervalPtr = setInterval(function () {
		if (i == pbot.gPBOT1PicArray.length) {i = 0;}
		pbot.drawPicture(pbot.gPBOT1PicArray[i], 1);
		i++;
		pbot.show(1);
	}, time);
}

function loopFramesPB2(time) {
	var i = 0;
	pbot.gPBOT2IntervalPtr = setInterval(function () {
		if (i == pbot.gPBOT2PicArray.length) {i = 0;}
		pbot.drawPicture(pbot.gPBOT2PicArray[i], 2);
		i++;
		pbot.show(2);
	}, time);
}

function loopFramesPB3(time) {
	var i = 0;
	pbot.gPBOT3IntervalPtr = setInterval(function () {
		if (i == pbot.gPBOT3PicArray.length) {i = 0;}
		pbot.drawPicture(pbot.gPBOT3PicArray[i], 3);
		i++;
		pbot.show(3);
	}, time);
}

function loopFramesPB4(time) {
	var i = 0;
	pbot.gPBOT4IntervalPtr = setInterval(function () {
		if (i == pbot.gPBOT4PicArray.length) {i = 0;}
		pbot.drawPicture(pbot.gPBOT4PicArray[i], 4);
		i++;
		pbot.show(4);
	}, time);
}

function loopAllFrames(time) {
	//For now, using pbot4 ptr and array to set it up. Need to change later.
	var i = 0;
	pbot.gPBOT4IntervalPtr = setInterval(function () {
		if (i == pbot.gPBOT4PicArray.length) {
			i = 0;
		}
		pbot.drawPicture(pbot.gPBOT1PicArray[i], 1);
		pbot.drawPicture(pbot.gPBOT2PicArray[i], 2);
		pbot.drawPicture(pbot.gPBOT3PicArray[i], 3);
		pbot.drawPicture(pbot.gPBOT4PicArray[i], 4);
		i++;
		pbot.show(1);
		pbot.show(2);
		pbot.show(3);
		pbot.show(4);
	}, time);
}
