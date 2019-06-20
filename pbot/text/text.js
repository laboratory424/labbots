//Caution: this file needs to be cultivated to work. Some functions
//slammed here for now since they belong under text-handling.
//When tested though, basics did work.

/*
√1. FIgure proper storage of char data.
√2. Figure out how to read character from array.
√3. Figure out how to print character to pbot.
4. Figure out how to scroll a single char on/off pbot
5. Figure out how to scroll line of chars.
*/
// 5X7 CHARACTER MAPPINGS: http://orchardelica.com/wp/?page_id=170
// Represents column data
// More added later as I figure this out.
var chars = [];

chars["A"] = [ 0x7E, 0x11, 0x11, 0x11, 0x7E ];
chars["B"] = [ 0x7F, 0x49, 0x49, 0x49, 0x36 ];
chars["C"] = [ 0x3E, 0x41, 0x41, 0x41, 0x22 ];
chars["D"] = [ 0x7F, 0x41, 0x41, 0x22, 0x1C ];
chars["E"] = [ 0x7F, 0x49, 0x49, 0x49, 0x41 ];
chars["F"] = [ 0x7F, 0x09, 0x09, 0x09, 0x01 ];
chars["G"] = [ 0x3E, 0x41, 0x49, 0x49, 0x7A ];
chars["H"] = [ 0x7F, 0x08, 0x08, 0x08, 0x7F ];
chars["I"] = [ 0x00, 0x41, 0x7F, 0x41, 0x00 ];
chars["J"] = [ 0x20, 0x40, 0x41, 0x3F, 0x01 ];
chars["K"] = [ 0x7F, 0x08, 0x14, 0x22, 0x41 ];
chars["L"] = [ 0x7F, 0x40, 0x40, 0x40, 0x40 ];
chars["M"] = [ 0x7F, 0x02, 0x0C, 0x02, 0x7F ];
chars["N"] = [ 0x7F, 0x04, 0x08, 0x10, 0x7F ];
chars["O"] = [ 0x3E, 0x41, 0x41, 0x41, 0x3E ];
chars["P"] = [ 0x7F, 0x09, 0x09, 0x09, 0x06 ];
chars["Q"] = [ 0x3E, 0x41, 0x51, 0x21, 0x5E ];
chars["R"] = [ 0x7F, 0x09, 0x19, 0x29, 0x46 ];
chars["S"] = [ 0x46, 0x49, 0x49, 0x49, 0x31 ];
chars["T"] = [ 0x01, 0x01, 0x7F, 0x01, 0x01 ];
chars["U"] = [ 0x3F, 0x40, 0x40, 0x40, 0x3F ];
chars["V"] = [ 0x1F, 0x20, 0x40, 0x20, 0x1F ];
chars["W"] = [ 0x3F, 0x40, 0x30, 0x40, 0x3F ];
chars["X"] = [ 0x63, 0x14, 0x08, 0x14, 0x63 ];
chars["Y"] = [ 0x07, 0x08, 0x70, 0x08, 0x07 ];
chars["Z"] = [ 0x61, 0x51, 0x49, 0x45, 0x43 ];

chars["a"] =   [ 0x20, 0x54, 0x54, 0x54, 0x78 ];
chars["b"] =   [ 0x7F, 0x50, 0x48, 0x48, 0x30 ];
chars["c"] =   [ 0x38, 0x44, 0x44, 0x44, 0x20 ];
chars["d"] =   [ 0x38, 0x44, 0x44, 0x48, 0x7F ];
chars["e"] =   [ 0x38, 0x54, 0x54, 0x54, 0x18 ];
chars["f"] =   [ 0x08, 0x7E, 0x09, 0x01, 0x02 ];
chars["g"] =   [ 0x0C, 0x52, 0x52, 0x52, 0x3E ];
chars["h"] =   [ 0x7F, 0x08, 0x04, 0x04, 0x78 ];
chars["i"] =   [ 0x00, 0x44, 0x7D, 0x40, 0x00 ];
chars["j"] =   [ 0x20, 0x40, 0x44, 0x3D, 0x00 ];
chars["k"] =   [ 0x7F, 0x10, 0x28, 0x44, 0x00 ];
chars["l"] =   [ 0x00, 0x41, 0x7F, 0x40, 0x00 ];
chars["m"] =   [ 0x7C, 0x04, 0x18, 0x04, 0x78 ];
chars["n"] =   [ 0x7C, 0x08, 0x04, 0x04, 0x78 ];
chars["o"] =   [ 0x38, 0x44, 0x44, 0x44, 0x38 ];
chars["p"] =   [ 0x7C, 0x14, 0x14, 0x14, 0x08 ];
chars["q"] =   [ 0x08, 0x14, 0x14, 0x08, 0x7C ];
chars["r"] =   [ 0x7C, 0x08, 0x04, 0x04, 0x08 ];
chars["s"] =   [ 0x48, 0x54, 0x54, 0x54, 0x20 ];
chars["t"] =   [ 0x04, 0x3F, 0x44, 0x40, 0x20 ];
chars["u"] =   [ 0x3C, 0x40, 0x40, 0x20, 0x7C ];
chars["v"] =   [ 0x1C, 0x20, 0x40, 0x20, 0x1C ];
chars["w"] =   [ 0x3C, 0x40, 0x30, 0x40, 0x3C ];
chars["x"] =   [ 0x44, 0x28, 0x10, 0x28, 0x44 ];
chars["y"] =   [ 0x0C, 0x50, 0x50, 0x50, 0x3C ];
chars["z"] =   [ 0x44, 0x64, 0x54, 0x4C, 0x44 ];

chars["0"] = [ 0x3E, 0x51, 0x49, 0x45, 0x3E ];
chars["1"] = [ 0x00, 0x42, 0x7F, 0x40, 0x00 ];
chars["2"] = [ 0x42, 0x61, 0x51, 0x49, 0x46 ];
chars["3"] = [ 0x21, 0x41, 0x45, 0x4B, 0x31 ];
chars["4"] = [ 0x18, 0x14, 0x12, 0x7F, 0x10 ];
chars["5"] = [ 0x27, 0x45, 0x45, 0x45, 0x39 ];
chars["6"] = [ 0x3C, 0x4A, 0x49, 0x49, 0x30 ];
chars["7"] = [ 0x01, 0x71, 0x09, 0x05, 0x03 ];
chars["8"] = [ 0x36, 0x49, 0x49, 0x49, 0x36 ];
chars["9"] = [ 0x06, 0x49, 0x49, 0x29, 0x1E ];

/////////////////////////////////////////////////
exports.getChar = function(char){
	var charData;
	var binaryData;
	var binaryDataArray = [];
	var i;

	charData = chars[char];
	for(i = 0; i < 5; i++){
		binaryData = (charData[i]).toString(2);//convert first col to a binary string.
		//Conversion drops leading 0's. make sure always 7 bits of data. Add leading 0's
		while(binaryData.length < 7){
			binaryData = "0" + binaryData;
		}
		binaryDataArray.push(binaryData);
	}

  	return binaryDataArray;
}

/////////////////////////////////////////////////
exports.getStrBinary = function(str){
	var charData;
	var binaryData;
	var binaryDataArray = [];
	var i, j;
	var char;

	for(j = 0; j < str.length; j++){
		char = str[j];

		if(char == " "){
			binaryDataArray.push("0000000"); //Space is special case
		}else{
			charData = chars[char];
			for(i = 0; i < 5; i++){
				binaryData = (charData[i]).toString(2);//convert first col to a binary string.
				//Conversion drops leading 0's. make sure always 7 bits of data. Add leading 0's
				while(binaryData.length < 7){
					binaryData = "0" + binaryData;
				}
				binaryDataArray.push(binaryData);
			}
		}
	}

  	return binaryDataArray;
}

/////////////////////////////////////////////////
//For now, just print a char in the lower left corner
exports.printChar = function(char,startCol){
	var charData;
	var col;
	var row;
	var bRequestOK = false;

	startCol = Number(startCol);

	charData = this.getChar(char);

	for(col = 0; col < 5; col++){
		curcol = charData[col];
		for(row = 0; row < 7; row++){
			if(Number(curcol[row]) == 1){
				if(startCol+col <= 11){
					this.set_RCPixel(row+1, startCol+col+1, "#ff0000");
				}
			}
		}
	}

  	return bRequestOK;
}

/////////////////////////////////////////////////
//For now, just print a char in the lower left corner
exports.printStr = function(str,startCol){
	var strData = [];
	var strDataLen;
	//var col;
	var row;
	var bRequestOK = false;
	var i;
	var curcol;
	var charCol;

	startCol = Number(startCol);
	strData = this.getStrBinary(str);
	strDataLen = strData.length;
	console.log("STR DATA: "+strData);
	console.log("STR DATA LEN: "+strDataLen);

	//for(col = 0; col < 5; col++){
	for(charCol = 0; charCol < strDataLen; charCol++){
		curcol = strData[charCol];
		for(row = 0; row < 7; row++){
			if(Number(curcol[row]) == 1){
				if(startCol+charCol <= 11){
					this.set_RCPixel(row+1, startCol+charCol+1, "#ff0000");

					//I want the pixel number, save into array.
					//then generate RLE using

				}
			}
		}
	}

  	return bRequestOK;
}
/////////////////////////////////////////////////////////
//scrollText()
//	Might be better to create frames and then use animate frames
//	make a function that creates 1 frame at a time, append to frame array, use loopFrames
/////////////////////////////////////////////////////////
function scrollText(text, time) {
	var c = 12;

	gTextIntervalPtr = setInterval(function () {
		if (c == 1) {
			c = 12;
		}
		pbot.printStr2(text, c);
		c--;
		pbot.pbotHW.pbot1Strip.show();
	}, time);
}

/////////////////////////////////////////////////
/*exports.textToPanel = function(row, col, hexColor){

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
	  pix = this.strip.pixel(curPix-1);
	  if(pix !== null){
	  	pix.color(hexColor);
		bRequestOK = true;
	  }
  }

	  return bRequestOK;
  }*/