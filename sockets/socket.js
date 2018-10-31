module.exports = function (io) {
    var handle = require("./socket-handle");
    io.on("connection", function (client) {
        client.on("cmd", function (cmd) {
            handle.incomingCmd(cmd, client, io);
        });
        client.on("disconnect", function () {
            handle.disconnect(client, io);
        });
    })
}