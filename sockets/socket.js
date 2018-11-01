module.exports = function (io) {
    var handle = require("./socket-handle");
    io.on("connection", function (client_socket) {
        client_socket.on("cmd", function (cmd) {
            handle.incomingCmd(cmd, client_socket);
        });
        client_socket.on("disconnect", function () {
            handle.disconnect(client);
        });
    })
}