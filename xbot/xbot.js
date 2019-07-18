//FOR TESTING / EXPERIMENTAL / DEVELOPMENT
/*
//EXAMPLE HARDWARE INSTANTIATION
svo_c = new five.Servo.Continuous({pin:#, board:this.byId("XXXX")});
svo_i = new five.Servo({pin:#, board:this.byId("XXXX")});
led = new five.Led({pin:#, board:this.byId("XXXX")});
strip = new pixel.Strip({
  board: this.byId("XXXX"),
  controller: "FIRMATA",
  strips: [ {pin: #, length: ##}, ],
  gamma: 2.8,
});
*/
var pixel = require("node-pixel");
var five = require("johnny-five");
var ports = [
  { id: "XBOT", port: "COM5" }
  //{ id: "LBOT", port: "COM10" }
	//{ id: "TBOT", port: "COM10" }
  //MAC TESTING ONLY
	//{ id: "PBOT2", port: "/dev/cu.usbmodem1411" }, //Basic USB cable
	//{ id: "PBOT1", port: "/dev/cu.usbmodem14231" } //Sparkfun multi-USB cable
];

var xbotHW = {
  svo_c: null,    //continouous
  svo_i: null,    //indexed
  strip1: null,    //neopixel strip
  strip2: null,    //neopixel strip
	led: null       //Standard IO/LED
};

var gXBOT1IntervalPtr = null;
var gXBOT1PicArray = new Array();

var gRadarIntervalPtr = null;
var gRadarArray = new Array();

new five.Boards(ports).on("ready", function () {
	console.log("XBOT Board ready!");

	//XBOT
	  //xbot.xbotHW.svo_c = new five.Servo.Continuous({pin:10, board:this.byId("XBOT")});
	  xbotHW.svo_c = new five.Servo({pin:10, type: "continuous", board:this.byId("XBOT")});
	  //xbotHW.svo_i = new five.Servo({pin:9, board:this.byId("XBOT")});
	  //xbot.xbotHW.led = new five.Led({pin:2, board:this.byId("XBOT")});
	  xbotHW.strip1 = new pixel.Strip({
      board: this.byId("XBOT"),
	    controller: "I2CBACKPACK",
      strips:[0,0,48],
	  });
    init();
    
    	//LBOT
	//lights = new five.Led({pin:8, board:this.byId("LBOT")});
	//lights.off();

	//TBOT
	/*targ1 = new five.Sensor({pin:"A0", threshold: 100, board:this.byId("LBOT")});
	targ1.on("change", function() {
			console.log(this.value);//temp
		if(targ1.value > 100){
			console.log("HIT!");//temp
			//Could turn on LED like on LBOT
		}
	});*/
});

function init(){
    var color1 = '#FFFF00';//#FFFF00, daa520

    console.log("INIT!");//temp

    //var color2 = '#ff0000';
    //Strip1
    //xbotHW.strip1.color(color1);
    //xbotHW.strip1.show();
    powerupEyes();
    //Strip2
    //xbotHW.strip2.color(color2);
    //xbotHW.strip2.show();
    //IO,LED
    //xbotHW.led.blink(500);
    //xbotHW.led.off();
    //svo_i
    //rotate(xbotHW.svo_c,90,true);//Assume 0-180
    //svo_c
    xbotHW.svo_c.cw(.01);
    //xbotHW.svo_c.stop();
}
///////////////////////////////////////////////////////////
/*COMMANDS:
  svoi.[angleInDeg]
  svoc.cw, svoc.ccw, svox.stop
  str1.pix.[pixNumInt].[#hexcolor], str1.strip.[#hexcolor]
  str2.pix.[pixNumInt].[#hexcolor], str2.strip.[#hexcolor]
  led.on, led.off
*/
function processCommands(commStr){
  var commands = commStr.split(".");
  //var device = commands[0]; //!xb1, !xb1e, !xb1csv...
  //var data1 = commands[1];//time,angle,direction, pix/strip, on/off
  //var data2 = commands[2];//pix# / Hex color (strip)
  //var data3 = commands[3];//Hex color (pix)

  switch(commands[0]){
    case "svoi"://svo_i: Move to angle
      if(posOK(data1,true)){rotate(xbotHW.svo_i,data1,true);}
      break;
    case "svoc"://svo_c:
        console.log("IN SVOC COMMAND");
      switch(data1){
        case "cw":
          console.log("IN CW COMMAND");
          xbotHW.svo_c.cw(.1);
          break;
        case "ccw":
          console.log("IN CCW COMMAND");
          xbotHW.svo_c.ccw(.1);
          break;
        case "stop":
        console.log("IN STOP COMMAND");
        xbotHW.svo_c.stop();
        break;
      }
      break;
    case "str1"://strip: change pixel/color
      switch(data1){
        case "pix":
            //var pix = xbotHW.strip1.pixel(data1);
            //pix.color(data2);
            xbotHW.strip1.pixel(data2).color(data3);
            xbotHW.strip1.show();
          break;
        case "str":
          xbotHW.strip1.color(data2); //#ff00ff, must include hex number
          xbotHW.strip1.show();
          break;
      }
      break;
    case "led"://LED: on/off
      switch(data1){
        case "on":
          xbotHW.led.on();
          break;
        case "off":
          xbotHW.led.off();
          break;
      }
      break;
    case "!xb1r": //!xb1r.cw[speed], !xb1r.[s][dir][time]. !xb1r.2r300.3l400.0s300
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
    case "!xb1a"://Temp, for fbot eye animation/drawing. !xb1e.300.3j1e7k
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
          gXBOT1PicArray.push(fbotMap); //Push the 48pix map onto array.
        }
      }
      loopFramesEyes(time);//Loop forever.
      break;
    case "!xb1d"://Temp, for fbot eye animation/drawing. !xb1e.300.3j1e7k
      var fbotMap;
      var pbPixMap
      var i;

      clearEyes();
      pbPixMap = rleToPixPanel(commands[1]); //convert from rle to pix map
      //drawFbotEyes(pbPixMap);//Map to eyes and draw.
      fbotMap = buildFbotMap(pbPixMap)//convert from pbot map to fbot map
      gXBOT1PicArray.push(fbotMap);
      //console.log("ARRAY: "+gXBOT1PicArray);
      drawEyes(fbotMap);
      xbotHW.strip1.show();
      break;
    case "!xb1x":
      clearEyes();
      setTimeout(function () { xbotHW.strip1.show(); }, 300);
      break;
    case "!xb1p":
      var panelColor = commands[1];//hexcolor
      var isOK  = /^#[0-9A-F]{6}$/i.test(panelColor);
      if(isOK){
        clearEyes();
		    setTimeout(function (){xbotHW.strip1.color(panelColor); xbotHW.strip1.show();}, 500);
      }else{
        console.log("BAD HEX EYE COLOR: "+panelColor);
      }
      break;
    case "!xb1i":
      clearEyes();
      gRadarArray = [];//Purge array
      clearInterval(gRadarIntervalPtr);
      init();
      break;
    case "!zddt"://Experimental ZepDek Disco Tech
      //if(commands[1] == "on"){lights.on();}
      //if(commands[1] == "off"){lights.off();}
      break;
  }
}
//////////////////////////////////////////
/*
etisdew: const opts = {} opts.time = 100; settimeoutfoo(opts);
etisdew: then update via update to opts.time

Alca: Without the actual functionality:function setimeoutfoo(opts) { setTimeout(() => setimeoutfoo(opts), opts.time); }
browsers requestAnimationFrame canvas
can use pointer to timeout and clear.

https://codepen.io/Alca/pen/MMmKyx?editors=0010
*/
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
      xbotHW.svo_c.cw(speed);
      break;
    case "l":
      xbotHW.svo_c.ccw(speed);
      break;
    case "s":
    xbotHW.svo_c.stop();
    break;
  }
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
  //draw fbot eyes from an pbot map. Use for all in one convert and draw.
  //j1j2j3e4k5k6k7k8k9k10k11
  /*function drawFbotEyes(pbMap){
    var i;
    var curColorChar;
    var curEyePix;
    var pix;
    var pixArray = pbMap.split(/[0-9]+/);//Get array of color letters, 144
    //var rightEye = [1,24,25,48,49,72,73,96,97,120,121,144,143,122,119,98,95,74,71,50,47,26,23,2];
    //var leftEye = [11,14,35,38,59,62,83,86,107,110,131,134,133,132,109,108,85,84,61,60,37,36,13,12];
    var rightEye = [1,24,25,48,49,72,73,96,97,120,121,144,143,122,119,98,95,74,71,50,47,26,23,2];
    var leftEye = [11,14,35,38,59,62,83,86,107,110,131,134,133,132,109,108,85,84,61,60,37,36,13,12];
  
    rightEye.reverse();
    leftEye.reverse();

    for(i = 0; i < 24; i++){
      //Left Eye
      curEyePix = leftEye[i] - 1;
      curColorChar = pixArray[curEyePix];
      curHexColor = getPictureColor(curColorChar);
      pix = xbotHW.strip1.pixel(i);
      pix.color(curHexColor);
    }
    for(i = 0; i < 24; i++){
      //Right Eye
      curEyePix = rightEye[i] - 1;
      curColorChar = pixArray[rightEye[i]-1];
      curHexColor = getPictureColor(curColorChar);
      pix = xbotHW.strip1.pixel(i+24);
      pix.color(curHexColor);
    }
  }*/

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
        pix = xbotHW.strip1.pixel(curPix);
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
  //console.log("ARRAY: " + gXBOT1PicArray);
	gXBOT1IntervalPtr = setInterval(function () {
		if (i == gXBOT1PicArray.length) {i = 0;}
		drawEyes(gXBOT1PicArray[i]);
		i++;
		xbotHW.strip1.show();
	}, time);
}

/////////////////////////////////////////////////////////
function clearEyes(){
  if (gXBOT1IntervalPtr != null) { clearInterval(gXBOT1IntervalPtr); }
  gXBOT1PicArray = [];//Purge array
  xbotHW.strip1.color("#000000");
  setTimeout(function () { xbotHW.strip1.color("#000000") }, 100);//Necessary to make sure interval clears first. LAME!
}

/////////////////////////////////////////////////////////
//Simple boot animation for followBot Eyes.
function powerupEyes(){
  var time = 0;
  clearEyes();
  //Yellow Eyes opening
  setTimeout(function () { processCommands("!xb1d.60e2f8e4f8e2f60e") }, time+=200);
  setTimeout(function () { processCommands("!xb1d.48e2f8e4f8e4f8e4f8e2f48e") }, time+=200);
  setTimeout(function () { processCommands("!xb1d.36e2f8e4f8e4f8e4f8e4f8e4f8e2f36e") }, time+=200);
  setTimeout(function () { processCommands("!xb1d.24e2f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e2f24e") }, time+=200);
  setTimeout(function () { processCommands("!xb1d.12e2f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e2f12e") }, time+=200);
  setTimeout(function () { processCommands("!xb1d.2f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e4f8e2f4f8e4f8e4f8e4f8e4f8e2f") }, time+=200);
}

//////////////////////////////////////////
module.exports.processCommands = processCommands;