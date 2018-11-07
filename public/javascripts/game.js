var games = new Map();
module.exports = {
    incomingPlay: function (str) {
        //room_id #@# id_me #@# id_op #@# action #@# id_card #@# x #@# y
        var data = str.split("#@#");
        var game = get_game_state(data[0]);
        var player_me = check_player(game, data[1]);
        var player_op = check_player(game, data[2]);
        switch (data[3]) {
            case "endTurn":
                var card = remove_card_from_deck(player_op.deck[0], player_me)
                if (player_op.hand.length < 7) {
                    add_to_hand(card, player_op);
                }
                break;
            case "attack":

                break;
            case "summon":
                var card = get_card_from_array(data[4], player_me.hand);
                remove_card_from_hand(card, player_me);
                add_to_board(parseInt(data[5]), parseInt(data[6]), card, player_me, player_op);
                break;
            default:
                break;
        }
        var game = {
            player1: player_me,
            player2: player_op
        }
        set_game_state(data[0], game);
        send(data[0], game);
    },
    creategame: function (room, client1, client2) {
        var player1 = {
            id: 1,
            socket: client1.socket,
            hp: 30,
            mp: 0,
            deck: [],
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: []
        }
        var player2 = {
            id: 2,
            socket: client2.socket,
            hp: 30,
            mp: 0,
            deck: [],
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: []
        }
        var game = {
            player1: player1,
            player2: player2
        }
        var n = 0;
        for (var i = 0; i < 10; i++) {
            n++;
            var card = {
                id: "" + n
            }
            player1.deck.push(card);
            player2.deck.push(card);
        }
        set_game_state(room.id, game);
        send(room.id, game);
    },
    reconnect: function (client,room) {
        game=get_game_state(room);
        player=check_player(game,client.id);
        player.socket=client.socket;
    }
}
function send(room_id, game) {
    //me(hp,mp,deck_num,hand,board,graveyard) op(hp,mp,deck_num,hand_num,board,graveyard)
    
    var data1 = {
        id: game.player1.id,
        hp: game.player1.hp,
        mp: game.player1.mp,
        deck_num: game.player1.deck.length,
        hand: game.player1.hand,
        board: game.player1.board,
        graveyard: game.player1.graveyard,
    },
        data2 = {
            id: game.player2.id,
            hp: game.player2.hp,
            mp: game.player2.mp,
            deck_num: game.player2.deck.length,
            hand_num: game.player2.hand.length,
            board: game.player2.board,
            graveyard: game.player2.graveyard
        };
    game.player1.socket.emit('update', room_id, data1, data2);
    var data1 = {
        id: game.player2.id,
        hp: game.player2.hp,
        mp: game.player2.mp,
        deck_num: game.player2.deck.length,
        hand: game.player2.hand,
        board: game.player2.board,
        graveyard: game.player2.graveyard,
    },
        data2 = {
            id: game.player1.id,
            hp: game.player1.hp,
            mp: game.player1.mp,
            deck_num: game.player1.deck.length,
            hand_num: game.player1.hand.length,
            board: game.player1.board,
            graveyard: game.player1.graveyard
        };
    game.player2.socket.emit('update', room_id, data1, data2);
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
function get_card_from_array(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return arr[i];
        }
    }
}
function remove_card_from_hand(card, player) {
    player.hand.splice(player.hand.indexOf(card), 1);
    return card;
}
function remove_card_from_deck(card, player) {
    player.deck.splice(player.deck.indexOf(card), 1);
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