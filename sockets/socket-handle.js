var game = require("./game"),
    queued = [],
    rooms = [];
module.exports = {
    incomingCmd: function (cmd, client_socket) {
        console.log("recieved websocket cmd: " + cmd)
        cmd = cmd || "noop"
        var data = cmd.split("@#@");
        switch (data[0]) {
            case "join":
                client = {
                    id: data[1],
                    socket: client_socket
                }
                gameroom(client);
                break;
            case "play":
                var a = data[1].split("#@#");
                if (findroom(a[0]) != undefined) {
                    console.log(data[1]);
                    game.incomingPlay(data[1]);
                }
                break;
            default:
                break;
        }
    },
    disconnect: function (client) {
        console.log("client " + client.id + " disconnected");
        removePlayer(client);
    }
}

function addPlayer(client) {
    queued.push(client);
}
function removePlayer(client) {
    queued.slice(queued.indexOf(client));
}
function findroom(id) {
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.id == id) {
            return room;
        }
    }
    return undefined;
}
function findroom_client(id) {
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.player_ids.includes(id)) {
            return room;
        }
    }
    return undefined;
}
function gameroom(client1) {
    room = findroom_client(client1.id);
    if (room != undefined) {
        game.reconnect(client1, room);
        console.log("reconnect room " + room.id + " \nclient: " + client1.id);
    }
    else if (queued.length > 0 && (client2 = queued.shift()) != client1.id) {
        var room = {
            id: client1.id + client2.id + Date.now(),
            player_ids: [client1.id, client2.id]
        };
        console.log("make room " + room.id + " \nclient1: " + client1.id + " \nclient2: " + client2.id);
        rooms.push(room);
        game.creategame(room, client1, client2);
    } else {
        addPlayer(client1);
    }
}