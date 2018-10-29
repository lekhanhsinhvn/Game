var game=require("./game"),
    queued = [],
    rooms = [];
module.exports = {
    incomingCmd: function (cmd, client, socket) {
        console.log("recieved websocket cmd: " + cmd)
        cmd = cmd || "noop"
        console.dir(cmd)
        switch (cmd) {
            case "join":
                console.log("client " + client + " added to queue");
                makegameroom(client,socket);
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
    if (queued.length > 0) {
        client2 = queued.shift();
        console.log("make room " + client1.sessionId + ", " + client2.sessionId);
        var room={
            client1: 1,
            client2: 2
        };
        client1.join(room);
        client2.join(room);
        rooms.push(room);
        game.creategame(room,socket);
    }else{
        addPlayer(client);
    }
}