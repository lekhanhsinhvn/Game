module.exports = function (server) {
    var io = require("socket.io"),
        handle = require("./socket-handle"),
        gamejs=require("./game");
    // sockets 
    var socket = io.listen(server);
    socket.on("connection", function (client) {
        client.on("cmd", function (cmd) {
            handle.incomingCmd(cmd, client, socket);
        });
        client.on("play", function (room, me_id, op_id, msg) {
            gamejs.incomingPlay(room, me_id, op_id, msg, socket);
        });
        client.on("disconnect", function () {
            handle.disconnect(client, socket);
        });
    })
}