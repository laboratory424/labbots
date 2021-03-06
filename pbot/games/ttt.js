//TicTacToe
//Simple Game to experiment with game messaging and api.

var pbot = require('../pbot.js');
var tmi = require("tmi.js"); //so we have access to chat services.


var gChatClient;
var gXMoveArray = new Array(); //X moves
var gOMoveArray = new Array(); //O moves
var gCurTurn = 'x';
var gNumOfMoves = 0;
gWinCombos = [
    [1,2,3],
    [4,5,6],
    [7,8,9],
    [1,4,7],
    [2,5,8],
    [3,6,9],
    [7,5,3],
    [1,5,9]
];

/////////////////////////////////////////////////////
//TBD: Should take players names in to lock to users
function init(client){
    var color = '#6441a5'; //For now, just show a color to validate functional.
    var grid = "draw.1y1f6e1f6e1f6e1f2y1f6e1f3e11f2y1f6e1f6e1f6e1f2y1f6e1f6e1f6e1f2y1f6e1f6e1f6e1f2y11f12y.3e1f6e1f2y1f6e1f6e1f6e1f2y11f3e1f6e1f2y1f6e1f6e1f6e1f2y1f6e1f6e1f6e1f2y1f6e1f3e11f13y.12y11f2y1f6e1f6e1f6e1f2y1f6e1f6e1f6e1f2y1f6e1f6e1f6e1f2y11f3e1f6e1f2y1f6e1f6e1f6e1f1y.13y11f3e1f6e1f2y1f6e1f6e1f6e1f2y1f6e1f6e1f6e1f2y1f6e1f3e11f2y1f6e1f6e1f6e1f2y1f6e1f3e";
    
    //naughts and crosses but use squares and circles and call it "beans and toast"
    console.log("TIC TAC TOE");//Naughts and crosses.

    gChatClient = client;
    //Set Game mode?
    //Intro: future
    pbot.gameCommand(grid);//Wipe board and draw grid.
    //might animate the indexs of each square then empty grid
}

function endGame(){
    gXMoveArray = [];//clear moves
    gOMoveArray = [];
    gNumOfMoves = 0;
    console.log("END GAME");
    pbot.gameCommand("end");//Tell pbot we're done.
}

function ProcessCommand(commStr){
	var data;
    var xo;
    var pos;
    var pic;
	var commands = commStr.split(".", 145);
    //spilt letters from numbers
    data = commands[0].split(/[0-9]+/);
	xo = data[1];//x,o
    data = commands[0].split(/[a-z]+/);
    pos = data[0];//1-9
    //console.log("XO: "+ xo);
    //console.log("POS: "+ pos);
	switch(xo){
		case "x": //Draw X in position: 1x, 2x
            if(moveOK(pos, xo) == true){
                gXMoveArray.push(Number(pos));
                gNumOfMoves++;
                switch(pos){
                    case '1':
                        pic = "drawt.50e1a4e1a9e1a2e1a7e2a12e2a7e1a2e1a9e1a4e1a26e.144e.144e.144e"
                        break;
                    case '2':
                        pic = "drawt.57e1a3e1a21e2a21e1a3e1a33e.50e1a19e1a1e1a22e1a1e1a19e1a26e.144e.144e"
                        break;
                    case '3':
                        pic = "drawt.144e.52e1a4e1a5e1a2e1a11e2a8e2a11e1a2e1a5e1a4e1a28e.144e.144e"
                        break;
                    case '4':
                        pic = "drawt.4e2a11e1a2e1a5e1a4e1a112e.144e.112e1a4e1a5e1a2e1a11e2a4e.144e"
                        break;
                    case '5':
                        pic = "drawt.11e1a1e1a19e1a110e.1a21e1a3e1a117e.110e1a19e1a1e1a11e.117e1a3e1a21e1a"
                        break;
                    case '6':
                        pic = "drawt.144e.6e2a7e1a2e1a9e1a4e1a110e.144e.110e1a4e1a9e1a2e1a7e2a6e"
                        break;
                    case '7':
                        pic = "drawt.144e.144e.26e1a4e1a9e1a2e1a7e2a12e2a7e1a2e1a9e1a4e1a50e.144e"
                        break;
                    case '8':
                        pic = "drawt.144e.144e.33e1a3e1a21e2a21e1a3e1a57e.26e1a19e1a1e1a22e1a1e1a19e1a50e"
                        break;
                    case '9':
                        pic = "drawt.144e.144e.144e.28e1a4e1a5e1a2e1a11e2a8e2a11e1a2e1a5e1a4e1a52e"
                        break;
                }
                pbot.gameCommand(pic);
                gCurTurn = "o";
                checkForWin();
                checkForDraw();
            }
            break;
        case "o": //Draw O in position: 1o, 2o
            if(moveOK(pos, xo) == true){
                gOMoveArray.push(Number(pos));
                gNumOfMoves++;
                switch(pos){
                    case '1':
                        pic = "drawt.52e2c11e1c2e1c5e1c4e1c8e1c4e1c5e1c2e1c11e2c28e.144e.144e.144e"
                        break;
                    case '2':
                        pic = "drawt.59e1c1e1c19e1c4e1c19e1c1e1c35e.48e1c21e1c3e1c18e1c3e1c21e1c24e.144e.144e"
                        break;
                    case '3':
                        pic = "drawt.144e.54e2c7e1c2e1c9e1c4e1c4e1c4e1c9e1c2e1c7e2c30e.144e.144e"
                        break;
                    case '4':
                        pic = "drawt.2e1c4e1c9e1c2e1c7e2c114e.144e.114e2c7e1c2e1c9e1c4e1c2e.144e"
                        break;
                    case '5':
                        pic = "drawt.9e1c3e1c21e1c108e.2e1c19e1c1e1c119e.108e1c21e1c3e1c9e.119e1c1e1c19e1c2e"
                        break;
                    case '6':
                        pic = "drawt.144e.4e1c4e1c5e1c2e1c11e2c112e.144e.112e2c11e1c2e1c5e1c4e1c4e"
                        break;
                    case '7':
                        pic = "drawt.144e.144e.28e2c11e1c2e1c5e1c4e1c8e1c4e1c5e1c2e1c11e2c52e.144e"
                        break;
                    case '8':
                        pic = "drawt.144e.144e.35e1c1e1c19e1c4e1c19e1c1e1c59e.24e1c21e1c3e1c18e1c3e1c21e1c48e"
                        break;
                    case '9':
                        pic = "drawt.144e.144e.144e.30e2c7e1c2e1c9e1c4e1c4e1c4e1c9e1c2e1c7e2c54e"
                        break;
                }
                pbot.gameCommand(pic);
                gCurTurn = "x";
                checkForWin();
                checkForDraw();
            }
			break;
	}
}

function moveOK(move, who){
    var bIsOK = true;
    var coord = Number(move);

    //console.log("XARRAY: "+gXMoveArray);
    //console.log("OARRAY: "+gOMoveArray);

    if(coord < 1 || coord > 9){ //In range?
        bIsOK = false;
        gChatClient.action("laboratory424", "Move must be between 1-9.");
    }else if(who != 'x' && who != 'o'){
        gChatClient.action("laboratory424", "Invalid game character. Use x or o.");
        bIsOK = false;
    }else if(gOMoveArray.includes(coord) || gXMoveArray.includes(coord)){ //Already used
        gChatClient.action("laboratory424", "Move has already been used.");
        bIsOK = false;
    }else if(who != gCurTurn){
        gChatClient.action("laboratory424", "It's not your turn.");
        bIsOK = false;
    }

    return bIsOK;
}

function checkForWin(){
    var bWinner = false;
    var i;

    for(i = 0; i < gWinCombos.length;i++){
        //O Check
         if(gOMoveArray.includes(gWinCombos[i][0]) && gOMoveArray.includes(gWinCombos[i][1]) && gOMoveArray.includes(gWinCombos[i][2])){
            gChatClient.action("laboratory424", "O Wins!");
            bWinner = true;
            break;
         }
         //X Check
         if(gXMoveArray.includes(gWinCombos[i][0]) && gXMoveArray.includes(gWinCombos[i][1]) && gXMoveArray.includes(gWinCombos[i][2])){
            gChatClient.action("laboratory424", "X Wins!");
            bWinner = true;
            break;
         }
    }

    //Check For Draw? 

     //TEMP, Just close out the game. TBD: Fanfare, credit, etc
     if(bWinner){
        setTimeout(function () { endGame(); }, 5000);
     }

    return bWinner;
}

function checkForDraw(){
    var bDraw = false;
    var i;
    
    if(gNumOfMoves >= 9){
        gChatClient.action("laboratory424", "Draw! Game over man.");
        bDraw = false;
    }
    
     //TEMP, Just close out the game. TBD: Fanfare, credit, etc
     if(bDraw){
        setTimeout(function () { endGame(); }, 5000);
     }

    return bDraw;
}
/////////////////////////////////////////////////////
module.exports.init = init;
module.exports.endGame = endGame;
module.exports.ProcessCommand = ProcessCommand;