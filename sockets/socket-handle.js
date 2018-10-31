var game=require("../public/javascripts/game"),
    queued = [],
    rooms = [];
module.exports = {
    incomingCmd: function (cmd, client, socket) {
        console.log("recieved websocket cmd: " + cmd)
        cmd = cmd || "noop"
        var data=cmd.split("@#@");
        switch (data[0]) {
            case "join":
                console.log("client " + client + " added to queue");
                makegameroom(client,socket);
                break;
            case "play":
                console.log(data[1]);
                game.incomingPlay(data[1],socket);
                break;
            default:
                break;
        }
    },
    disconnect: function (client) {
        console.log("client " + client.sessionId + " disconnected");
        removePlayer(client);
    }
}

function addPlayer(client) {
    queued.push(client);
}
function removePlayer(client) {
    queued.slice(queued.indexOf(client));
}
function makegameroom(client1,socket) {
    /*
    if (queued.length > 0) {
        client2 = queued.shift();
        */
        console.log("make room " + client1.sessionId + ", ");
        var room="112312";
        client1.join(room);
        //client2.join(room);
        rooms.push(room);
        game.creategame(room,socket);
        /*
    }else{
        addPlayer(client);
    }*/
}