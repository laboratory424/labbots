var gSpeed = 100;
var gTurretAngle = 80;
var gWaistAngle = 120;
var gBallCount = 1;
//var gCheerBallInc = 25; //Every 25 bits adds a ball.
//var gMaxBalls = 6;//Maximum capacity to shoot.
//var gTotalBits = 5;
var gMagEmpty = false;
var gLostShots = 0;
//var gReloadMode = false;
//Queue Mgmt
var gCommandQue = new Array();
var gCommandDone = true;
var gFBOTCommandIntervalPtr = setInterval(processQueue,1000);

var fbotHW = {
	armR: null,
	armL: null,
	loader: null,
	waist: null,
	launcher: null,
	magSensor: null
};

///////////////////////////////////////////
//PUBLIC FUNCTIONS
///////////////////////////////////////////
function init(fbotHW){
  rotate2(fbotHW.armL,0,true);
	rotate2(fbotHW.armR,gTurretAngle,true);//30 - 120 valid for this servo!
	rotate2(fbotHW.waist,gWaistAngle,true);//45-180 safe for now
	rotate2(fbotHW.loader,100,true);
	fbotHW.launcher.stop();//make sure off.
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
function addToQue(client, user, commStr, byPassValidation = false){
	var cleanCommStr = "";

	if(!byPassValidation){
		cleanCommStr = validateCommand(client, user, commStr); //returns "" if bad and handles error to user.
		
	}else{
		cleanCommStr = commStr;
	}
	
  if(cleanCommStr != ""){
		//if byPass = false, can respond to user: where in que. push returns array len.
		cleanCommStr+=".cmdone";//Add queue mgmt flag
		gCommandQue.push(cleanCommStr);
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
			if(posOK(angle,true)){rotate2(fbotHW.armL,angle,true);}
			break;
		case "la"://PPB Loader
			if(angle <= 180 && angle >= 0){rotate2(fbotHW.loader,angle,true);}
			break;
		case "ta":
			if(posOK(angle,true)){
				gTurretAngle = angle;
				rotate2(fbotHW.armR,gTurretAngle,true,true);
			}
			break;
		case "wa":
			if(posOK(angle,true)){
				gWaistAngle = angle;
				rotate2(fbotHW.waist,angle,true);
			}
    	break;
		case "ms":
			launcher.start(gSpeed);
			break;
		case "mx":
			launcher.stop();
			break;
		case "s":
				gSpeed = angle;
				if(gSpeed < 50){gSpeed = 50;}//temp, until replace motors.
				if(angle > 200){gSpeed = 200;}
			break;
		case "wc":
			gWaistAngle = 120;
			rotate2(fbotHW.waist,gWaistAngle,true);
			break;
		case "tc":
			gTurretAngle = 80;
			rotate2(fbotHW.armR,gTurretAngle,true);
			break;
		case "fire":
			if(angle == ""){angle = 1;}
			time += randomFire(angle,time);
			break;
    case "reload":
				//gReloadMode = false;
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
			setTimeout(function(){gCommandDone = true;console.log("CommDone Reset.");}, time+=300);//Give previous command time to chill.
			break;
		}
	}
}

//////////////////////////////////////////
// Random fire handles all shooting. Current behavior is first shot is wherever it is pointed.
// Other consecutive shots are random. Future: firing patterns. Queue works ok, but current
// command sequence is lost if mag is emptied during sequence. Issue with losing coords if resume
// too.
/*
  Alca: You can write lambda functions like this: "() => {}" -- then you don't
  need the function keyword "function() {}". And you can even drop the
  brackets for implicit return (not that setTimeout cares about the return,
  so it's just convenience)
  Check this: setTimeout(() => something.andThis(), 1000);

   setTimeout(() => fbotHW.launcher.start)gSpeed), time += 200);
  */

function randomFire(balls, time){
		//checkMag();
		if(!gMagEmpty){
			for(var i = 0; i < balls; i++){
				if(i == 0){//Startup case
					setTimeout(function(){checkMag()}, time +=200);
					//setTimeout(function(){if(gMagEmpty){gLostShots++}}, time +=200);
					setTimeout(function(){if(!gMagEmpty){fbotHW.launcher.start(gSpeed)}}, time+=200); //Speed motor up
					setTimeout(function(){if(!gMagEmpty){rotate2(fbotHW.loader,165,true)}}, time+=2500); //2500, Wait for motor, Drop Ball
					setTimeout(function(){if(!gMagEmpty){rotate2(fbotHW.loader,70,true)}}, time+=500); //Push into motor
					setTimeout(function(){if(!gMagEmpty){rotate2(fbotHW.loader,100,true)}}, time+=1000); //Return to start pos
				}else{
					setTimeout(function(){checkMag()}, time +=200);
					//setTimeout(function(){if(gMagEmpty){gLostShots++}}, time +=200);
					setTimeout(function(){if(!gMagEmpty){randomSpeed(fbotHW)}}, time+=200);//Adjust Motor speed
					setTimeout(function(){if(!gMagEmpty){randomWaistCoord(fbotHW)}}, time+=1000);//1000
					setTimeout(function(){if(!gMagEmpty){randomTurretCoord(fbotHW)}}, time+=300);
	
					setTimeout(function(){if(!gMagEmpty){rotate2(fbotHW.loader,165,true)}}, time+=300); //Wait for motor, Drop Ball
					setTimeout(function(){if(!gMagEmpty){rotate2(fbotHW.loader,70,true)}}, time+=500); //Push into motor
					setTimeout(function(){if(!gMagEmpty){rotate2(fbotHW.loader,100,true)}}, time+=500); //Return to start pos
				}
			}
			//ISSUE: If lost shot, lost coords. Could bypass center arm/waist. 
			//ISSUE: If crash, lose queue. So, need to write out.
			setTimeout(function(){rotate2(fbotHW.loader,100,true)}, time+=500); //Return to start pos
			setTimeout(function(){fbotHW.launcher.stop()}, time+=500); //Stop motor
			setTimeout(function(){rotate2(fbotHW.armR,80,true)}, time+=1000); //center arm
			setTimeout(function(){rotate2(fbotHW.waist,120,true)}, time+=1000); //center waist
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
function validateCommand(client, user, commStr){
	var bIsOK = true;
	var errMessage = "";
	var approvedChars = new RegExp("^[0-9A-Za-z.]+$");//only allow number and letters.
	var commands;
	var command;
	var partPos; //Array containing part index[0] and angle[1]
	var angle;
	var i;
	
	//Can only be a-z, A-Z, 0-9, period.
	//Note: If I included username at some point, may need to strip of name before check.
	if(bIsOK && !approvedChars.test(commStr)){
		errMessage = "Request contains invalid character.";
		bIsOK = false;
	}

	//TBD: should split commands and check for more than 4 commands. only 4 allowed.
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
					client.action("laboratory424","Magazine sensor value = "+ value);
					break;
				default:
						errMessage = "Request contains recongnized command."
						bIsOK = false;
					break;
				}
		}

	}

	if(!bIsOK){
		client.action("laboratory424",user['display-name'] + " " + errMessage);
		commStr = "";
	}

	return commStr;
}
////////////////////////////////////////
function processQueue(){
	var commStr;
	//console.log("commDome: "+gCommandDone);
	//console.log("gMag: "+gMagEmpty);
	//console.log("commArrLen: "+gCommandQue.length);
	checkMag();
	if(gCommandDone === true && !gMagEmpty && gCommandQue.length > 0){
    commStr = gCommandQue.shift();
		gCommandDone = false;
		processCommands(commStr);
		//console.log("commStr: "+commStr);
  }
}
////////////////////////////////////////
function checkMag(){
	var value;

	if(fbotHW.magSensor != null){
		value = fbotHW.magSensor.scaleTo(0,1023);
		//console.log("Sensor: "+value);
		if(value > 600){
			gMagEmpty = true;
			//gReloadMode = true;
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
  rotate2(fbotHW.armR,curTurretAngle,true);
}
//////////////////////////////////////////
function randomWaistCoord(fbotHW){
  var curWaistAngle;

  var min = Math.ceil(45);
  var max = Math.floor(181);

  curWaistAngle = Math.floor(Math.random() * (max-min)) + min;
  rotate2(fbotHW.waist,curWaistAngle,true);
}
//////////////////////////////////////////
function randomSpeed(fbotHW){
  var curSpeed;
  var min = Math.ceil(60);
  var max = Math.floor(255);

  curSpeed = Math.floor(Math.random() * (max-min)) + min;
  fbotHW.launcher.start(curSpeed);//Adjust Motor speed
}
//////////////////////////////////////////
function rotate(servo,angle, b180 = false, bfixJit = false ){
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
}

//////////////////////////////////////////
function rotate2(servo,angle, b180 = false, bfixJit = false){
  var svoAngle = Math.round(angle/2); //map from 0-360 to 0-180
  if(servo){
    if(!b180){
      svoAngle = jitterFix(svoAngle);
      servo.to(svoAngle); //mapped angle. NOTE: Can add a time param to slow speed down
    }else{
      if(bfixJit == true){angle = jitterFix(angle);}
      servo.to(angle,400);//Actual passed angle. NOTE: Can add a time param to slow speed down
    }
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

//////////////////////////////////////////
module.exports.fbotHW = fbotHW;
module.exports.init = init;
module.exports.throwbbs = throwbbs;
module.exports.magEmpty = magEmpty;
module.exports.addToQue = addToQue;