const _ = require('lodash');
var game = require("./game"),
    rooms = [];
const { User } = require('../models/user');
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
        if (find_room_of_user_as_player(user) == undefined && (acc.deckSample).cardList == 25) {
            var room = {
                _id: user._id + Date.now(),
                players: [user],
                spectators: []
            };
            rooms.push(room);
            refreshRoom(io);
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
            if (room.players.length == 1 && (acc.deckSample).cardList == 25) {
                game.creategame(user, room.players[0], room);
                room.players.push(user);
                _.remove(rooms, { _id: room_id });
                rooms.push(room);
                refreshRoom(io);
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
            if (room != undefined && room.players.length == 1 && (acc.deckSample).cardList == 25) {
                game.creategame(user, room.players[0], room);
                room.players.push(user);
                _.remove(rooms, { _id: room_id });
                rooms.push(room);
                refreshRoom(io);
            }
            else user.socket.emit("err", "Deck must have 25 cards");
        }
    },
    play: function (user, play) {
        if ((room = find_room_of_user_as_player(user)) != undefined) {
            game.incomingPlay(room, play)
        }
    },
    surrender: function (user, io) {
        if ((room = find_room_of_user_as_player(user)) != undefined) {
            game.endGame(room);
            _.remove(rooms, { _id: room._id });
            refreshRoom(io);
        }
    },
    refreshRoom: function (io) {
        refreshRoom(io);
    },
    disconnect: function (client_socket, io) {
        for (let i = 0; i < rooms.length; i++) {
            if (_.find(rooms[i].players, { socket_id: client_socket.id }) != undefined) {
                _.remove(rooms[i].players, { socket_id: client_socket.id });
            }
            if (_.find(rooms[i].spectators, { socket_id: client_socket.id }) != undefined) {
                _.remove(rooms[i].spectators, { socket_id: client_socket.id });
            }
        }
        refreshRoom(io)
    }
}
function refreshRoom(io) {
    _.remove(rooms, { players: [undefined] });
    temp = [];
    rooms.forEach(room => {
        r = {
            _id: room._id,
            players_name: _.map(room.players, 'name')
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