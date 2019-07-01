//Goal is to have only pbotHW and processCommands() exported. everything
//else is private. Been working on it but running into problems trying to
//carefully keep things working as I migrate to the final model. Migration
//requries temporarily keeping some data and functions exported which seems
//to cause scope issues.

//Certain functionality should be pushed into draw folder/file.
var fs = require("fs");
var zlib = require("zlib");
var pixel = require("node-pixel");
var five = require("johnny-five");
//Games
var game_ttt = require("./games/ttt.js");
var gameMode = "";

var ports = [
	{ id: "PBOT1", port: "COM6" },
	{ id: "PBOT3", port: "COM8" },
	{ id: "PBOT2", port: "COM9" },
	{ id: "PBOT4", port: "COM3" }
];

pbotHW = {
	pbot1Strip: null,
	pbot1Strip: null,
	pbot1Strip: null,
	pbot1Strip: null
};

new five.Boards(ports).on("ready", function () {
	console.log("PBOT Boards ready!");

	var curStripPtr;
	//PBOT1
	curStripPtr = new pixel.Strip({
		board: this.byId("PBOT1"),
		controller: "FIRMATA",
		strips: [{ pin: 5, length: 144 },],
		gamma: 2.8,
	});
	setStrip(curStripPtr, 1);
	curStripPtr.on("ready", function () {init(1);});
	
	//PBOT2
	curStripPtr = new pixel.Strip({
		board: this.byId("PBOT2"),
		controller: "FIRMATA",
		strips: [{ pin: 5, length: 144 },],
		gamma: 2.8,
	});
	setStrip(curStripPtr, 2);
	curStripPtr.on("ready", function () {init(2);});
	
	//PBOT3
	curStripPtr = new pixel.Strip({
		board: this.byId("PBOT3"),
		controller: "FIRMATA",
		strips: [{ pin: 5, length: 144 },],
		gamma: 2.8,
	});
	setStrip(curStripPtr, 3);
	curStripPtr.on("ready", function () {init(3);});
	
	//PBOT4
		curStripPtr = new pixel.Strip({
		board: this.byId("PBOT4"),
		controller: "FIRMATA",
		strips: [{ pin: 5, length: 144 },],
		gamma: 2.8,
	});
	setStrip(curStripPtr, 4);
	curStripPtr.on("ready", function () {init(4);});
});

gPBOT1IntervalPtr = null;
gPBOT1PicArray = new Array();
gPBOT2IntervalPtr = null;
gPBOT2PicArray = new Array();
gPBOT3IntervalPtr = null;
gPBOT3PicArray = new Array();
gPBOT4IntervalPtr = null;
gPBOT4PicArray = new Array();

function setStrip(stripObj, stripID){
	switch(stripID){
		case 1:
			pbotHW.pbot1Strip = stripObj;
			break;
		case 2:
			pbotHW.pbot2Strip = stripObj;
			break;
		case 3:
			pbotHW.pbot3Strip = stripObj;
			break;
		case 4:
			pbotHW.pbot4Strip = stripObj;
			break;
	}
}

function getStrip(stripID){
	var stripObj;

	switch(stripID){
		case 1:
				stripObj = pbotHW.pbot1Strip;
			break;
		case 2:
				stripObj = pbotHW.pbot2Strip;
			break;
		case 3:
				stripObj = pbotHW.pbot3Strip;
			break;
		case 4:
				stripObj = pbotHW.pbot4Strip;
			break;
	}

	return stripObj;
}

///////////////////////////////////////////
function init(pBotID){
	var color = '#6441a5'; //For now, just show a color to validate functional.
	switch(pBotID){
		case 1:
			pbotHW.pbot1Strip.color(color);
			pbotHW.pbot1Strip.show();
			break;
		case 2:
			pbotHW.pbot2Strip.color(color);
			pbotHW.pbot2Strip.show();
			break;
		case 3:
			pbotHW.pbot3Strip.color(color);
			pbotHW.pbot3Strip.show();
			break;
		case 4:
			pbotHW.pbot4Strip.color(color);
			pbotHW.pbot4Strip.show();
			break;
	}
}
/////////////////////////////////////////////////
function processCommands(client, user, commStr){
	var bProcessed = false;
	var command;
	var i;
	var time = 1000;
	var commands = commStr.split(".", 145);
	var pixelColor;

	//Game mode, map to active game or reset
	if(gameMode !=  ''){
		if (commands[0] == "!pbgx"){
			//console.log("IN PBGX: ");
			gameMode =  ''; //clear game
			commands[0] = "!pbx";//TEMP, should be a game over screen handled by game.
		}else{
			commands[0] = "!pbg."+gameMode;
		}
		commStr = commands.slice().join(".");
		commands = commStr.split(".", 3);
	}

	switch(commands[0]){
		case "!pb1":
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
					setPix(pbotHW.pbot1Strip.pixel(pixArr[j] - 1), clrArr[j]);
				}
			}
			show(1);
			break;
		case "!pb1r":
			for (var i = 1; i < commands.length; i++) {
				command = commands[i].split(/[a-z]+/);
				var row = command[1];
				command = commands[i].split(/[0-9]+/);
				pixelColor = command[0];
				setRow(row, pixelColor, pbotHW.pbot1Strip);
			}
			show(1);
			break;
		case "!pb1c":
			for (var i = 1; i < commands.length; i++) {
				command = commands[i].split(/[a-z]+/);
				var col = command[1];
				command = commands[i].split(/[0-9]+/);
				pixelColor = command[0];
				setCol(col, pixelColor, pbotHW.pbot1Strip);
			}
			show(1);
			break;
		case "!pb1x":
			clearPanel(1);
			setTimeout(function () { show(1); }, 500);
			break;
		case "!pb2x":
			clearPanel(2);
			setTimeout(function () { show(2); }, 500);
			break;
		case "!pb3x":
			clearPanel(3);
			setTimeout(function () { show(3); }, 500);
			break;
		case "!pb4x":
			clearPanel(4);
			setTimeout(function () { show(4); }, 500);
			break;
		case "!pbx":
			clearAllPanels();
			setTimeout(function () { show(1); }, 500);
			setTimeout(function () { show(2); }, 500);
			setTimeout(function () { show(3); }, 500);
			setTimeout(function () { show(4); }, 500);
			break;
		case "!pb1n":
			var numOfPix;
			var colorOfPix;
			var time = 0;
	
			command = commands[1].split(/[a-z]+/);
			numOfPix = command[1];//num of pixels to select
			command = commands[1].split(/[0-9]+/);
			colorOfPix = command[0];//add color
	
			if (!isNaN(numOfPix) && numOfPix >= 1 && numOfPix <= 144) {
				clearPanel(1);
				//Set Pixels
				for (var j = 1; j <= numOfPix; j++) {
					var curPix = Math.floor(Math.random() * 144);// 0-143
					var curColor = colorOfPix;
					animatePix(curPix, curColor, time += 300);
				}
			}
			break;
		case "!pbn":
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
							animateAllPanelPix(curPix, curColor, time += 200, pbotHW.pbot1Strip);
							break;
						case 1://PB2
							animateAllPanelPix(curPix, curColor, time += 200, pbotHW.pbot2Strip);
							break;
						case 2://PB3
							animateAllPanelPix(curPix, curColor, time += 200, pbotHW.pbot3Strip);
							break;
						case 3://PB4
							animateAllPanelPix(curPix, curColor, time += 200, pbotHW.pbot4Strip);
							break;
	
					}
				}
			}
			break;
		case "!pb1p":
			var panelColor = commands[1];
			clearPanel(1);
			setTimeout(function () { pbotHW.pbot1Strip.color(getHexColor(panelColor)); show(1); }, 500);
			break;
		case "!pb2p":
			var panelColor = commands[1];
			clearPanel(2);
			setTimeout(function () { pbotHW.pbot2Strip.color(getHexColor(panelColor)); show(2); }, 500);
			break;
		case "!pb3p":
			var panelColor = commands[1];
			clearPanel(3);
			setTimeout(function () { pbotHW.pbot3Strip.color(getHexColor(panelColor)); show(3); }, 500);
			break;
		case "!pb4p":
			var panelColor = commands[1];
			clearPanel(4);
			setTimeout(function () { pbotHW.pbot4Strip.color(getHexColor(panelColor)); show(4); }, 500);
			break;
		case "!pb1d":
			var colors = commands[1];//RLE encoding representing picture

			if (isValidDrawMap(colors) != false) {
				clearPanel(1);
				setTimeout(function () { drawPicture(colors, 1); show(1); }, 500);
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT1 cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pb2d":
			var colors = commands[1];//RLE encoding representing picture

			if (isValidDrawMap(colors) != false) {
				clearPanel(2);
				setTimeout(function () { drawPicture(colors, 2); show(2); }, 500);
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT2 cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pb3d":
			var colors = commands[1];//RLE encoding representing picture

			if (isValidDrawMap(colors) != false) {
				clearPanel(3);
				setTimeout(function () { drawPicture(colors, 3); show(3); }, 500);
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT3 cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pb4d":
			var colors = commands[1];//RLE encoding representing picture

			if (isValidDrawMap(colors) != false) {
				clearPanel(4);
				setTimeout(function () { drawPicture(colors, 4); show(4); }, 500);
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT4 cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pbd":
			var bDrawPB1 = false;
			var bDrawPB2 = false;
			var bDrawPB3 = false;
			var bDrawPB4 = false;
	
			var commLen = commands.length;
			//PB1
			if (commLen - 1 >= 1 && commands[1] !== '') {
				if (isValidDrawMap(commands[1]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT1 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB1 = true;
				}
			}
			//PB2
			if (commLen - 1 >= 2 && commands[2] !== '') {
				if (isValidDrawMap(commands[2]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT2 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB2 = true;
				}
			}
			//PB3
			if (commLen - 1 >= 3 && commands[3] !== '') {
				if (isValidDrawMap(commands[3]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT3 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB3 = true;
				}
			}
			//PB4
			if (commLen - 1 >= 4 && commands[4] !== '') {
				if (isValidDrawMap(commands[4]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT4 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB4 = true;
				}
			}
			clearAllPanels();
			if (bDrawPB1) {
				clearPanel(1);
				setTimeout(function () { drawPicture(commands[1], 1); show(1); }, 500);
			}
			if (bDrawPB2) {
				clearPanel(2);
				setTimeout(function () { drawPicture(commands[2], 2); show(2); }, 500);
			}
			if (bDrawPB3) {
				clearPanel(3);
				setTimeout(function () { drawPicture(commands[3], 3); show(3); }, 500);
			}
			if (bDrawPB4) {
				clearPanel(4);
				setTimeout(function () { drawPicture(commands[4], 4); show(4); }, 500);
			}
			break;
		case "!pbdz":
			if (commands[1] != null) {

				var buffer = new Buffer(commands[1], 'base64');
				zlib.unzip(buffer, function (err, buffer) {
					if (!err) {
						var drawCommand = "!pbd." + buffer.toString();//Decoded & decompressed
						processCommands(client, user, drawCommand);
					}
					else {
						console.log("ERROR UNCOMPRESSING!");
					}
				});
			}
			break;
		case "!pbdt":
			var bDrawPB1 = false;
			var bDrawPB2 = false;
			var bDrawPB3 = false;
			var bDrawPB4 = false;
	
			var commLen = commands.length;
			//PB1
			if (commLen - 1 >= 1 && commands[1] !== '') {
				if (isValidDrawMap(commands[1]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT1 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB1 = true;
				}
			}
			//PB2
			if (commLen - 1 >= 2 && commands[2] !== '') {
				if (isValidDrawMap(commands[2]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT2 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB2 = true;
				}
			}
			//PB3
			if (commLen - 1 >= 3 && commands[3] !== '') {
				if (isValidDrawMap(commands[3]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT3 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB3 = true;
				}
			}
			//PB4
			if (commLen - 1 >= 4 && commands[4] !== '') {
				if (isValidDrawMap(commands[4]) == false) {
					client.action("laboratory424", user['display-name'] + ", Sorry, PBOT4 cannot draw this. Bad syntax in drawing.");
				} else {
					bDrawPB4 = true;
				}
			}
			if (bDrawPB1) {
				setTimeout(function () { drawPicTrans(commands[1], 1); show(1); }, 500);
			}
			if (bDrawPB2) {
				setTimeout(function () { drawPicTrans(commands[2], 2); show(2); }, 500);
			}
			if (bDrawPB3) {
				setTimeout(function () { drawPicTrans(commands[3], 3); show(3); }, 500);
			}
			if (bDrawPB4) {
				setTimeout(function () { drawPicTrans(commands[4], 4); show(4); }, 500);
			}
			break;
		case "!pb1a":
			var pic = "";
			var time = 500;//Default
			var i;
			var bGoodDrawing = true;
	
			//Let check all the data sent before we update display
			for (i = 1; i < commands.length; i++) {
				if (isNaN(commands[i])) {	//If time entered, skip validation.
					if (isValidDrawMap(commands[i]) == false) {
						bGoodDrawing = false;
						break;
					}
				}
			}
	
			if (bGoodDrawing == true) {
				clearPanel(1);
				for (i = 1; i < commands.length; i++) {
					if (!isNaN(commands[i])) { //Did they submit a time?
						time = commands[i];
						if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
					} else {
						pic = commands[i];
						gPBOT1PicArray.push(pic);
					}
				}
				loopFramesPB1(time);//Loop forever.
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pb2a":
			var pic = "";
			var time = 500;//Default
			var i;
			var bGoodDrawing = true;
	
			//Let check all the data sent before we update display
			for (i = 1; i < commands.length; i++) {
				if (isNaN(commands[i])) {	//If time entered, skip validation.
					if (isValidDrawMap(commands[i]) == false) {
						bGoodDrawing = false;
						break;
					}
				}
			}
	
			if (bGoodDrawing == true) {
				clearPanel(2);
				for (i = 1; i < commands.length; i++) {
					if (!isNaN(commands[i])) { //Did they submit a time?
						time = commands[i];
						if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
					} else {
						pic = commands[i];
						gPBOT2PicArray.push(pic);
					}
				}
				loopFramesPB2(time);//Loop forever.
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pb3a":
			var pic = "";
			var time = 500;//Default
			var i;
			var bGoodDrawing = true;
	
			//Let check all the data sent before we update display
			for (i = 1; i < commands.length; i++) {
				if (isNaN(commands[i])) {	//If time entered, skip validation.
					if (isValidDrawMap(commands[i]) == false) {
						bGoodDrawing = false;
						break;
					}
				}
			}
	
			if (bGoodDrawing == true) {
				clearPanel(3);
				for (i = 1; i < commands.length; i++) {
					if (!isNaN(commands[i])) { //Did they submit a time?
						time = commands[i];
						if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
					} else {
						pic = commands[i];
						gPBOT3PicArray.push(pic);
					}
				}
				loopFramesPB3(time);//Loop forever.
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pb4a":
			var pic = "";
			var time = 500;//Default
			var i;
			var bGoodDrawing = true;
	
			//Let check all the data sent before we update display
			for (i = 1; i < commands.length; i++) {
				if (isNaN(commands[i])) {	//If time entered, skip validation.
					if (isValidDrawMap(commands[i]) == false) {
						bGoodDrawing = false;
						break;
					}
				}
			}
	
			if (bGoodDrawing == true) {
				clearPanel(4);
				for (i = 1; i < commands.length; i++) {
					if (!isNaN(commands[i])) { //Did they submit a time?
						time = commands[i];
						if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
					} else {
						pic = commands[i];
						gPBOT4PicArray.push(pic);
					}
				}
				loopFramesPB4(time);//Loop forever.
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pba":
			var pic = "";
			var time = 500;//Default
			var i;
			var panels;
			var bGoodDrawing = true;
	
			//Let check all the data sent before we update display
			for (i = 1; i < commands.length; i++) {
				if (isNaN(commands[i])) {	//If time entered, skip validation.
					if (isValidDrawMap(commands[i]) == false) {
						bGoodDrawing = false;
						break;
					}
				}
			}
	
			if (bGoodDrawing == true) {
				clearAllPanels();
				for (i = 1; i < commands.length; i += 4) {
					if (!isNaN(commands[i])) { //Did they submit a time?
						time = commands[i];
						i = 2;
						if (time < 300) { time = 300; }//Until we resolve time-collision issue, force a min of 300ms.
					}
					if (i < commands.length) gPBOT1PicArray.push(commands[i]);
					if (i + 1 < commands.length) gPBOT2PicArray.push(commands[i + 1]);
					if (i + 2 < commands.length) gPBOT3PicArray.push(commands[i + 2]);
					if (i + 3 < commands.length) gPBOT4PicArray.push(commands[i + 3]);
				}
				loopAllFrames(time);//Loop forever.
			} else {
				client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
			}
			break;
		case "!pbaz":
			var buffer = new Buffer(commands[1], 'base64');
			zlib.unzip(buffer, function (err, buffer) {
				if (!err) {
					var drawCommand = "!pba." + buffer.toString();//Decoded & decompressed
					//var drawCommand = "!pbax." + buffer.toString();//Decoded & decompressed
					processCommands(client, user, drawCommand);
				}
				else {
					console.log("ERROR UNCOMPRESSING!");
				}
			});
			break;
		case "!pb1st": //Disabled for now. Doesn't work. Should map to all bots: !pbst
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
								pic = generateFrame(str,i);//i represents index into str col data
								gPBOT1PicArray.push(pic);
					}
					loopFrames(gPBOT1PicArray,time);
					}else{
				client.action("laboratory424",user['display-name'] + ", Sorry, Bad character in text.");
			}*/
			client.action("laboratory424", user['display-name'] + ", Sorry, scroll feature disabled for now.");
			break;
		case "!pbw"://TBD: Write and append long animations/pics to server.
			break;
		case "!pbr"://TBD: Read saved long animations/pics from server.
			break;
		case "!pbg":
			switch(commands[1]){
				case "pbs": //Pixel Battleship
					//console.log("PIXEL BATTLESHIP: ");
					//pbs.chatIn(user, "!bs.play");//TBD: pass in client?
					break;
				case "ttt": //TicTacToe
					//Set game mode to route messages
					if (gameMode == ""){
						gameMode = 'ttt';
						game_ttt.init();
					}else if(commands[2] != null){
						game_ttt.ProcessCommand(commands[2]);
					}
					break;
			}
			break;
	}
}
////////////////////////////////////////////////////////////
//Game messaging function
function gameCommand(commStr){
	//var bProcessed = false;
	var command;
	var i;
	//var time = 1000;
	var commands = commStr.split(".", 145);
	//var pixelColor;

	switch(commands[0]){
		case "draw": //Draw to entire pbot, clears previous panel
			clearAllPanels();
			setTimeout(function () { drawPicture(commands[1], 1); show(1); }, 500);
			setTimeout(function () { drawPicture(commands[2], 2); show(2); }, 500);
			setTimeout(function () { drawPicture(commands[3], 3); show(3); }, 500);
			setTimeout(function () { drawPicture(commands[4], 4); show(4); }, 500);
			break;
		case "drawt": //Draw to entire pbot, clears previous panel
			setTimeout(function () { drawPicTrans(commands[1], 1); show(1); }, 500);
			setTimeout(function () { drawPicTrans(commands[2], 2); show(2); }, 500);
			setTimeout(function () { drawPicTrans(commands[3], 3); show(3); }, 500);
			setTimeout(function () { drawPicTrans(commands[4], 4); show(4); }, 500);
			break;
	}
}

	/////////////////////////////////////////////////////////////////////////////
	//Code below is for Frame differencing animation and displaying saved pictures.
	//Neither works at this time, so disabled and unmerged to js until we
	//stabilize the current code base.
	/*
	if (commands[0] === "!pb1ax") {
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
				if (isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			clearPanel(1);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					if (time < 300) { time = 300; }//TEMP, testing locking to 300ms
				} else {
					pixMap = rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				gPBOT1PicArray.push(picDiffArray[j]); //put into array for processing
			}
			loopDiffFramesPB1(time);//Loop forever.
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
				if (isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			clearPanel(2);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
				} else {
					pixMap = rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				gPBOT2PicArray.push(picDiffArray[j]); //put into array for processing
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
				if (isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			clearPanel(3);
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
				} else {
					pixMap = rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				gPBOT3PicArray.push(picDiffArray[j]); //put into array for processing
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
				if (isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			clearPanel(4);//restore if flag doesn't work below.
			//gClearPB4 = true;//Set flag to purge previous animation.
			for (i = 1; i < commands.length; i++) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
				} else {
					pixMap = rleToPixPanel(commands[i]); //convert to pix map
					picArray.push(pixMap); //put into array for processing
				}
			}
			//diff frames.
			picDiffArray = diffPanelFrames(picArray);
			//loop
			for (j = 0; j < picDiffArray.length; j++) {
				gPBOT4PicArray.push(picDiffArray[j]); //put into array for processing
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
				if (isValidDrawMap(commands[i]) == false) {
					bGoodDrawing = false;
					break;
				}
			}
		}

		if (bGoodDrawing == true) {
			clearAllPanels();
			for (i = 1; i < commands.length; i += 4) {
				if (!isNaN(commands[i])) { //Did they submit a time?
					time = commands[i];
					//if (time < 300) { time = 300; }//Temp, testing.
					i = 2;
				}

				if (i < commands.length) {
					pixMap = rleToPixPanel(commands[i]); //convert to pix map
					picArray1.push(pixMap);
				}
				if (i + 1 < commands.length) {
					pixMap = rleToPixPanel(commands[i + 1]); //convert to pix map
					picArray2.push(pixMap);
				}
				if (i + 2 < commands.length) {
					pixMap = rleToPixPanel(commands[i + 2]); //convert to pix map
					picArray3.push(pixMap);
				}
				if (i + 3 < commands.length) {
					pixMap = rleToPixPanel(commands[i + 3]); //convert to pix map
					picArray4.push(pixMap);
				}
			}
			//diff frames.
			picDiffArray1 = diffPanelFrames(picArray1);
			picDiffArray2 = diffPanelFrames(picArray2);
			picDiffArray3 = diffPanelFrames(picArray3);
			picDiffArray4 = diffPanelFrames(picArray4);
			//loop
			for (j = 0; j < picDiffArray1.length; j++) {
				gPBOT1PicArray.push(picDiffArray1[j]); //put into array for processing
				gPBOT2PicArray.push(picDiffArray2[j]); //put into array for processing
				gPBOT3PicArray.push(picDiffArray3[j]); //put into array for processing
				gPBOT4PicArray.push(picDiffArray4[j]); //put into array for processing
			}
			loopAllDiffFrames(time);//Loop forever.
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, PBOT cannot draw this. Bad syntax in drawing.");
		}
	} else if (commands[0] === "!pb1f") { //draw saved drawing to panel.
		//Proto: To pull a saved drawing and display. Includes a credit to artist.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			clearPanel(1);
			setTimeout(function () { drawPicture(strs[0], 1); show(1); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot1 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!pb2f") { //draw saved drawing to panel.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			clearPanel(2);
			setTimeout(function () { drawPicture(strs[0], 2); show(2); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot2 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!pb3f") { //draw saved drawing to panel.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			clearPanel(3);
			setTimeout(function () { drawPicture(strs[0], 3); show(3); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot3 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!pb4f") { //draw saved drawing to panel.
		var fileName = commands[1];
		var fileStr = "";

		fileStr = getSavedDrawing(fileName);
		if (fileStr !== '') {
			var strs = fileStr.split(".", 2);//0 is string, 1 is credit
			console.log("str: " + strs[0]);
			console.log("credit:" + strs[1]);
			clearPanel(4);
			setTimeout(function () { drawPicture(strs[0], 4); show(4); }, 500);
			client.action("laboratory424", "  CREDIT: " + fileName + " on PixelBot4 is by " + strs[1]);
		} else {
			client.action("laboratory424", user['display-name'] + ", Sorry, there isn't a saved drawing with that name.");
		}
	} else if (commands[0] === "!bs") {
		//Game to try once pbot code cleaned up.
		//pbs.chatIn(user, message);
	}
	*/


/////////////////////////////////////////////////
function generateFrame(str,startCol){
	var strData = [];
	var strDataLen;
	var row;
	var i;
	var curcol;
	var charCol;
	var activePix = [];
	var curPix;
	var bgCnt = 0;
	var fgCnt = 0;
	var frame = "";

	startCol = Number(startCol); //offset into str col data

	strData = getStrBinary(str);
	strDataLen = strData.length;

	for(charCol = 0; charCol < strDataLen; charCol++){
		curcol = strData[charCol];//ok
		for(row = 0; row < 7; row++){
			if(Number(curcol[row]) == 1 && startCol+charCol <= 11 && startCol >= 0){
			  	  if(isEven(row+1)){
			  		  curPix = ((row+1)*12)-(startCol+charCol);
			  	  }else{
			  		  curPix = ((row+1)*12)-11+(startCol+charCol);
			  	  }
					activePix.push(curPix);
			}
		}
	}
	//Generate RLE
	for(i = 0; i<144;i++){
		if(activePix.includes(i+1)){
			if(bgCnt > 0){
				frame = frame + bgCnt + "z";//write out BG count
				bgCnt = 0;//Set to 0
			}
			fgCnt++;
		}else{
			if(fgCnt > 0){
				frame = frame + fgCnt + "a";//write out BG count
				fgCnt = 0;//Set to 0
			}
			bgCnt++;
		}
	}
	//cleanup
	if(bgCnt > 0){
		frame = frame + bgCnt + "z";//write out BG count
		bgCnt = 0;//Set to 0
	}

//	console.log("frame DATA: "+ frame);

  	return frame;
}

/////////////////////////////////////////////////
function setPix(pix, pixColorComm){
	  var bRequestOK = true;

	  if(pix !== null){
		  pix.color(getHexColor(pixColorComm));
	  }

	  return bRequestOK;
  }
	/////////////////////////////////////////////////
  function setPix2(pix, pixColorComm){
  	  var bRequestOK = true;

  	  if(pix !== null){
  		  pix.color(getPictureColor(pixColorComm));
  	  }

  	  return bRequestOK;
    }

	/////////////////////////////////////////////////
  function set_RCPixel(row, col, hexColor){
  	  var bRequestOK = false;
	  var curPix;
	  var pix;
	  var r = Number(row);
	  var c = Number(col);

	  if(isEven(r)){
		  curPix = (r*12)-(c-1);
	  }else{
		  curPix = (r*12)-11+(c-1);
	  }
	  if(curPix > 0 && curPix <= 144){
		  pix = strip.pixel(curPix-1);
		  if(pix !== null){
		  	pix.color(hexColor);
			bRequestOK = true;
		  }
	  }

  	  return bRequestOK;
    }

	/////////////////////////////////////////////////
	function say_text(words){
		/*if(client != null){
			client.action("laboratory424", words);
		}else{
			console.log("client is null!!!!");
		}	*/
	}

/////////////////////////////////////////////////
	function isEven(value) {
		if (value%2 == 0)
			return true;
		else
			return false;
	}

/////////////////////////////////////////////////
  function setRow(row, color, strip){
  	 var j;
  	 if(!isNaN (row) && row >= 1 && row <= 12){
  		  if(row == 1){
  			  for( j = 0; j < 12; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 2){
  			  for( j = 12; j < 24; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 3){
  			  for( j = 24; j < 36; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 4){
  			  for( j = 36; j < 48; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 5){
  			  for( j = 48; j < 60; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 6){
  			  for(var j = 60; j < 72; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 7){
  			  for(var j = 72; j < 84; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 8){
  			  for(var j = 84; j < 96; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 9){
  			  for(var j = 96; j < 108; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 10){
  			  for(var j = 108; j < 120; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 11){
  			  for(var j = 120; j < 132; j++){setPix(strip.pixel(j), color);}
  		  }else if(row == 12){
  			  for(var j = 132; j < 144; j++){setPix(strip.pixel(j), color);}
  		  }
    	}
  }
/////////////////////////////////////////////////
function setCol (col, color, strip){
	var basePixNum = [0,23,24,47,48,71,72,95,96,119,120,143];

	if(!isNaN (col) && col >= 1 && col <= 12){
		var offset = col-1;

		setPix(strip.pixel(basePixNum[0]+offset), color);

		setPix(strip.pixel(basePixNum[1]-offset), color);
		setPix(strip.pixel(basePixNum[2]+offset), color);

		setPix(strip.pixel(basePixNum[3]-offset), color);
		setPix(strip.pixel(basePixNum[4]+offset), color);

		setPix(strip.pixel(basePixNum[5]-offset), color);
		setPix(strip.pixel(basePixNum[6]+offset), color);

		setPix(strip.pixel(basePixNum[7]-offset), color);
		setPix(strip.pixel(basePixNum[8]+offset), color);

		setPix(strip.pixel(basePixNum[9]-offset), color);
		setPix(strip.pixel(basePixNum[10]+offset), color);

		setPix(strip.pixel(basePixNum[11]-offset), color);
	}
}
/////////////////////////////////////////////////
//Useful for effects, later. Move to draw file?
/*exports.blinkPix = function(pixArr, colorArr, strip){

	for(var j = 0; j < pixArr.length; j++){
		var curPix = pixArr[j]-1;
		var curColor = colorArr[j];

		if(!isNaN (pixArr[j]) && pixArr[j] >= 1 && pixArr[j] <= 144){
		    if (blinkState[curPix] == false){
				setPix(strip.pixel(curPix), curColor);
		    	blinkState[curPix] = true;
		    }else{
				setPix(strip.pixel(curPix), "x");
		    	blinkState[curPix] = false;
		    }
		}
	}
    strip.show();
}*/
/////////////////////////////////////////////////
//Old function to get color. Need to merge with other and
//probably keep getHexColor name since it is more descriptive.
function getHexColor(pixColorComm){
	  var hexColor;//hex value or similar.

	  switch(pixColorComm){
	  case "r"://red
			hexColor = "#ff0000";
			break;
	  	case "g"://green!
			//hexColor = "#00ff00";
			hexColor = "#008000";
			break;
	  	case "b"://blue
			hexColor = "#0000ff";
			break;
	  	case "w"://White
			hexColor = "#ffffff";
			break;
	  	case "x"://Off/Black
			hexColor = "#000000";
			break;
	  	case "y"://Yellow
			hexColor = "#FFFF00";
			break;
	  	case "m"://Maroon!
			hexColor = "#800000";
			break;
	  	case "p"://Purple!
			hexColor = "#800080";
			break;
	  	case "tp"://Twitch Purple!
			hexColor = "#6441a5";
			break;
	  	case "n"://Navy!
			hexColor = "#000080";
			break;
	  	case "dg"://Dark Green, ok, but dimmer very similar to green
			hexColor = "#006400";
			break;
	  	case "go"://gold -no
			hexColor = "#ffd700";
			break;
	  	case "k"://khaki-no
			hexColor = "#f0e68c";
			break;
	  	case "gr"://goldenrod, ok but still bright
			hexColor = "#daa520";
			break;
	  	case "cy"://cyan - bright
			hexColor = "#00ffff";
			break;
	  	case "te"://Teal!
			hexColor = "#008080";
			break;
	  	case "dt"://Dark Tur! (similar to teal)
			hexColor = "#00ced1";
			break;
	  	case "o"://Orange
			hexColor = "#ffa500";
			break;
	  	case "do"://Dark Orange (better, but still bright)
			hexColor = "#ff8c00";
			break;
	  	case "or"://Orange Red! (s bit bright but ok)
			hexColor = "#ff4500";
			break;
	  	case "p"://pink, ok!
			hexColor = "#ffc0cb";
			break;
	  	case "dp"://deep pink, too bright
			hexColor = "#ff1493";
			break;
	  	case "ls"://light salmon,bright
			hexColor = "#ffa07a";
			break;
			case "Ga": //GRAYS: Temp, because chat wanted to see some grays.
			hexColor = "#080808";
			break;
			case "Gb":
			hexColor = "#1c1c1c";
			break;
			case "Gc":
			hexColor = "#1c1c1c";
			break;
			case "Gd":
			hexColor = "#262626";
			break;
			case "Ge":
			hexColor = "#303030";
			break;
			case "Gf":
			hexColor = "#3a3a3a";
			case "Gg":
			hexColor = "#444444";
			break;
			case "Gh":
			hexColor = "#4e4e4e";
			break;
			case "Gi":
			hexColor = "#585858";
			break;
			case "Gj":
			hexColor = "#626262";
			break;
			case "Gk":
			hexColor = "#6c6c6c";
			break;
			case "Gl":
			hexColor = "#767676";
			case "Gm":
			hexColor = "#808080";
			break;
			case "Gn":
			hexColor = "#8a8a8a";
			case "Go":
			hexColor = "#949494";
			break;
			case "Gp":
			hexColor = "#9e9e9e";
			break;
			case "Gq":
			hexColor = "#a8a8a8";
			case "Gr":
			hexColor = "#b2b2b2";
			case "Gs":
			hexColor = "#bcbcbc";
			case "Gt":
			hexColor = "#c6c6c6";
			break;
			case "Gu":
			hexColor = "#d0d0d0";
			case "Gv":
			hexColor = "#dadada";
			case "Gw":
			hexColor = "#dadada";
			break;
			case "Gx":
			hexColor = "#e4e4e4";
			case "Gy":
			hexColor = "#e4e4e4";
			break;
			case "Gz":
			hexColor = "#eeeeee";
			break;
		default:
			hexColor = "#000000";
			//bRequestOK = false;//TEMP, add back in later while working with colors.
			break;
	  }

	  return hexColor;
  }

  /////////////////////////////////////////////////
	//Must represent each color as single digit/char
	//Probably move to getHexColor() and use this code in place of it.
	function getPictureColor(pixColorComm){
  	  var hexColor;//hex value or similar.

  	  switch(pixColorComm){
	  	case "a"://red
  			hexColor = "#ff0000";
  			break;
  	  	case "b"://green!
  			//hexColor = "#00ff00";
  			hexColor = "#008000";
  			break;
  	  	case "c"://blue
  			hexColor = "#0000ff";
  			break;
  	  	case "d"://White
  			hexColor = "#ffffff";
  			break;
  	  	case "e"://Off/Black
  			hexColor = "#000000";
  			break;
  	  	case "f"://Yellow
  			hexColor = "#FFFF00";
  			break;
  	  	case "g"://Maroon!
  			hexColor = "#800000";
  			break;
  	  	case "h"://Purple!
  			hexColor = "#800080";
  			break;
  	  	case "i"://Twitch Purple!
  			hexColor = "#6441a5";
  			break;
  	  	case "j"://Navy!
  			hexColor = "#000080";
  			break;
  	  	case "k"://Dark Green, ok, but dimmer very similar to green
  			hexColor = "#006400";
  			break;
  	  	case "l"://gold -no
  			hexColor = "#ffd700";
  			break;
  	  	case "m"://khaki-no
  			hexColor = "#f0e68c";
  			break;
  	  	case "n"://goldenrod, ok but still bright
  			hexColor = "#daa520";
  			break;
  	  	case "o"://cyan - bright
  			hexColor = "#00ffff";
  			break;
  	  	case "p"://Teal!
  			hexColor = "#008080";
  			break;
  	  	case "q"://Dark Tur! (similar to teal)
  			hexColor = "#00ced1";
  			break;
  	  	case "r"://Orange
  			hexColor = "#ffa500";
  			break;
  	  	case "s"://Dark Orange (better, but still bright)
  			hexColor = "#ff8c00";
  			break;
  	  	case "t"://Orange Red! (s bit bright but ok)
  			hexColor = "#ff4500";
  			break;
  	  	case "u"://pink, ok!
  			hexColor = "#ffc0cb";
  			break;
  	  	case "v"://deep pink, too bright
  			hexColor = "#ff1493";
  			break;
  	  	case "w"://light salmon,bright
  			hexColor = "#ffa07a";
  			break;
		case "x"://Gray1 (gary)
  			hexColor = "#858d86";
  			break;
		case "y"://Gray2 (gary)
  			hexColor = "#4c504d";
  			break;
  		default:
  			hexColor = "#000000";
  			//hexColor = pixColorComm;//TEMP! To figure out basic color hex values
  			//bRequestOK = false;//TEMP, add back in later while working with colors.
  			break;
  	  }

  	  return hexColor;
    }

    //////////////////////////////////////////////
		//Always call isValidDrawMap() before drawing
	function drawPicture(colorStr, pBotID){
		var strip = getStrip(pBotID);
  	  var curChar;
  	  var curColor;
  	  var pix;
  	  var commandStrLen;
  	  var curPix = 0;
  	  var numPixels;
  	  var pixNumMap;
  	  var colorMap;

  	  //Protect against empty command call.
  	  if(colorStr === undefined){
  		  return;//do nothing, run away.
  	  }

  	  pixNumMap = colorStr.split(/[a-z]+/);//Should break right after before the first number
  	  colorMap = colorStr.split(/[0-9]+/);

  	  pixNumArrLen = pixNumMap.length;
  	  for(var i = 0; i < pixNumArrLen-1; i++) {
  		numPixels = pixNumMap[i];
  		if(numPixels > 144-curPix){
  			break;//stop drawing.
  		}
  		curColor = getPictureColor(colorMap[i+1]);
  		for(var j = 0; j < numPixels; j++){
  			pix = strip.pixel(curPix);
  			pix.color(curColor);
  			curPix++;
  			if(curPix > 143)break;
  		}
  	  }
	}
//////////////////////////////////////////////
//Interprets black as transparent to layer images.
//Later, this should be a chroma color so black can be used in drawing.
	function drawPicTrans(colorStr, pBotID){
		var strip = getStrip(pBotID);
		//var curChar;
		var curColor;
		var pix;
		//var commandStrLen;
		var curPix = 0;
		var numPixels;
		var pixNumMap;
		var colorMap;

		//Protect against empty command call.
		if(colorStr === undefined){
			return;//do nothing, run away.
		}

		pixNumMap = colorStr.split(/[a-z]+/);//Should break right after before the first number
		colorMap = colorStr.split(/[0-9]+/);

		pixNumArrLen = pixNumMap.length;
		for(var i = 0; i < pixNumArrLen-1; i++) {
			numPixels = pixNumMap[i];
			if(numPixels > 144-curPix){
				break;//stop drawing.
			}
			curColor = getPictureColor(colorMap[i+1]);
			for(var j = 0; j < numPixels; j++){
				if(curColor != "#000000"){ //TEMP, if black do not update pixel
					pix = strip.pixel(curPix);
					pix.color(curColor);
				}
				curPix++;
				if(curPix > 143)break;
			}
		}
	}

  //////////////////////////////////////////////
	//Use 1 char for a color, no pix info, in order from 1-144
	//Obsolete for pictures/animations, but may be useful for
	//gaming and primatives. Move later.
    function drawPictureOLD(colorStr, strip){
  	  var curChar;
  	  var curColor;
  	  var pix;
  	  var commandStrLen;
  	  var curPix = 0;

  	  //Protect against empty command call.
  	  if(colorStr === undefined){
  		  return;//do nothing, run away.
  	  }

  	  commandStrLen = colorStr.length;

  	  for (var i = 0; i < commandStrLen; i++) {
  		if(isNaN(colorStr.charAt(i)) && colorStr.charAt(i) !=' '){
  			  curColor = getPictureColor(colorStr.charAt(i));
  			  pix = strip.pixel(curPix);
  			  pix.color(curColor);
  			  curPix++;
  			  if(curPix > 143)break;//No more pixels to process, leave.
  		  }
  	  }
    }

/////////////////////////////////////////////////////////////
//Abstract show() to hide HW. 
//Ideally, pbot handles this in draw functions, but
//there are cases where the calling function may want to control
//when to show. For instance, layering images, timing for all panels, etc.
	function show(pBotID){
		var strip = getStrip(pBotID);
		strip.show();
	}
/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////
	//convert rle to diffs, then animate.
	//	3j1e7k -> j1j2j3e4k5k6k7k8k9k10k11
	//	3j1e8k -> j1j2j3e1k5k6k7k8k9k10k11k12
	//	-------------------------------------------------
	function rleToPixPanel(rle){
	  var curPix = 0;
	  var pixNumMap;
	  var colorMap;
	  var pixMap = "";

	  if(rle === undefined){
		  return;//do nothing, run away.
	  }
	  pixNumMap = rle.split(/[a-z]+/);//Should break right after before the first number
	  colorMap = rle.split(/[0-9]+/); // ,a,e,a...
	  for(var i = 0; i < pixNumMap.length; i++) {
			for(var j = 0; j < pixNumMap[i]; j++){
				pixMap = pixMap + colorMap[i+1] + curPix;
				curPix++;
				if(curPix > 143)break;
			}
	  }
		//console.log("PIX NUMS: " + pixNumMap);
		//console.log("PIX COLORS: " + colorMap);
	  //console.log("PIX MAP: " + pixMap);

	  return pixMap;
	}
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
	//Calculate Diffs betweek map1 and map2
	//Pass in entire picture or just frames/panels.
	//Assumes converted from RLE to PIX and always 143 pixels.

	//Extracts pixels that are different from map1

	//We always have 144 pixels in a pixMap. So just march through colors and compare.
	//c1p1c2p2c3p3...c144p144
	//exports.diffFrames = function(pixMap1, pixMap2){
	function diffFrames(pixMap1, pixMap2){
			diffMap = "";
    	colorMap1 = pixMap1.split(/[0-9]+/);
		  colorMap2 = pixMap2.split(/[0-9]+/);

		for(var i = 0; i < 144; i++){
			if(colorMap1[i] != colorMap2[i]){
				diffMap += colorMap2[i] + i;
			}
		}

		console.log("PIX COLOR1: " + colorMap1);
		console.log("PIX COLOR2: " + colorMap2);
		console.log("PIX DIFFS: " + diffMap);
		return diffMap;
	}

	//exports.diffPanelFrames = function(picArray){
	function diffPanelFrames(picArray){
		//compare 0->1, 1->2, 2->3, 3->0
			var diffArray = [];
			var diffMap;
			var colorMap1;
			var colorMap2;
			var arrLen = picArray.length;

			diffArray.push(picArray[0]);//Init frame
			for(var k = 0; k < arrLen-1; k++){
				diffMap = "";
				colorMap1 = picArray[k].split(/[0-9]+/);
				colorMap2 = picArray[k+1].split(/[0-9]+/);
				for(var i = 0; i < 144; i++){
					if(colorMap1[i] != colorMap2[i]){
						diffMap += colorMap2[i] + i;
					}
				}
				diffArray.push(diffMap);
			}
			//Edge Case: compare last frame to first.
			diffMap = "";
			colorMap1 = picArray[arrLen-1].split(/[0-9]+/);
			colorMap2 = picArray[0].split(/[0-9]+/);
			for(var i = 0; i < 144; i++){
				if(colorMap1[i] != colorMap2[i]){
					diffMap += colorMap2[i] + i;
				}
			}
			diffArray.push(diffMap);


		//console.log("PIX COLOR1: " + colorMap1);
		//console.log("PIX COLOR2: " + colorMap2);
	//	console.log("PIX DIFFS: " + diffMap);
		return diffArray;
	}

/////////////////////////////////////////////////////////////
    //exports.drawDiffFrame = function(pixMapStr, strip){
		function drawDiffFrame(pixMapStr, strip){
		var pixels = pixMapStr.split(/[a-z]+/); //creates: ,1,2,3
		var colors = pixMapStr.split(/[0-9]+/);

		//console.log("COLORS: " + colors);
  		//Load Array data
  		for(var i = 1; i < pixels.length; i++){
				setPix2(strip.pixel(pixels[i]), colors[i-1]);
  		}
		}

		//None of these loopDiffFrames work. They crash due to undefined var on drawDiffFrame()
		function loopDiffFramesPB1(time) {
			var i = 0;
			gPBOT1IntervalPtr = setInterval(function () {
				if (i == gPBOT1PicArray.length) {
					i = 1;
				}
				drawDiffFrame(gPBOT1PicArray[i], pbotHW.pbot1Strip);
				i++;
				pbotHW.pbot1Strip.show();
			}, time);
		}

		function loopDiffFramesPB2(time) {
			var i = 0;
			gPBOT2IntervalPtr = setInterval(function () {
				if (i == gPBOT2PicArray.length) {
					i = 1;
				}
				drawDiffFrame(gPBOT2PicArray[i], pbotHW.pbot2Strip);
				i++;
				pbotHW.pbot2Strip.show();
			}, time);
		}
		
		function loopDiffFramesPB3(time) {
			var i = 0;
			gPBOT3IntervalPtr = setInterval(function () {
				if (i == gPBOT3PicArray.length) {
					i = 1;
				}
				drawDiffFrame(gPBOT3PicArray[i], pbotHW.pbot3Strip);
				i++;
				pbotHW.pbot3Strip.show();
			}, time);
		}
		
		function loopDiffFramesPB4(time) {
			var i = 0;
			gPBOT4IntervalPtr = setInterval(function () {
				if (i == gPBOT4PicArray.length) {
					i = 1;
				}
				drawDiffFrame(gPBOT4PicArray[i], pbotHW.pbot4Strip);
				i++;
				pbotHW.pbot4Strip.show();
			}, time);
		}

//"a1a2a3.a1a2a3.a1a2a3.a1a2a3.b1b2b3.b1b2b3.b1b2b3.b1b2b3.c1c2c3.c1c2c3.c1c2c3.c1c2c3.d1d2d3.d1d2d3.d1d2d3.d1d2d3"
function loopAllDiffFrames(time) {
	var i = 0;
	gPBOT1IntervalPtr = setInterval(function () {
		if (i == gPBOT1PicArray.length) {
			i = 1;
		}
		drawDiffFrame(gPBOT1PicArray[i], pbotHW.pbot1Strip);
		drawDiffFrame(gPBOT2PicArray[i], pbotHW.pbot2Strip);
		drawDiffFrame(gPBOT3PicArray[i], pbotHW.pbot3Strip);
		drawDiffFrame(gPBOT4PicArray[i], pbotHW.pbot4Strip);
		i++;
		pbotHW.pbot1Strip.show();
		pbotHW.pbot2Strip.show();
		pbotHW.pbot3Strip.show();
		pbotHW.pbot4Strip.show();
	}, time);
}

/////////////////////////////////////////////////////////
//loopFrames()
//	Takes an array of RLE picture commands and displayes them based on time. Loops forever.
//	TBD: Add param and associated command to only go through animation once. Useful for gaming/effects
/////////////////////////////////////////////////////////
function loopFramesPB1(time) {
	var i = 0;

	console.log("Array Length"+ gPBOT1PicArray.length);
	console.log("data[0]"+ gPBOT1PicArray[i]);

	gPBOT1IntervalPtr = setInterval(function () {
		if (i == gPBOT1PicArray.length) {i = 0;}
		drawPicture(gPBOT1PicArray[i], 1);
		i++;
		pbotHW.pbot1Strip.show();
	}, time);
}

function loopFramesPB2(time) {
	var i = 0;
	gPBOT2IntervalPtr = setInterval(function () {
		if (i == gPBOT2PicArray.length) {i = 0;}
		drawPicture(gPBOT2PicArray[i], 2);
		i++;
		pbotHW.pbot2Strip.show();
	}, time);
}

function loopFramesPB3(time) {
	var i = 0;
	gPBOT3IntervalPtr = setInterval(function () {
		if (i == gPBOT3PicArray.length) {i = 0;}
		drawPicture(gPBOT3PicArray[i], 3);
		i++;
		pbotHW.pbot3Strip.show();
	}, time);
}

function loopFramesPB4(time) {
	var i = 0;
	gPBOT4IntervalPtr = setInterval(function () {
		if (i == gPBOT4PicArray.length) {i = 0;}
		drawPicture(gPBOT4PicArray[i], 4);
		i++;
		pbotHW.pbot4Strip.show();
	}, time);
}
//For now, using pbot4 ptr and array to set it up. Need to change after testing though.
function loopAllFrames(time) {
	var i = 0;
	gPBOT4IntervalPtr = setInterval(function () {
		if (i == gPBOT4PicArray.length) {
			i = 0;
		}
		drawPicture(gPBOT1PicArray[i], 1);
		drawPicture(gPBOT2PicArray[i], 2);
		drawPicture(gPBOT3PicArray[i], 3);
		drawPicture(gPBOT4PicArray[i], 4);
		i++;
		pbotHW.pbot1Strip.show();
		pbotHW.pbot2Strip.show();
		pbotHW.pbot3Strip.show();
		pbotHW.pbot4Strip.show();
	}, time);
}
//////////////////////////////////////////////
function animatePix(pix, color, time) {
	setTimeout(function () {
		setPix(pbotHW.pbot1Strip.pixel(pix), color);
		pbotHW.pbot1Strip.show();
	}, time);
}

function animateAllPanelPix(pix, color, time, strip) {
	setTimeout(function () {
		setPix(strip.pixel(pix), color);
		strip.show();
	}, time);
}
  //////////////////////////////////////////////
	//Send this a single frame of RLE and it will check if OK.
	//Checks for:
	//	Empty (double-period)
	//	non-alphanumeric chars (a-z, A-Z, 0-9)
	//	missing number or letters (color map length = pixel map length.)
	//	Bad pixel count (SUM of all numbers should = 144)
    //exports.isValidDrawMap = function(rleStr){
		function isValidDrawMap(rleStr){
			var bIsOK = true;
	  	var approvedChars = new RegExp("^[0-9A-Za-z]+$");//only allow number and letters.
    	var	pixNumMap = rleStr.split(/[a-z]+/);
    	var	colorMap = rleStr.split(/[0-9]+/);
			var pixCount = 0;
			var i;

		//Empty Frame? (EG: "..")
		if(bIsOK && rleStr == ""){
			console.log("DOUBLE-PERIOD, EMPTY FRAME!");
			bIsOK = false;
		}
		//Can only be a-z, A-Z, 0-9.
		if(bIsOK && !approvedChars.test(rleStr)){
			console.log("BAD CHARACTER IN RLE!");
			bIsOK = false;
		}
		//Colors and pixel arrays should be equal.
		if(bIsOK && pixNumMap.length != colorMap.length){
			console.log("MISMATCHED COLOR/PIXEL ARRAYS!");
			bIsOK = false;
		}
		//Check for a valid color code length. (1 char)
		if(bIsOK){
			for (i=0; i< colorMap.length; i++){
				if(colorMap[i].length > 1){
					console.log("BAD COLOR CODE! ");
					bIsOK = false;
				}
			}
		}
		//Colors and pixel arrays should be equal.
		if(bIsOK){
			for (i=0; i< pixNumMap.length; i++){pixCount += Number(pixNumMap[i]);}
			if(pixCount > 144){
				console.log("PIXEL COUNT GREATER THAN 144! "+ pixCount);
				bIsOK = false;
			}
		}

	  return bIsOK;
    }

//Clear A Panel
function clearPanel(pBotNum){
	switch (pBotNum) {
		case 1:
			if (gPBOT1IntervalPtr != null) { clearInterval(gPBOT1IntervalPtr); }
			gPBOT1PicArray = [];//Purge array
			pbotHW.pbot1Strip.color("#000000");
			setTimeout(function () { pbotHW.pbot1Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
			break;
		case 2:
			if (gPBOT2IntervalPtr != null) { clearInterval(gPBOT2IntervalPtr); }
			gPBOT2PicArray = [];//Purge array
			pbotHW.pbot2Strip.color("#000000");
			setTimeout(function () { pbotHW.pbot2Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
			break;
		case 3:
			if (gPBOT3IntervalPtr != null) { clearInterval(gPBOT3IntervalPtr); }
			gPBOT3PicArray = [];//Purge array
			pbotHW.pbot3Strip.color("#000000");
			setTimeout(function () { pbotHW.pbot3Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
			break;
		case 4:
			if (gPBOT4IntervalPtr != null) { clearInterval(gPBOT4IntervalPtr); }
			gPBOT4PicArray = [];//Purge array
			pbotHW.pbot4Strip.color("#000000");
			setTimeout(function () { pbotHW.pbot4Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
			gClearPB4 = false;//reset clear flag
			break;
	}
}

//Wipe all panels at once.
function clearAllPanels(){
	//if (gPBOTAllIntervalPtr != null) { clearInterval(gPBOTAllIntervalPtr); }
	//PB1
	if (gPBOT1IntervalPtr != null) { clearInterval(gPBOT1IntervalPtr); }
	gPBOT1PicArray = [];//Purge array
	pbotHW.pbot1Strip.color("#000000");
	setTimeout(function () { pbotHW.pbot1Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
	//PB2
	if (gPBOT2IntervalPtr != null) { clearInterval(gPBOT2IntervalPtr); }
	gPBOT2PicArray = [];//Purge array
	pbotHW.pbot2Strip.color("#000000");
	setTimeout(function () { pbotHW.pbot2Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
	//PB3
	if (gPBOT3IntervalPtr != null) { clearInterval(gPBOT3IntervalPtr); }
	gPBOT3PicArray = [];//Purge array
	pbotHW.pbot3Strip.color("#000000");
	setTimeout(function () { pbotHW.pbot3Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
	//PB4
	if (gPBOT4IntervalPtr != null) { clearInterval(gPBOT4IntervalPtr); }
	gPBOT4PicArray = [];//Purge array
	pbotHW.pbot4Strip.color("#000000");
	setTimeout(function () { pbotHW.pbot4Strip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
}

////////////SAVED DRAWINGS///////////////
//Experimental. Just data to pull from. Final will be from db
//previously stored by user.
	function getSavedDrawing(drawName){
		var drawStr = "";

		switch(drawName){
		case "star":
			drawStr = "1z3r3z3r4z1r2f1r1z1r2f1r3z1r2f1r2f1r6z1r5f1r5z1r3f1r7z1r5f1r3z1r2f1r1f1r2f1r3z1r3f1r1f1r3f4r5f3r5z1r3f1r7z1r1f1r11z1r5z.BillyBob";
			break;
		case "invader":
			drawStr = "39z2b1z2b5z1b1z1b5z1b1z2b1z7b1z1b2z11b1z2b1z3b1z2b5z7b5z1b3z1b7z1b5z1b14z.Atari";
			break;
		case "424love":
			drawStr = "18q1v9q3i9q3v1i1v5q2v3i2v5q1i2v1i2v1i2v1q3v4i2v1i1v2q1v3i3v3i2v1i1v1i3v1i1v1i1v2q1v1i1v1i1v1q1v1i1v1i1v1q3v3q3v14q.unknown";
			break;
		case "TBD":
			drawStr = "string.unknown";
			break;
		}

		return drawStr
	}

function testAnimation() {
	var pic = "";
	var time = 500;//Default
	var i;
	var bGoodDrawing = true;

	clearAllPanels();

	gPBOT1PicArray.push("4e1a14e1a8e1a14e1a8e1a14e1a8e8a60e");
	gPBOT1PicArray.push("6e1a10e1a12e1a10e1a12e6a84e");
	gPBOT1PicArray.push("9e1a2e3a129e");
	gPBOT1PicArray.push("11e1a132e");
	//
	gPBOT2PicArray.push("7e1a8e1a14e1a8e1a14e1a8e1a7e8a64e");
	gPBOT2PicArray.push("5e1a12e1a10e1a12e1a5e6a90e");
	gPBOT2PicArray.push("2e1a18e3a120e");
	gPBOT2PicArray.push("1a143e");
	//
	gPBOT3PicArray.push("60e8a8e1a14e1a8e1a14e1a8e1a14e1a4e");
	gPBOT3PicArray.push("84e6a12e1a10e1a12e1a10e1a6e");
	gPBOT3PicArray.push("129e3a2e1a9e");
	gPBOT3PicArray.push("132e1a11e");
	//
	gPBOT4PicArray.push("64e8a7e1a8e1a14e1a8e1a14e1a8e1a7e");
	gPBOT4PicArray.push("90e6a5e1a12e1a10e1a12e1a5e");
	gPBOT4PicArray.push("120e3a18e1a2e");
	gPBOT4PicArray.push("143e1a");

	loopAllFrames(time);//Loop forever.
}

////////////////////////////////////////////
module.exports.processCommands = processCommands;
module.exports.gameCommand = gameCommand;
