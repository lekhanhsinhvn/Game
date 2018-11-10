const jwt = require('jsonwebtoken');
const config = require('config');
const { User } = require('../models/user');
const _ = require('lodash');
let user;
var online = [];
module.exports = function (io) {
    var handle = require("./socket-handle");
    io.use(async function (socket, next) {
        var token = socket.handshake.query.token;
        try {
            const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
            temp = await User.findById(decoded._id).select('-password');
            user = {
                _id: temp._id + "",
                name: temp.name,
                socket: socket,
                socket_id: socket.id
            }
            online.push(user);
            socket.emit("id", user._id);
            next();
        }
        catch (ex) {
            next(new Error("not authorized"));
        }
    });

    io.on("connection", function (client_socket) {
        client_socket.on("refreshRoom", function () {
            handle.refreshRoom(io);
        });
        client_socket.on("host", function (id) {
            if ((user = findUser(id)) != undefined)
                handle.host(user, io);
        });
        client_socket.on("join", function (id, room_id) {
            if ((user = findUser(id)) != undefined)
                handle.join(user, room_id, io);
        });
        client_socket.on("random", function (id) {
            if ((user = findUser(id)) != undefined)
                handle.random(user, io);
        });
        client_socket.on("play", function (id, play) {
            if ((user = findUser(id)) != undefined)
                handle.play(user, play);
        });
        client_socket.on("chat", function (id, room_id, chat) {
            if ((user = findUser(id)) != undefined)
                handle.chat(user, room_id, chat);
        });
        client_socket.on("surrender", function (id) {
            if ((user = findUser(id)) != undefined)
                handle.surrender(user, io);
        });
        client_socket.on("disconnect", function () {
            handle.disconnect(client_socket, io);
            _.remove(online, { socket_id: client_socket.id });
        });
    })
    function findUser(id) {
        return _.find(online, { _id: id });
    }
}