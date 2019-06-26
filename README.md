# labbots
node.js code that operates my Twitch chat-controlled bots during my stream: https://twitch.tv/laboratory424

# Things you’ll need:

* https://nodejs.org/en/ (JS Server)
* https://www.tmijs.org/ (To Talk to Twitch Chat)
* http://johnny-five.io/ (To Talk to Arduino running Firmata using Javascript)
* https://github.com/ajfisher/node-pixel (To control neopixels using Javascript)

# About Directories:

* ebot/ : Emoji Bot
* fbot/ : Follow Bot
* pbot/ : Pixel Bot
* xbot/ : Experimental Bot for testing new bots ideas.

# Known issues to resolve:

1. PixelBot: There is a random crash in pixelbot during an animation. I believe it is either a misuse of the interval on my part or a data collision on the Arduino. If the intervals are OK, then perhaps we can create a gating/handshake between the server and arduino to prevent data collisions. 

2. PixelBot: I am trying to move all pixelbot code from index.js to pbot.js. I managed to get it all moved over except any code dealing with handling animations and clearing panels. There are some odd dependencies between functions and the intervals which causes crashes, or a disconnect from the intervals.
