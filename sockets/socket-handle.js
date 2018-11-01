var game=require("../public/javascripts/game"),
    queued = [],
    rooms = [];
module.exports = {
    incomingCmd: function (cmd, client_socket) {
        console.log("recieved websocket cmd: " + cmd)
        cmd = cmd || "noop"
        var data=cmd.split("@#@");
        switch (data[0]) {
            case "join":
                client={
                    id:data[1],
                    socket:client_socket
                }
                gameroom(client);
                break;
            case "play":
                console.log(data[1]);
                game.incomingPlay(data[1]);
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
function findroom(id){
    rooms.forEach(room => {
        if(room.player_ids.indexOf(id)){
            return room;
        }
    });
    return undefined;
}
function gameroom(client1) {
    room=findroom(client1.id);
    if(room!=undefined){
        client1.socket.join(room.id);
    }
    else if (queued.length > 0) {
        client2 = queued.shift();
        var room={
            id:"123",
            player_ids:[client1.id, client2.id]
        };
        rooms.push(room);
        game.creategame(room, client1, client2);
        console.log(room);
    }else{
        addPlayer(client1);
    }
}