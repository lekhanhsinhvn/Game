const _ = require('lodash');
var game = require("./game"),
    rooms = [];
const { User } = require('../models/user');
var online = [];
module.exports = {
    host: async function (user, io) {
        const acc = await User
            .findById(user._id)
            .select('-password')
            .populate({
                path: 'deckSample',
                populate: {
                    path: 'cardList.card',
                    model: 'Card'
                }
            })
        if ((acc.deckSample).cardList.length == 25) {
            if (find_room_of_user_as_player(user) == undefined) {
                var room = {
                    _id: user._id + Date.now(),
                    players: [user],
                    spectators: []
                };
                rooms.push(room);
                refreshRoom(io);
                user.socket.emit("room_id", room._id);
            } else user.socket.emit("err", "Already in a room");
        }
        else user.socket.emit("err", "Deck must have 25 cards");
    },
    join: async function (user, room_id, io) {
        const acc = await User
            .findById(user._id)
            .select('-password')
            .populate({
                path: 'deckSample',
                populate: {
                    path: 'cardList.card',
                    model: 'Card'
                }
            })
        if ((room = find_room_of_user_as_player(user)) != undefined) {
        }
        else {
            var room = _.find(rooms, { _id: room_id });
            if ((acc.deckSample).cardList.length == 25) {
                if (room != undefined && room.players.length == 1) {
                    game.creategame(user, room.players[0], room);
                    room.players.push(user);
                    _.remove(rooms, { _id: room_id });
                    rooms.push(room);
                    refreshRoom(io);
                } else user.socket.emit("err", "ERROR");
            }
            else user.socket.emit("err", "Deck must have 25 cards");
        }
    },
    random: async function (user, io) {
        const acc = await User
            .findById(user._id)
            .select('-password')
            .populate({
                path: 'deckSample',
                populate: {
                    path: 'cardList.card',
                    model: 'Card'
                }
            })
        if ((room = find_room_of_user_as_player(user)) != undefined) {
        }
        else {
            var room = _.shuffle(rooms)[0];
            if ((acc.deckSample).cardList.length == 25) {
                if (room != undefined && room.players.length == 1) {
                    game.creategame(user, room.players[0], room);
                    room.players.push(user);
                    _.remove(rooms, { _id: room._id });
                    rooms.push(room);
                    refreshRoom(io);
                } else user.socket.emit("err", "ERROR");
            }
            else user.socket.emit("err", "Deck must have 25 cards");
        }
    },
    play: function (user, play) {
        if ((room = find_room_of_user_as_player(user)) != undefined) {
            game.incomingPlay(room, play)
        }
    },
    reconnect: function (user, room_id) {
        if ((room = find_room_of_user_as_player(user)) != undefined && room_id == room._id) {
            (_.find(room.players, { _id: user._id })).socket_id = user.socket_id;
            (_.find(room.players, { _id: user._id })).socket = user.socket;
            game.reconnect(user, room)
        }
    },
    surrender: function (user, io) {
        if ((room = find_room_of_user_as_player(user)) != undefined) {
            game.surrender(room);
            // _.remove(rooms, { _id: room._id });
            // refreshRoom(io);
        }
    },
    leaveRoom: function (user, room_id, io) {
        if ((room = find_room_of_user_as_player(user)) != undefined && room_id == room._id) {
            _.remove(room.players, { _id: user._id });
            _.remove(room.spectators, { _id: user._id });
            user.socket.emit("err", "Leave Room");
            _.remove(rooms, { _id: room_id });
            refreshRoom(io);
        }
    },
    refreshRoom: function (io) {
        refreshRoom(io);
    },
    disconnect: function (client_socket, io) {
        for (let i = 0; i < rooms.length; i++) {
            if (_.find(rooms[i].players, { socket_id: client_socket.id }) != undefined && rooms[i].players.length == 1) {
                _.remove(rooms[i].players, { socket_id: client_socket.id });
            }
            if (_.find(rooms[i].spectators, { socket_id: client_socket.id }) != undefined) {
                _.remove(rooms[i].spectators, { socket_id: client_socket.id });
            }
        }
        refreshRoom(io)
    },
}
function refreshRoom(io) {
    _.remove(rooms, function (room) {
        if (room.players.length == 0)
            return room;
    });
    temp = [];
    rooms.forEach(room => {
        let players = [];
        for (let i = 0; i < room.players.length; i++) {
            user = {
                _id: room.players[i]._id,
                name: room.players[i].name
            }
            players.push(user);
        }
        r = {
            _id: room._id,
            players: players
        }
        temp.push(r);
    });
    io.sockets.emit('updateRooms', temp);
}
function find_room_of_user_as_player(user) {
    for (let i = 0; i < rooms.length; i++) {
        if (_.find(rooms[i].players, { _id: user._id }) != undefined) {
            return rooms[i];
        }
    }
    return undefined;
}
function find_room_of_user_as_spectators(user) {
    for (let i = 0; i < rooms.length; i++) {
        if (_.find(rooms[i].spectators, { _id: user._id }) != undefined) {
            return room[i];
        }
    }
    return undefined;
}