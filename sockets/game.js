const { User } = require('../models/user');
const { Card } = require('../models/card');
const { Deck } = require('../models/deck');
const _ = require('lodash');
var games = new Map();
module.exports = {
    incomingPlay: function (room, play) {
        //id_me #@# id_op #@# action #@# id_card #@# x #@# y
        var data = play.split("#@#");
        var game = get_game_state(room._id);
        var player_me = check_player(game, data[0]);
        var player_op = check_player(game, data[1]);
        switch (data[2]) {
            case "endTurn":
                var card = remove_card_from_deck(player_op.deck[0], player_op)
                if (player_op.hand.length < 5) {
                    add_to_hand(card, player_op);
                }
                player_me.turn = false;
                player_op.turn = true;
                break;
            case "attack":
                if (player_me.turn == true) {

                }
                break;
            case "summon":
                if (player_me.turn == true) {
                    var card = get_card_from_array(data[3], player_me.hand);
                    remove_card_from_hand(card, player_me);
                    add_to_board(parseInt(data[4]), parseInt(data[5]), card, player_me, player_op);
                }
                break;
            default:
                break;
        }
        var game = {
            player1: player_me,
            player2: player_op
        }
        set_game_state(room._id, game);
        send(game);
    },
    creategame: async (client1, client2, room) => {
        const user1 = await User
            .findById(client1._id)
            .select('-password')
            .populate({
                path: 'deckSample',
                populate: {
                    path: 'cardList.card',
                    model: 'Card'
                }
            })
        var player1 = {
            id: client1.id,
            name: client1.name,
            socket: client1.socket,
            turn: false,
            hp: 30,
            mp: 0,
            deck: _.shuffle((user1.deckSample).cardList),
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: []
        }
        const user2 = await User
            .findById(client2._id)
            .select('-password')
            .populate({
                path: 'deckSample',
                populate: {
                    path: 'cardList.card',
                    model: 'Card'
                }
            })
        var player2 = {
            id: client2.id,
            name: client2.name,
            socket: client2.socket,
            turn: false,
            hp: 30,
            mp: 0,
            deck: _.shuffle((user2.deckSample).cardList),
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: []
        }
        var game = {
            player1: player1,
            player2: player2
        }
        set_game_state(room._id, game);
        send(game);
    },
    reconnect: function (user, room) {
        game = get_game_state(room._id);
        player_me = check_player(game, user._id);
        player_op = check_op(game, user._id);
        player_me.socket = user.socket;
        var game = {
            player1: player_me,
            player2: player_op
        }
        set_game_state(room._id, game);
        send(game);
    }
}
function send(game) {
    //me(hp,mp,deck_num,hand,board,graveyard) op(hp,mp,deck_num,hand_num,board,graveyard)

    var data1 = {
        id: game.player1.id,
        turn: game.player1.turn,
        hp: game.player1.hp,
        mp: game.player1.mp,
        deck_num: game.player1.deck.length,
        hand: game.player1.hand,
        board: game.player1.board,
        graveyard: game.player1.graveyard,
    },
        data2 = {
            id: game.player2.id,
            turn: game.player2.turn,
            hp: game.player2.hp,
            mp: game.player2.mp,
            deck_num: game.player2.deck.length,
            hand_num: game.player2.hand.length,
            board: game.player2.board,
            graveyard: game.player2.graveyard
        };
    game.player1.socket.emit('updateGame', data1, data2);
    var data1 = {
        id: game.player2.id,
        turn: game.player2.turn,
        hp: game.player2.hp,
        mp: game.player2.mp,
        deck_num: game.player2.deck.length,
        hand: game.player2.hand,
        board: game.player2.board,
        graveyard: game.player2.graveyard,
    },
        data2 = {
            id: game.player1.id,
            turn: game.player1.turn,
            hp: game.player1.hp,
            mp: game.player1.mp,
            deck_num: game.player1.deck.length,
            hand_num: game.player1.hand.length,
            board: game.player1.board,
            graveyard: game.player1.graveyard
        };
    game.player2.socket.emit('updateGame', data1, data2);
}
function set_game_state(room_id, game) {
    games.set(room_id, game);
}
function get_game_state(room_id) {
    return games.get(room_id);
}
function check_player(game, id) {
    if (game.player1.id == id) {
        return game.player1;
    }
    return game.player2;
}
function check_op(game, id) {
    if (game.player1.id != id) {
        return game.player1;
    }
    return game.player2;
}
function get_card_from_array(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return arr[i];
        }
    }
}
function remove_card_from_hand(card, player) {
    player.hand.splice(_.findIndex(player.hand, { _id: card._id }), 1);
    return card;
}
function remove_card_from_deck(card, player) {
    player.deck.splice(_.findIndex(player.deck, { _id: card._id }), 1);
    return card;
}
function add_to_hand(card, player) {
    player.hand.push(card);
    return card;
}
function add_to_deck(player, card) {
    player.deck.push(card);
    return card;
}
function add_to_graveyard(player, card) {
    player.graveyard.push(card);
    return card;
}
function add_to_board(x, y, card, player_me, player_op) {
    if (y == 1) {
        player_me.board[x] = card;
    }
    else if (y == 0) {
        player_op.board[x] = card;
    }
    return card;
}