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

var xbotHW = {
  svo_c: null,    //continouous
  svo_i: null,    //indexed
  strip1: null,    //neopixel strip
  strip2: null,    //neopixel strip
	led: null       //Standard IO/LED
};

function init(){
    var color1 = '#6441a5';
    //var color2 = '#ff0000';
    //Strip1
    xbotHW.strip1.color(color1);
    xbotHW.strip1.show();
    //Strip2
    //xbotHW.strip2.color(color2);
    //xbotHW.strip2.show();
    //IO,LED
    //xbotHW.led.blink(500);
    xbotHW.led.off();
    //svo_i
    rotate(xbotHW.svo_c,90,true);//Assume 0-180
    //svo_c
    //xbotHW.svo_c.cw(.3);
    xbotHW.svo_c.stop();
}
///////////////////////////////////////////////////////////
/*COMMANDS:
  svoi.[angleInDeg]
  svoc.cw, svoc.ccw
  str1.pix.[pixNumInt].[#hexcolor], str1.strip.[#hexcolor]
  str2.pix.[pixNumInt].[#hexcolor], str2.strip.[#hexcolor]
  led.on, led.off
*/
function processCommands(commStr){
  var commands = commStr.split(".");
  var device = commands[0];
  var data1 = commands[1];//angle,direction, pix/strip, on/off
  var data2 = commands[2];//pix# / Hex color (strip)
  var data3 = commands[3];//Hex color (pix)

  switch(device){
    case "svoi"://svo_i: Move to angle
      if(posOK(data1,true)){rotate(xbotHW.svo_i,data1,true);}
      break;
    case "svoc"://svo_c:
        console.log("IN SVOC COMMAND");
      switch(data1){
        case "cw":
            console.log("IN CW COMMAND");
          xbotHW.svo_c.cw(.5);
          break;
        case "ccw":
            console.log("IN CCW COMMAND");
          xbotHW.svo_c.ccw(.5);
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



//////////////////////////////////////////
module.exports.xbotHW = xbotHW;
module.exports.init = init;
module.exports.processCommands = processCommands;