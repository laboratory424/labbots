var five = require("johnny-five");
var ports = [
	{ id: "EBOT", port: "COM4" }
];

var ebotHW = {
	led: null,
	eyeL: null,
	eyeR: null,
	mouth: null,
	browL: null,
	browR: null
};

new five.Boards(ports).on("ready", function () {
	console.log("EBOT Board ready!");

	//EBOT
	ebotHW.led = new five.Led({ pin: 10, board: this.byId("EBOT") });
	ebotHW.eyeL = new five.Servo({ pin: 11, board: this.byId("EBOT") });
	ebotHW.eyeR = new five.Servo({ pin: 9, board: this.byId("EBOT") });
	ebotHW.mouth = new five.Servo({ pin: 6, board: this.byId("EBOT") });
	ebotHW.browL = new five.Servo({ pin: 5, board: this.byId("EBOT") });
	ebotHW.browR = new five.Servo({ pin: 3, board: this.byId("EBOT") });
	init();
});

///////////////////////////////////////////
function init(){
	//Heartbeat.
	ebotHW.led.blink(500);
	//init bot positions.
	rotate(ebotHW.eyeR,0); rotate(ebotHW.eyeL,0); rotate(ebotHW.mouth,0); rotate(ebotHW.rowL,145,true); rotate(ebotHW.browR,45,true);
}

///////////////////////////////////////////
function processCommands(client, user, commStr){
  var commands = commStr.split(".");
  var command;
  var partPos; //Array containing part index[0] and angle[1]
  var angle;
  var i;
  var time = 0;//Set to 0. Appears test to right is old, outdated???for face design. For animation should be 1000

  //console.log("Ebot Comms: "+commStr);
  for (var i = 0; i < commands.length; i++){
    partPos = commands[i].split(/[0-9]+/);//Should break right after before the first number
    command = partPos[0];
    partPos = commands[i].split(/[a-z]+/);//Should break right after before the first number
    angle = partPos[1];
    switch(command){
      //PARTS
      case "re":
        if(posOK(angle)){rotate(ebotHW.eyeR,angle);}
        break;
      case "le":
        if(posOK(angle)){rotate(ebotHW.eyeL,angle);}
        break;
      case "m":
        if(posOK(angle)){rotate(ebotHW.mouth,angle);}
        break;
      case "rb":
        if(posOK(angle,true)){rotate(ebotHW.browR,angle,true);}
        break;
      case "lb":
        if(posOK(angle,true)){rotate(ebotHW.browL,angle,true);}
        break;
      case "es": //Both Eyes
        if(posOK(angle)){rotate(ebotHW.eyeR,angle);rotate(ebotHW.eyeL,angle);}
        break;
      case "bs": //Both Brows
        if(posOK(angle,true)){rotate(ebotHW.browR,angle,true);rotate(ebotHW.browL,angle,true);}
        break;
      //POSITIONS
      case "random":
        var aLe = Math.floor(Math.random() * 361); //random number, 0 - 360
        var aRe = Math.floor(Math.random() * 361);
        var aMo = Math.floor(Math.random() * 361);
        var aLb = Math.floor(Math.random() * 181); //random number, 0 - 180
        var aRb = Math.floor(Math.random() * 181);
        rotate(ebotHW.eyeR,aRe); rotate(ebotHW.eyeL,aLe); rotate(ebotHW.mouth,aMo); rotate(ebotHW.browR,aRb,true); rotate(ebotHW.browL,aLb,true);
        console.log("random");
        break;
      //Eyes: Left, Right, up, down, rightup, rightdown, leftup, leftdown
      case "esleft":
        rotate(ebotHW.eyeR,90); rotate(ebotHW.eyeL,90);
        console.log("esleft");
        break;
      case "esright":
        rotate(ebotHW.eyeR,270); rotate(ebotHW.eyeL,270);
        console.log("esright");
        break;
      case "esup":
        rotate(ebotHW.eyeR,0); rotate(ebotHW.eyeL,0);
        console.log("esup");
        break;
      case "esdown":
        rotate(ebotHW.eyeR,180); rotate(ebotHW.eyeL,180);
        console.log("esdown");
        break;
      case "esrightup":
        rotate(ebotHW.eyeR,315); rotate(ebotHW.eyeL,315);
        console.log("esrightup");
        break;
      case "esrightdown":
        rotate(ebotHW.eyeR,225); rotate(ebotHW.eyeL,225);
        console.log("esrightdown");
        break;
      case "esleftup":
        rotate(ebotHW.eyeR,45); rotate(ebotHW.eyeL,45);
        console.log("esleftup");
        break;
      case "esleftdown":
        rotate(ebotHW.eyeR,135); rotate(ebotHW.eyeL,135);
        console.log("esleftdown");
        break;
      case "esin":
        rotate(ebotHW.eyeR,90); rotate(ebotHW.eyeL,270);
        console.log("esin");
        break;
      case "esout":
        rotate(ebotHW.eyeR,270); rotate(ebotHW.eyeL,90);
        console.log("esout");
        break;
      //Brows: Left, Right, Up, Down, Flat
      case "bsleft":
        rotate(ebotHW.browR,60,true);rotate(ebotHW.browL,130,true);
        console.log("bsleft");
        break;
      case "bsright":
        rotate(ebotHW.browR,0,true);rotate(ebotHW.browL,110,true);
        console.log("bsright");
        break;
      case "bsup":
        rotate(ebotHW.browR,120,true);rotate(ebotHW.browL,70,true);
        console.log("bsup");
        break;
      case "bsflat":
        rotate(ebotHW.browR,45,true);rotate(ebotHW.browL,145,true);
        console.log("bsflat");
        break;
      //Mouth: Up, Down, Left, Right, rightup, rightdown, leftup, leftdown
      case "mup":
        rotate(ebotHW.mouth,0);
        console.log("mup");
        break;
      case "mdown":
        rotate(ebotHW.mouth,180);
        console.log("mdown");
        break;
      case "mleft":
        rotate(ebotHW.mouth,270);
        console.log("mleft");
        break;
      case "mright":
        rotate(ebotHW.mouth,90);
        console.log("mright");
        break;
      case "mrightup":
        rotate(ebotHW.mouth,45);
        console.log("mrightup");
        break;
      case "mleftup":
        rotate(ebotHW.mouth,315);
        console.log("mleftup");
        break;
      case "mleftdown":
        rotate(ebotHW.mouth,225);
        console.log("mleftdown");
        break;
      case "mrightdown":
        rotate(ebotHW.mouth,135);
        console.log("mleftdown");
        break;
      //EXPRESSIONS
      case "crazy":
        rotate(ebotHW.eyeR,0); rotate(ebotHW.eyeL,180); rotate(ebotHW.mouth,120); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,90,true);
        console.log("crazy");
        break;
      case "happy":
        rotate(ebotHW.eyeR,0); rotate(ebotHW.eyeL,0); rotate(ebotHW.mouth,0); rotate(ebotHW.browR,60,true); rotate(ebotHW.browL,120,true);
        console.log("happy");
        break;
      case "mad":
        rotate(ebotHW.eyeR,135); rotate(ebotHW.eyeL,225); rotate(ebotHW.mouth,180); rotate(ebotHW.browR,0,true); rotate(ebotHW.browL,180,true);
        console.log("mad");
        break;
      case "sad":
        rotate(ebotHW.eyeR,0); rotate(ebotHW.eyeL,0); rotate(ebotHW.mouth,180); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,120,true);
        console.log("sad");
        break;
      case "scared":
        rotate(ebotHW.eyeR,300); rotate(ebotHW.eyeL,300); rotate(ebotHW.mouth,60); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,90,true);
        console.log("scared");
        break;
      case "surprised":
        rotate(ebotHW.eyeR,180); rotate(ebotHW.eyeL,180); rotate(ebotHW.mouth,270); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,135,true);
        console.log("surprised");
        break;
      case "disgust":
        rotate(ebotHW.eyeR,90); rotate(ebotHW.eyeL,270); rotate(ebotHW.mouth,120); rotate(ebotHW.browR,20,true); rotate(ebotHW.browL,160,true);
        console.log("disgust");
        break;
      case "confused":
        rotate(ebotHW.eyeR,180); rotate(ebotHW.eyeL,0); rotate(ebotHW.mouth,320); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,90,true);
        console.log("confused");
        break;
      case "terror":
        rotate(ebotHW.eyeR,180); rotate(ebotHW.eyeL,180); rotate(ebotHW.mouth,230); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,90,true);
        console.log("terror");
        break;
      case "anticipation":
        rotate(ebotHW.eyeR,180); rotate(ebotHW.eyeL,180); rotate(ebotHW.mouth,230); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,90,true);
        console.log("anticipation");
        break;
      case "smug":
        rotate(ebotHW.eyeR,90); rotate(ebotHW.eyeL,270); rotate(ebotHW.mouth,320); rotate(ebotHW.browR,20,true); rotate(ebotHW.browL,90,true);
        console.log("smug");
        break;
      case "devious":
        rotate(ebotHW.eyeR,135); rotate(ebotHW.eyeL,225); rotate(ebotHW.mouth,0); rotate(ebotHW.browR,0,true); rotate(ebotHW.browL,180,true);
        console.log("devious");
        break;
      case "drunk":
        rotate(ebotHW.eyeR,30); rotate(ebotHW.eyeL,230); rotate(ebotHW.mouth,130); rotate(ebotHW.browR,45,true); rotate(ebotHW.browL,160,true);
        console.log("drunk");
        break;
	case "lookl"://look left
		animate(ebotHW,0,0,0,45,145,time+=100);
		animate(ebotHW,90,90,45,45,145, time+=1000);
		animate(ebotHW,0,0,0,45,145,time+=2500);
		console.log("lookl");
		break;
	case "lookld"://Look left-down
		animate(ebotHW,0,0,0,45,145,time+=100);
		animate(ebotHW,135,135,315,45,145,time+=1000);
		animate(ebotHW,0,0,0,45,145,time+=2500);
		console.log("lookld");
		break;
	case "lookr"://look right
		animateES(ebotHW,0,0,time+=100);
		animateES(ebotHW,270,270, time+=1000);
		animateES(ebotHW,0,0,time+=2500);
		console.log("lookr");
		break;
	case "spin"://look right
		animateES(ebotHW,360,360,time+=100);
		animateES(ebotHW,0,0, time+=1000);
		//animateES(0,0,time+=2500);
		console.log("spin");
		break;
	case "spino"://look right
		animateES(ebotHW,360,0,time+=100);
		animateES(ebotHW,0,360, time+=1000);
		//animateES(0,0,time+=2500);
		console.log("spin");
		break;
	case "catclock"://look right
		animateES(ebotHW,210,210,time+=100);
		animateES(ebotHW,150,150, time+=300);
		animateES(ebotHW,210,210, time+=600);
		animateES(ebotHW,150,150, time+=900);
		animateES(ebotHW,210,210, time+=1200);
		animateES(ebotHW,150,150, time+=1500);
		//animateES(0,0,time+=2500);
		console.log("spin");
		break;
	case "confused": //Cross-eyed and confused.
		//!eb1.re50.le310
		animateES(ebotHW,50,310,time+=100);
		animateES(ebotHW,30,330, time+=300);
		animateES(ebotHW,80,290, time+=600);
		animateES(ebotHW,30,330, time+=900);
		animateES(ebotHW,80,290, time+=1200);
		animateES(ebotHW,30,330, time+=1500);
		console.log("wigbs");
		break;
	case "wigbs": //Wiggle brows flat/up/down
		var wiggle = 40;
		animateBS(ebotHW,45,145,time+=100);
		animateBS(ebotHW,45+wiggle,145-wiggle,time+=300);
		animateBS(ebotHW,45,145,time+=400);
		animateBS(ebotHW,45+wiggle,145-wiggle,time+=500);
		animateBS(ebotHW,45,145,time+=600);
		console.log("wigbs");
		break;
		//TBD
		//Eyepanning up/down.
		//wiperbrows (sync with cat clock)
		//panbrows
		//Mouth oscillation at different angels.
		//spin mouth
		//maybe eyes move 45 from 0 - 360 then quickly back to 0? like he's looking around?
    }
  }
}

//////////////////////////////////////////
function processEmote(client, user, message){
  var time = 1000;

  //Ideas for Subs: Animated emotes instead of basic static. Access to other emotes like LUL.
  var bProcessed = false;

  if(message.includes("FeelsBadMan")){
	  rotate(ebotHW.eyeR,180); rotate(ebotHW.eyeL,180); rotate(ebotHW.mouth,150); rotate(ebotHW.browL,145,true); rotate(ebotHW.browR,25,true);
	  bProcessed = true;
  }else if(message.includes("FeelsGoodMan")){
	  rotate(ebotHW.eyeR,0); rotate(ebotHW.eyeL,0); rotate(ebotHW.mouth,0); rotate(ebotHW.browL,120,true); rotate(ebotHW.browR,60,true);
	  bProcessed = true;
  }else if(message.includes("PogChamp")){
	  rotate(ebotHW.eyeR,125); rotate(ebotHW.eyeL,125); rotate(ebotHW.mouth,225); rotate(ebotHW.browL,175,true); rotate(ebotHW.browR,60,true);
	  bProcessed = true;
  }else if(message.includes("Kappa")){
	  rotate(ebotHW.eyeR,270); rotate(ebotHW.eyeL,270); rotate(ebotHW.mouth,0); rotate(ebotHW.browL,140,true); rotate(ebotHW.browR,30,true);
	  bProcessed = true;
  }else if(message.includes("TriHard")){
	  rotate(ebotHW.eyeR,20); rotate(ebotHW.eyeL,20); rotate(ebotHW.mouth,320); rotate(ebotHW.browL,160,true); rotate(ebotHW.browR,10,true);
	  bProcessed = true;
  }else if(message.includes("4Head")){
	  rotate(ebotHW.eyeR,30); rotate(ebotHW.eyeL,330); rotate(ebotHW.mouth,320); rotate(ebotHW.browL,160,true); rotate(ebotHW.browR,10,true);
	  bProcessed = true;
  }else if(message.includes("cmonBruh")){
	  rotate(ebotHW.eyeR,300); rotate(ebotHW.eyeL,310); rotate(ebotHW.mouth,130); rotate(ebotHW.browL,120,true); rotate(ebotHW.browR,0,true);
	  bProcessed = true;
  }else if(message.includes("LUL")){
	  rotate(ebotHW.eyeR,300); rotate(ebotHW.eyeL,310); rotate(ebotHW.mouth,330); rotate(ebotHW.browL,90,true); rotate(ebotHW.browR,150,true);
	  bProcessed = true;
  }else if(message.includes("haHAA")){
	  rotate(ebotHW.eyeR,20); rotate(ebotHW.eyeL,350); rotate(ebotHW.mouth,0); rotate(ebotHW.browL,110,true); rotate(ebotHW.browR,40,true);
	  bProcessed = true;
  }else if(message.includes("laboraSnax")){
	  rotate(ebotHW.eyeR,320); rotate(ebotHW.eyeL,320); rotate(ebotHW.mouth,40); rotate(ebotHW.browL,150,true); rotate(ebotHW.browR,180,true);
	  bProcessed = true;
  }else if(message.includes("laboraIdea")){
	  rotate(ebotHW.eyeR,320); rotate(ebotHW.eyeL,320); rotate(ebotHW.mouth,330); rotate(ebotHW.browL,100,true); rotate(ebotHW.browR,180,true);
	  bProcessed = true;
  }else if(message.includes("labora8ball")){
	  rotate(ebotHW.eyeR,170); rotate(ebotHW.eyeL,190); rotate(ebotHW.mouth,0); rotate(ebotHW.browL,140,true); rotate(ebotHW.browR,20,true);
	  bProcessed = true;
  }else if(message.includes("MrDestructoid")){
	var aLe = Math.floor(Math.random() * 361); //random number, 0 - 360
	var aRe = Math.floor(Math.random() * 361);
	var aMo = Math.floor(Math.random() * 361);
	var aLb = Math.floor(Math.random() * 181); //random number, 0 - 180
	var aRb = Math.floor(Math.random() * 181);
	//(rePos,lePos,mPos,rbPos,lbPos,time)
	animate(ebotHW,aRe,aLe,aMo,aRb,aLb,time+=100);
	aLe = Math.floor(Math.random() * 361); //random number, 0 - 360
	aRe = Math.floor(Math.random() * 361);
	aMo = Math.floor(Math.random() * 361);
	aLb = Math.floor(Math.random() * 181); //random number, 0 - 180
	aRb = Math.floor(Math.random() * 181);
	animate(ebotHW,aRe,aLe,aMo,aRb,aLb,time+=500);
	aLe = Math.floor(Math.random() * 361); //random number, 0 - 360
	aRe = Math.floor(Math.random() * 361);
	aMo = Math.floor(Math.random() * 361);
	aLb = Math.floor(Math.random() * 181); //random number, 0 - 180
	aRb = Math.floor(Math.random() * 181);
	animate(ebotHW,aRe,aLe,aMo,aRb,aLb,time+=1000);
	aLe = Math.floor(Math.random() * 361); //random number, 0 - 360
	aRe = Math.floor(Math.random() * 361);
	aMo = Math.floor(Math.random() * 361);
	aLb = Math.floor(Math.random() * 181); //random number, 0 - 180
	aRb = Math.floor(Math.random() * 181);
	animate(ebotHW,aRe,aLe,aMo,aRb,aLb,time+=1500);
	aLe = Math.floor(Math.random() * 361); //random number, 0 - 360
	aRe = Math.floor(Math.random() * 361);
	aMo = Math.floor(Math.random() * 361);
	aLb = Math.floor(Math.random() * 181); //random number, 0 - 180
	aRb = Math.floor(Math.random() * 181);
	animate(ebotHW,aRe,aLe,aMo,aRb,aLb,time+=2000);
	bProcessed = true;
}else if(message.includes("gachiGASM")){
  rotate(ebotHW.eyeR,150); rotate(ebotHW.eyeL,150); rotate(ebotHW.mouth,40); rotate(ebotHW.browL,160,true); rotate(ebotHW.browR,30,true);
  bProcessed = true;
}
//TBD: gachiBASS, animate: Move eyes, brows, mouth in same direction.

return bProcessed;
}

//////////////////////////////////////////
//Rotates servo to angle
function rotate(servo,angle, b180 = false, bfixJit = false ){
  var svoAngle = Math.round(angle/2); //map from 0-360 to 0-180
  var timeDelay = 400;
  if(servo){
    if(!b180){
      svoAngle = jitterFix(svoAngle);
      servo.to(svoAngle,timeDelay); //mapped angle. NOTE: Can add a time param to slow speed down
    }else{
      if(bfixJit == true){angle = jitterFix(angle);}
      servo.to(angle,timeDelay);//Actual passed angle. NOTE: Can add a time param to slow speed down
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
function animate(ebotHW,rePos,lePos,mPos,rbPos,lbPos,time){
  setTimeout(function(){rotate(ebotHW.eyeR,rePos)}, time);
  setTimeout(function(){rotate(ebotHW.eyeL,lePos)}, time);
  setTimeout(function(){rotate(ebotHW.mouth,mPos)}, time);
  setTimeout(function(){rotate(ebotHW.browR,rbPos,true)}, time);
  setTimeout(function(){rotate(ebotHW.browL,lbPos,true)}, time);
}
function animateBS(ebotHW,rbPos,lbPos,time){
  setTimeout(function(){rotate(ebotHW.browR,rbPos,true)}, time);
  setTimeout(function(){rotate(ebotHW.browL,lbPos,true)}, time);
}
function animateES(ebotHW,rePos,lePos,time){
  setTimeout(function(){rotate(ebotHW.eyeR,rePos)}, time);
  setTimeout(function(){rotate(ebotHW.eyeL,lePos)}, time);
}
function animateM(ebotHW,mPos,time){
  setTimeout(function(){rotate(ebotHW.mouth,mPos)}, time);
}

/////////////////////////////////////////
module.exports.processCommands = processCommands;
module.exports.processEmote = processEmote;