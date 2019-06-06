const EVENT_MAP = {
    "connected": readyMessage,
    "chat": chatProccesor
}

exports.registerHandlers = function (client) {
    Object.entries(EVENT_MAP).forEach(entry => {
        let event = entry[0];
        let event_func = entry[1];

        client.on(event, event_func);
        console.log("Registered event listner for", event);
    });
}

function readyMessage (address, port) {
	this.action("laboratory424", "KB-23 Bot Commander Ready...");
}

function chatProccesor (channel, user, message, self) {
	var bProcessed = false;

	if (!bProcessed) {
		bProcessed = processEvent(user, message);	//EVENTS
	}
	if (!bProcessed) {
		bProcessed = processUser(user, message);	//USER
	}
	if (!bProcessed) {
		bProcessed = processCommand(user, message);	//COMMANDS
	}
	if (!bProcessed) {
		bProcessed = ebot.processEmote(client, user, message);	//EMOTES
	}
}

function processEvent(user, message) {
    console.log("Foo");
}


function processUser(user, message) {
    console.log("Foo");
}


function processCommand(user, message) {
    console.log("Foo");
}


function processEmote(user, message) {
    console.log("Foo");
}