var twBotUsr = "Schmoopiie";
var twBotKey = "oauth:a29b68aede41e25179a66c5978b21437";

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
		username: twBotUsr,
		password: twBotKey
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