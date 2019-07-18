var tmi = require("tmi.js"); //so we have access to chat services.
var pixel = require("node-pixel");
var five = require("johnny-five");

var db = require('../../db/db.js');

var ports = [
	{ id: "FBOT", port: "COM11" }
];

var tmiClient = null;
var gSpeed = 100;
var gTurretAngle = 65;
var gWaistAngle = 110;
var gBallCount = 1;

var gLoaderDone = true;
var gLoaderJammed = false;
var gMagEmpty = false;
var gLostShots = 0;
var gReloadMode = false;
//Queue Mgmt
var gCommandQue = new Array();
var gCommandDone = true;
var gCommUserQue = new Array();//To store user's associated with commands
var gFBOTCommandIntervalPtr = setInterval(processQueue,1000);

var fbotHW = {
	armR: null,
	armL: null,
	loader: null,
	waist: null,
	launcher: null,
	magSensor: null,
	radar: null,
	eyeStrip: null
};

var gFBOTIntervalPtr = null;
var gFBOTPicArray = new Array();

var gRadarIntervalPtr = null;
var gRadarArray = new Array();

new five.Boards(ports).on("ready", function () {
	console.log("FBOT Board ready!");
	fbotHW.armL = new five.Servo({ pin: 9, startAt: 0, board: this.byId("FBOT") });
	fbotHW.armR = new five.Servo({ pin: 10, board: this.byId("FBOT") });
	fbotHW.waist = new five.Servo({ pin: 5, board: this.byId("FBOT") });
	fbotHW.loader = new five.Servo({ pin: 7, board: this.byId("FBOT") });
	fbotHW.launcher = new five.Motor({ pin: 11, board: this.byId("FBOT") });
	fbotHW.magSensor = new five.Sensor({ pin: "A0", threshold: 600, board: this.byId("FBOT") });
	//NEW
	fbotHW.radar = new five.Servo({pin:3, type: "continuous", board:this.byId("FBOT")});
	fbotHW.eyeStrip = new pixel.Strip({
		board: this.byId("FBOT"),
		controller: "FIRMATA",
		strips: [ {pin: 6, length: 48}],
		gamma: 2.8,
	});

	init();
	fbotHW.loader.on('move:complete',loaderDone);
});

//Maintained by loader servo. Called when rotation command finished.
function loaderDone(){
	//console.log("LOADER DONE!");
	gLoaderDone = true;
}

function checkLoader(){
	if(gLoaderDone != true){
		tmiClient.action("Laboratory424", "! - ALERT - ! LOADER IS JAMMED.");
		fbotHW.loader.stop();//should stop rotation immediately, no current draw. Retract? move.to(165)
		gLoaderJammed = true;//Stop queue
		//Stop the queue. Need separate var to control.
		//NOTE: When queue restarts, we need to set gLoaderDone = true!!!!, reinit fbot.
	}
}

///////////////////////////////////////////
//PUBLIC FUNCTIONS
///////////////////////////////////////////
function init(){
	var color1 = '#FFFF00';
	var time = 0;

	db.updateCurUsr("FBot Queue Empty");//RM user to file linked to OBS

	/*powerupEyes();
  	rotate(fbotHW.armL,0);
	rotate(fbotHW.armR,gTurretAngle);//30 - 120 valid for this servo!
	rotate(fbotHW.waist,gWaistAngle);//45-180 safe for now
	rotate(fbotHW.loader,100);
	fbotHW.launcher.stop();//make sure off.
	fbotHW.radar.cw(.01);*/

	setTimeout(function(){fbotHW.launcher.stop();}, time+=100);
	setTimeout(function(){rotate(fbotHW.loader,100)}, time+=100);
	setTimeout(function(){powerupEyes()}, time+=100);
	//setTimeout(function(){rotate(fbotHW.armL,0)}, time+=300);
	setTimeout(function(){rotate(fbotHW.armR,gTurretAngle,750)}, time+=300);
	setTimeout(function(){rotate(fbotHW.waist,gWaistAngle,750)}, time+=500);
	
	setTimeout(function(){fbotHW.radar.cw(.01)}, time+=500);
}

///////////////////////////////////////////
function setTMIClient(theClient){
	tmiClient = theClient;
}

///////////////////////////////////////////
//For now, this is async since only does one thing.
//Eventually may need to add it to a bb queue
function throwbbs(){
  var time = 500;
  setTimeout(function(){rotate(fbotHW.armL,170)}, time+=100);
	setTimeout(function(){rotate(fbotHW.armL,0)}, time+=1000);
}
///////////////////////////////////////////
function magEmpty(bEmpty){
	gMagEmpty = bEmpty;
}
////////////////////////////////////////////////////
//Main fn to push commands to managed queue. For bot generated pushes,
//can bypass validation.

//RECON: you know you can add your funtions to a object add just export the objext instead if each function
//For example: module.exports = { addToQueue: () => {} };
// var x = {}; x.addToQue = (client, user, etc) => {"your code"} module.exports = x;
//Or you can do this: function x() {} function y() {} function z() {} module.exports = { x, y, z };
function addToQue(channel, client, user, commStr, byPassValidation = false){
	var cleanCommStr = "";

	if(!byPassValidation){
		cleanCommStr = validateCommand(channel, client, user, commStr); //returns "" if bad and handles error to user.
		
	}else{
		cleanCommStr = commStr;
	}
	
  if(cleanCommStr != ""){
		//if byPass = false, can respond to user: where in que. push returns array len.
		cleanCommStr+=".cmdone";//Add queue mgmt flag
		gCommandQue.push(cleanCommStr);
		gCommUserQue.push(user['display-name']);
		//If gLostShots > 0, then need to unshift() instead.

		//if(!byPassValidation)//Must be user request, not SE/Myself
		//client.action("laboratory424", user['display-name'] + ", Command position in Queue: "+gCommandQue.length);
	}
}

///////////////////////////////////////////
//Executes Fbot Commands. Must Validate input first. 
//Called automatically through interval/Queue.
function processCommands(commStr){
	var commands = commStr.split(".");
	var command;
	var partPos; //Array containing part index[0] and angle[1]
	var angle;
	var i;
	var time = 0;

	for (i = 0; i < commands.length; i++){
		partPos = commands[i].split(/[0-9]+/);//Should break right after before the first number
		command = partPos[0];
		partPos = commands[i].split(/[a-z]+/);//Should break right after before the first number
		angle = partPos[1];
		switch(command){

		case "tla"://BB throw arm
			if(posOK(angle,true)){rotate(fbotHW.armL,angle);}
			break;
		case "la"://PPB Loader
			if(angle <= 180 && angle >= 0){rotate(fbotHW.loader,angle);}
			break;
		case "ta":
			if(posOK(angle,true)){
				gTurretAngle = angle;
				rotate(fbotHW.armR,gTurretAngle,750);
			}
			break;
		case "wa":
			if(posOK(angle,true)){
				var prevWaistAngle = gWaistAngle;
				gWaistAngle = angle;
				var angleDiff = Math.abs(prevWaistAngle-gWaistAngle);
				//scale function. Set min, if > min, multiply by time factor. EG: 1.1, 1.5
				if(angleDiff > 50){
					rotate(fbotHW.waist,angle,1250);
				}else{
					rotate(fbotHW.waist,angle,750);
				}
			}
    	break;
		case "ms":
			fbotHW.launcher.start(gSpeed);
			break;
		case "mx":
			fbotHW.launcher.stop();
			break;
		case "s":
				gSpeed = angle;
				if(gSpeed < 50){gSpeed = 50;}//temp, until replace motors.
				if(angle > 200){gSpeed = 200;}
			break;
		case "wc":
			gWaistAngle = 120;
			rotate(fbotHW.waist,gWaistAngle,750);
			break;
		case "tc":
			gTurretAngle = 80;
			rotate(fbotHW.armR,gTurretAngle,750);
			break;
		case "fire":
			if(angle == ""){angle = 1;}
			time += randomFire(angle,time);
			break;
    case "reloaded":
				gReloadMode = false;
				console.log("ReloadMode set to: "+gReloadMode);
				//checkMag();//Update mag value
			//gMagEmpty = false;//mag is full-ish
			//gCommandDone = true;//BAD, Hack. Temp, testing! Will lose current shot/command request.
			//TBD: add timeout/delay
  		break;
		case "ppbs":
			//var ppbs = getMagCount();
			//client.action("laboratory424",user['display-name'] + ", " + ppbs +" ball(s) in the mag.");
			break;
		case "throw":
			//if(user['subscriber'] == true){
			//var time = 100;
			//setTimeout(function(){rotate(fbotHW.armL,170)}, time+=100);
			//setTimeout(function(){rotate(fbotHW.armL,0)}, time+=1000);
			//}
			break;
		case "whisper":
			//client.whisper(user['username'], "Oh hi there. Just testing if KB-23 Robot of Doom (AKA: ROD) can send you a whisper.");
			break;
		case "fire-atoms":
			//how to check how many points?
			//have tmi whisper to streamelements bot, to get points, then parse.
			//client.action("laboratory424", "!addpoints" + user['username'] + "-200");
			break;
		case "cmdone":
			//db.updateCurUsr("FBot Queue Empty");//RM user to file linked to OBS
			setTimeout(function(){gCommandDone = true;console.log("CommDone Reset.");}, time+=300);//Give previous command time to chill.
			break;
		}
		
	}
}

function processExtendedCommand(commStr){
	var commands = commStr.split(".");
  
	switch(commands[0]){
		case "!fb1r": //!fb1r.cw[speed], !fb1r.[s][dir][time]. !fb1r.2r300.3l.s
		var data;
		var move;
		var speed;
		var delay;
		var j;
  
		gRadarArray = [];//Purge array
		clearInterval(gRadarIntervalPtr);
		for(j = 1; j < commands.length;j++){
		  //TBD: Iterate and Validate
		  data = commands[j].split(/[0-9]+/);
			  move = data[1];//r,l,s
			  data = commands[j].split(/[a-z]+/);
		  speed = data[0];//0-9 , 0.01 - 0.09
		  if(j == 1){
			delay = data[1];
			if(delay > 3000){
			  delay = 3000;
			}else if(delay < 250){
			  delay = 250;
			}
		  }//ms
		  //if(OK)
		  gRadarArray.push(commands[j]);
		}
		loopRadar(delay);//fixed time for now.
		break;
	  case "!fb1a"://Temp, for fbot eye animation/drawing. !fb1e.300.3j1e7k
		var fbotMap;
		var pbPixMap
		var time = 500;//Default
		var i;
  
		clearEyes();
		for (i = 1; i < commands.length; i++) {
		  if (!isNaN(commands[i])) { //Did they submit a time?
			time = commands[i];
			if (time < 100) { time = 100; }//Until we resolve time-collision issue, force a min of 300ms.
		  } else {
			//console.log("Comms: "+commands[i]);
			pbPixMap = rleToPixPanel(commands[i]); //convert from rle to pix map
			//console.log("pbPixMap: "+pbPixMap);
			fbotMap = buildFbotMap(pbPixMap)//convert from pbot map to fbot map
			//console.log("FBOTMAP: "+fbotMap);
			gFBOTPicArray.push(fbotMap); //Push the 48pix map onto array.
		  }
		}
		loopFramesEyes(time);//Loop forever.
		break;
	  case "!fb1d"://Temp, for fbot eye animation/drawing. !xb1e.300.3j1e7k
		var fbotMap;
		var pbPixMap
		var i;
		//console.log("IN !FB1D ");

		clearEyes();
		pbPixMap = rleToPixPanel(commands[1]); //convert from rle to pix map
		//drawFbotEyes(pbPixMap);//Map to eyes and draw.
		fbotMap = buildFbotMap(pbPixMap)//convert from pbot map to fbot map
		gFBOTPicArray.push(fbotMap);
		//console.log("ARRAY: "+gFBOTPicArray);
		drawEyes(fbotMap);
		fbotHW.eyeStrip.show();
		break;
	  case "!fb1x":
		clearEyes();
		setTimeout(function () { fbotHW.eyeStrip.show(); }, 300);
		break;
	  case "!fb1p":
		var panelColor = commands[1];//hexcolor
		var isOK  = /^#[0-9A-F]{6}$/i.test(panelColor);
		if(isOK){
		  clearEyes();
			  setTimeout(function (){fbotHW.eyeStrip.color(panelColor); fbotHW.eyeStrip.show();}, 500);
		}else{
		  console.log("BAD HEX EYE COLOR: "+panelColor);
		}
		break;
	  case "!fb1i":
		clearEyes();
		gRadarArray = [];//Purge array
		clearInterval(gRadarIntervalPtr);
		init();
		break;
	  case "!fb1w":
		console.log("IN FB1w");
		db.updateCurUsr("-Greetings from FBOT-");
		break;
	}
}

//////////////////////////////////////////
// Random fire handles all shooting. Current behavior is first shot is wherever it is pointed.
// Other consecutive shots are random. Future: firing patterns. Queue works ok, but current
// command sequence is lost if mag is emptied during sequence. Issue with losing coords if resume

//2 Problems:
//	1. If run out of shot during random fire, motor doesn't shut off.
//	2. Occassional missfeed or accidental drop and hesitate before shot.

function randomFire(balls, time){
		if(!gMagEmpty){
			for(var i = 0; i < balls; i++){
				if(i == 0){//Startup case
					setTimeout(function(){checkMag()}, time +=200);
					//setTimeout(function(){if(gMagEmpty){gLostShots++}}, time +=200);
					setTimeout(function(){
						if(!gMagEmpty){
							fbotHW.launcher.start(gSpeed);
						}else{
							client.action(channel,"Magazine empty. Unable to start motor.");
						}
						}, time+=200); //Speed motor up
						//Idea: loop reload check until full
					setTimeout(function(){if(!gMagEmpty){rotate(fbotHW.loader,165)}}, time+=2500); //Wait 2.5s for motor, Drop Ball
					setTimeout(function(){if(!gMagEmpty){rotate(fbotHW.loader,80)}}, time+=750); //Wait .75s, Push into motor
					setTimeout(function(){if(!gMagEmpty){checkLoader()}}, time+=800);//verify no jams
					setTimeout(function(){if(!gMagEmpty){rotate(fbotHW.loader,100)}}, time+=500); //Wait 0.5s, Return to start pos
					
				}else{
					setTimeout(function(){checkMag()}, time +=200);
					//setTimeout(function(){if(gMagEmpty){gLostShots++}}, time +=200);
					//setTimeout(function(){if(gMagEmpty){fbotHW.launcher.stop()}}, time+=400);//stop motor immediately if empty
					
					setTimeout(function(){if(!gMagEmpty){randomSpeed(fbotHW)}}, time+=200);//Adjust Motor speed
					setTimeout(function(){if(!gMagEmpty){randomWaistCoord(fbotHW)}}, time+=1000);//give motor 1s to set.
					setTimeout(function(){if(!gMagEmpty){randomTurretCoord(fbotHW)}}, time+=800);
	
					setTimeout(function(){if(!gMagEmpty){rotate(fbotHW.loader,165)}}, time+=800); //Wait for motor, Drop Ball
					setTimeout(function(){if(!gMagEmpty){rotate(fbotHW.loader,80)}}, time+=750); //Push into motor
					setTimeout(function(){if(!gMagEmpty){checkLoader()}}, time+=800);//verify no jams
					setTimeout(function(){if(!gMagEmpty){rotate(fbotHW.loader,100)}}, time+=500); //Return to start pos
				}
			}
			//ISSUE: If lost shot, lost coords. Could bypass center arm/waist. 
			//ISSUE: If crash, lose queue. So, need to write out.
			setTimeout(function(){fbotHW.launcher.stop()}, time+=500); //was 200. Stop motor
			setTimeout(function(){rotate(fbotHW.loader,100)}, time+=200); //was 500. Return to start pos
			setTimeout(function(){rotate(fbotHW.armR,65,750)}, time+=500); //was 1000. center arm
			setTimeout(function(){rotate(fbotHW.waist,110,750)}, time+=500); //was 1000. center waist
			//Do we need to compensate for lost shots?
			/*setTimeout(function(){
				if(gLostShots>0){
					this.addToQue(null, "bot", "fire"+gLostShots, true);
					//unshift()
					gLostShots = 0;
				}
			}, time+=200);*/
		}
		
	return time;
}

///////////////////////////////////////////
//Validate commands before allowing execution.
function validateCommand(channel, client, user, commStr){
	var bIsOK = true;
	var errMessage = "";
	var approvedChars = new RegExp("^[0-9A-Za-z.]+$");//only allow number and letters.
	var commands;
	var command;
	var partPos; //Array containing part index[0] and angle[1]
	var angle;
	var i;
	
	//Check if user already has command sitting in queue. Only allowed 1 in que.
	//Exception are commands generated by purchased shots.
	if(gCommUserQue.includes(user['display-name'])){
		errMessage = ", you already have a command in queue.";
		bIsOK = false;
	}

	//Can only be a-z, A-Z, 0-9, period.
	//Note: If I included username at some point, may need to strip off name before check.
	if(bIsOK && !approvedChars.test(commStr)){
		errMessage = "Request contains invalid character.";
		bIsOK = false;
	}

	//TBD: should split commands and check for more than 4 commands. only 4 allowed.
	//But, there is an exception in the case of eye animation. So, need to process based
	//on command: fb1, fb1a...
	if(bIsOK){
		commands = commStr.split(".");
		for (i = 0; i < commands.length; i++){
			if(!bIsOK){ //Leave if something is bad.
				break;
			}
			partPos = commands[i].split(/[0-9]+/);//Should break right after before the first number
			command = partPos[0];
			partPos = commands[i].split(/[a-z]+/);//Should break right after before the first number
			angle = partPos[1];
			switch(command){
				//LAB424 ONLY COMMANDS
				case "tla"://BB Throw Arm angle
				case "la"://PBB Loader
				case "ms"://Motor start
				case "mx"://Motor stop
				case "reload":
				case "cmdone"://Internal only comm for que mgmt
					if(user.username != "laboratory424"){
						errMessage = "Request contains invalid command."
						bIsOK = false;
					}
					break;
				case "ta":
					if(angle > 120 || angle < 30){ //Servo only works from 30-120
						errMessage = "Turret angle out of range [30-120]."
						bIsOK = false;
					}
					break;
				case "wa":
					if(angle > 180 || angle < 45){ //Servo is from 0-180, 45 to protect ebot.
						errMessage = "Waist angle out of range [45-180]."
						bIsOK = false;
					}
					break;
				case "l":
					errMessage = "'l' command no longer supported. Use 'wa' instead."
					bIsOK = false;
					break;
				case "r":
					errMessage = "'r' command no longer supported. Use 'wa' instead."
					bIsOK = false;
					break;
				case "u":
					errMessage = "'u' command no longer supported. Use 'ta' instead."
					bIsOK = false;
					break;
				case "d":
					errMessage = "'d' command no longer supported. Use 'ta' instead."
					bIsOK = false;
					break;
				case "s":
					if(angle < 50 || angle > 255){
						errMessage = "Speed out of range [50-255]"
						bIsOK = false;
					}
					break;
				case "wc":
					break;
				case "tc":
					break;
				case "fire":
					if(user.subscriber == true || user['user-type'] == 'mod'){
						if(angle != "" && angle > 1){//For now, only support single shot
							errMessage = "Invalid number of balls on fire command.";
							bIsOK = false;
						}
					}else{
						errMessage = "Only subs can use the fire command. You can shoot with atoms however.";
						bIsOK = false;
					}
					break;
				case "ppbs"://Number of PPB in magazine
					break;
				case "value"://Sensor value. Temp, testing.
					//Can't process with processCommand() since no client. So take care of it here.
					//Need to fix later?
					var value = fbotHW.magSensor.scaleTo(0,1023);
					client.action(channel,"Magazine sensor value = "+ value);
					break;
				default:
						errMessage = "Request contains recongnized command."
						bIsOK = false;
					break;
				}
		}

	}

	if(!bIsOK){
		client.action(channel,user['display-name'] + " " + errMessage);
		//client.say(channel, `@${tags.usenrame}, Hello, World!`);
		//client.on('message', (channel, tags, message, self) => {});
		commStr = "";
	}

	return commStr;
}
////////////////////////////////////////
function processQueue(){
	var commStr;
	var user;
	
	checkMag();

	if(gCommandQue.length <= 0){
		db.updateCurUsr("FBot Queue Empty");
	}

	//console.log("gCommandDone: "+gCommandDone);
	//console.log("gMagEmpty: "+gMagEmpty);
	//console.log("gCommandQue.length: "+gCommandQue.length);
	//console.log("gReloadMode: "+gReloadMode);
	//if(gCommandDone === true && gReloadMode == false && !gMagEmpty && gCommandQue.length > 0){
	if(gCommandDone === true && !gMagEmpty && !gLoaderJammed && gCommandQue.length > 0){
		commStr = gCommandQue.shift();
		user = gCommUserQue.shift();//this may need to be a global so can check current shot.
		
		//db.updateCurUsr(user);//Write out user to file linked to OBS
		//create a list of current 5 shots:
		var shotList = "FBot Queue:\n"+user+"\n";
		for(var i = 0; i < gCommUserQue.length; i++){
			//TBD: Abort after 5 or so.
			shotList+=gCommUserQue[i];
			if(i > 5){
				break;
			}
		}
		db.updateCurUsr(shotList);


		gCommandDone = false;
		//TBD: Update user on display.
		processCommands(commStr);
		console.log("CURRENT FBOT COMM BY: "+user);
  }
}
////////////////////////////////////////
function checkMag(){
	var value;

	if(fbotHW.magSensor != null){
		value = fbotHW.magSensor.scaleTo(0,1023);
		//console.log("Sensor: "+value);
		if(value > 500){
			gMagEmpty = true;
			gReloadMode = true;
		}else{
			gMagEmpty = false;
		}
	}
}
////////////////////////////////////////
function randomTurretCoord(fbotHW){
  var curTurretAngle;
  var min = Math.ceil(30);
  var max = Math.floor(81);

  curTurretAngle = Math.floor(Math.random() * (max-min)) + min;
  rotate(fbotHW.armR,curTurretAngle,750);
}
//////////////////////////////////////////
function randomWaistCoord(fbotHW){
  var curWaistAngle;

  var min = Math.ceil(45);
  var max = Math.floor(181);

  curWaistAngle = Math.floor(Math.random() * (max-min)) + min;
  rotate(fbotHW.waist,curWaistAngle,750);
}
//////////////////////////////////////////
function randomSpeed(fbotHW){
  var curSpeed;
  var min = Math.ceil(60);
  var max = Math.floor(200);//255

  curSpeed = Math.floor(Math.random() * (max-min)) + min;
  fbotHW.launcher.start(curSpeed);//Adjust Motor speed
}
//////////////////////////////////////////
/*function rotate(servo,angle, b180 = false, bfixJit = false ){
  var svoAngle = Math.round(angle/2); //map from 0-360 to 0-180
  if(servo){
    if(!b180){
      svoAngle = jitterFix(svoAngle);
      servo.to(svoAngle); //mapped angle. NOTE: Can add a time param to slow speed down
    }else{
      if(bfixJit == true){angle = jitterFix(angle);}
      servo.to(angle);//Actual passed angle. NOTE: Can add a time param to slow speed down
    }
  }
}*/

//////////////////////////////////////////
//Rotate Servo. Only valid for 0-180 servos.
function rotate(servo,angle, time = 400, bfixJit = false){
  if(servo){
      if(bfixJit == true){angle = jitterFix(angle);}
      servo.to(angle,time);//Use time to slow down transition
  }
}
//////////////////////////////////////////
//Rotates continuous servo a little bit
function increment(servo, bCW = true, speed){
  var svoSpeed = speed/10;

  if(servo && speed <= 10){
    if(speed == 0){
      servo.stop();
    }else{
      if(bCW){
        servo.cw(svoSpeed); //speed = .1 - 1
      }else{
        servo.ccw(svoSpeed);
      }
    }
  }
}

//////////////////////////////////////////
//Checks if requested angle is a number and in a safe range.
function posOK(pos, b180 = false){
  var bOK = false;

  if(!b180){
    if(!isNaN (pos) && pos <= 360 && pos >= 0){
      bOK = true;
    }
  }else{
    if(!isNaN (pos) && pos <= 180 && pos >= 0){
      bOK = true;
    }
  }
  return bOK;
}
//////////////////////////////////////////
//Fix chatter/jitter. When near servo limit makes noise. Back off a bit.
//Assumes 0-180 servos are used!
function jitterFix(angle){
    var fixedAngle = angle;

  if(angle == 0){
    fixedAngle = fixedAngle+5;
  }else if(angle == 180){
    fixedAngle = fixedAngle-5;
  }

  return fixedAngle;
}

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
/////////////////////////////////////////////////////////
  //Convert a Pbot pixel grid to fbot eye grid.
  //j1j2j3e4k5k6k7k8k9k10k11
  function buildFbotMap(pbMap){
    var i;
    var curColorChar;
    var curEyePix;
    var pixArray = pbMap.split(/[0-9]+/);//Get array of color letters, 144
    var rightEye = [1,24,25,48,49,72,73,96,97,120,121,144,143,122,119,98,95,74,71,50,47,26,23,2];
    var leftEye = [11,14,35,38,59,62,83,86,107,110,131,134,133,132,109,108,85,84,61,60,37,36,13,12];
    var fbMap = ''; //1 color char per pix, no number info.

    rightEye.reverse();//TBD: hardcode later
    leftEye.reverse();//TBD: Hardcode later.
    //ALCA: take it to chome dev tools to transform., Chrome->F12 run some code, copy paste result.
    //FF: under tools tab
    for(i = 0; i < 24; i++){
      //Left Eye
      curEyePix = leftEye[i] - 1;
      curColorChar = pixArray[curEyePix];
      //console.log("curColorChar: " + curColorChar);
      fbMap += curColorChar;
      //console.log("fbMap: " + fbMap);
    }
    for(i = 0; i < 24; i++){
      //Right Eye
      curEyePix = rightEye[i] - 1;
      curColorChar = pixArray[rightEye[i]-1];
      fbMap += curColorChar;
    }
    return fbMap;
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
	//Use 1 char for a color, no pix info, in order from 1-48
	function drawEyes(colorStr){
		var curColor;
		var pix;
		var commandStrLen;
		var curPix = 0;
	
		//Protect against empty command call.
		if(colorStr === undefined){
		  return;//do nothing, run away.
		}
	
		commandStrLen = colorStr.length;
		//console.log("LENGTH: " + commandStrLen);
	
		for (var i = 0; i < commandStrLen; i++) {
		if(isNaN(colorStr.charAt(i)) && colorStr.charAt(i) !=' '){
			curColor = getPictureColor(colorStr.charAt(i));
			pix = fbotHW.eyeStrip.pixel(curPix);
			pix.color(curColor);
			curPix++;
			if(curPix > 47)break;//No more pixels to process, leave.
		  }
		}
	  }
	/////////////////////////////////////////////////////////
	//loopFrames()
	//	Takes an array of RLE picture commands and displayes them based on time. Loops forever.
	//	TBD: Add param and associated command to only go through animation once. Useful for gaming/effects
	/////////////////////////////////////////////////////////
	function loopFramesEyes(time) {
	  var i = 0;
	  //console.log("ARRAY: " + gFBOTPicArray);
		gFBOTIntervalPtr = setInterval(function () {
			if (i == gFBOTPicArray.length) {i = 0;}
			drawEyes(gFBOTPicArray[i]);
			i++;
			fbotHW.eyeStrip.show();
		}, time);
	}
	
	/////////////////////////////////////////////////////////
	function clearEyes(){
	  if (gFBOTIntervalPtr != null) { clearInterval(gFBOTIntervalPtr); }
	  gFBOTPicArray = [];//Purge array
	  fbotHW.eyeStrip.color("#000000");
	  setTimeout(function () { fbotHW.eyeStrip.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
	}
	
	/////////////////////////////////////////////////////////
	//Simple boot animation for followBot Eyes.
	function powerupEyes(){
	  var time = 0;
	  clearEyes();
	  //Yellow Eyes opening
	  setTimeout(function () { processExtendedCommand("!fb1d.60e2f8e4f8e2f60e") }, time+=200);
	  setTimeout(function () { processExtendedCommand("!fb1d.48e2f8e4f8e4f8e4f8e2f48e") }, time+=200);
	  setTimeout(function () { processExtendedCommand("!fb1d.36e2f8e4f8e4f8e4f8e4f8e4f8e2f36e") }, time+=200);
	  setTimeout(function () { processExtendedCommand("!fb1d.24e2f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e2f24e") }, time+=200);
	  setTimeout(function () { processExtendedCommand("!fb1d.12e2f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e2f12e") }, time+=200);
	  setTimeout(function () { processExtendedCommand("!fb1d.2f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e2f4f8e4f8e4f8e4f8e4f8e2f") }, time+=200);
	}

	/////////////////////////////////////////////////////////////
function loopRadar(time) {
	var i = 0;
	  gRadarIntervalPtr = setInterval(function () {
		  if (i == gRadarArray.length) {i = 0;}
		  moveRadar(gRadarArray[i]);
		  i++;
	  }, time);
  }

  //////////////////////////////////////////
  function moveRadar(commandStr){
	var data;
	var move;
	var speed;
	var delay;
  
	if(commandStr != 's'){
	  data = commandStr.split(/[0-9]+/);
	  move = data[1];//r,l,s
	  data = commandStr.split(/[a-z]+/);
	  speed = data[0];//0-9 , 0.01 - 0.09
	  delay = data[1];//ms
  
	  //For now, speed range is 1-9, or 0.01-0.09
	  if(speed > 9){
		speed = 9;
	  }else if(speed < 1){
		speed = 1;
	  }
	  speed = speed/100;
	}else{
	  move = 's';
	}
	
	switch(move){
	  case "r":
		fbotHW.radar.cw(speed);
		break;
	  case "l":
		fbotHW.radar.ccw(speed);
		break;
	  case "s":
	  fbotHW.radar.stop();
	  break;
	}
  }
//////////////////////////////////////////
module.exports.throwbbs = throwbbs;
//module.exports.magEmpty = magEmpty;
module.exports.addToQue = addToQue;
module.exports.processExtendedCommand = processExtendedCommand;
module.exports.setTMIClient = setTMIClient;