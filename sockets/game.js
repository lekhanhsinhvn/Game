const { User } = require('../models/user');
const { Card } = require('../models/card');
const { Deck } = require('../models/deck');
const _ = require('lodash');
var Timer = require('easytimer.js');
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
                endTurn(game, player_me, player_op)
                break;
            case "attack":
                if (player_me.turn == true && (card = get_card_from_array(data[3], player_me.board)) != undefined && card.card.status.includes("attackable")) {
                    if (parseInt(data[4]) > 0 && parseInt(data[5]) > 0 && (card_target = get_card_from_board(parseInt(data[4]), parseInt(data[5]), player_me, player_op)) != undefined) {
                        card_target.card.temp_health -= card.card.temp_attack;
                        add_to_board(parseInt(data[4]), parseInt(data[5]), card_target, player_me, player_op);
                    }
                    else {
                        player_op.hp -= card.card.temp_attack;
                    }
                    card.card.attackable = false;
                }
                break;
            case "summon":
                if (player_me.turn == true && (card = get_card_from_array(data[3], player_me.hand)) != undefined && card.card.status.includes("summonable")) {
                    remove_card_from_array(card, player_me.hand);
                    add_to_board(parseInt(data[4]), parseInt(data[5]), card, player_me, player_op);
                    player_me.mp-=card.card.temp_cost;
                }
                break;
            case "target":

                break;
            case "activate":

                break;
            default:
                break;
        }
        update_hand(player_me,player_op);
        update_broad(player_me, player_op);
        var temp = {
            timer: game.timer,
            player1: player_me,
            player2: player_op
        }
        set_game_state(room._id, temp);
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
        let deck1 = add_temp_attr((user1.deckSample).cardList)
        var player1 = {
            id: client1.id,
            name: client1.name,
            socket: client1.socket,
            turn: false,
            hp: 30,
            mp: 5,
            deck: _.shuffle(deck1),
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
        let deck2 = add_temp_attr((user2.deckSample).cardList)
        var player2 = {
            id: client2.id,
            name: client2.name,
            socket: client2.socket,
            turn: false,
            hp: 30,
            mp: 5,
            deck: _.shuffle(deck2),
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: []
        }
        var game = {
            turn_num:0,
            timer: new Timer(),
            player1: player1,
            player2: player2
        }
        game.timer.start({
            startValues: {
                minutes: 2,
            },
            target: {
                seconds: 0,
            },
            countdown: true,
        })
        game.timer.addEventListener("targetAchieved", function(){
            if (game.player1.turn == true) {
                endTurn(player1,player2);
            }else{
                endTurn(player2,player1);
            }
        })
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
    },
    surrender: function (room) {
        game = get_game_state(room._id);
        player_me.socket.emit();
        player_me.socket.emit();
        games.delete(room_id);
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
function remove_card_from_array(card, arr) {
    arr.splice(_.findIndex(arr, { _id: card._id }), 1);
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
function get_card_from_board(x, y, player_me, player_op) {
    var card = undefined;
    if (y == 1) {
        card = player_me.board[x];
    }
    else if (y == 0) {
        card = player_op.board[x];
    }
    return card;
}
function add_temp_attr(deck) {
    temp = [];
    deck.forEach(c => {
        let card = {
            _id: c._id,
            card: {
                _id: c.card._id,
                name: c.card.name,
                description: c.card.description,
                type: c.card.type,
                grade: c.card.grade,
                avatar: c.card.avatar,
                cost: c.card.cost,
                attack: c.card.attack,
                health: c.card.health,
                effect: c.card.effect,
                temp_cost: c.card.cost,
                temp_attack: c.card.attack,
                temp_health: c.card.health,
                status: "",
            }
        }
        temp.push(card);
    });
    return temp;
}
function reset_card(card) {
    card.card.temp_attack = card.card.attack;
    card.card.temp_health = card.card.health;
    card.card.temp_cost = card.card.cost;
    return card;
}
function update_broad(player_me, player_op) {
    for (let i = 0; i < player_me.board.length; i++) {
        if (player_me.board[i].card.temp_health <= 0) {
            let card = player_me.board[i];
            player_me.board[i] = undefined;
            reset_card(card);
            player_me.graveyard.push(card);
        }

    }
    for (let i = 0; i < player_op.board.length; i++) {
        if (player_op.board[i].card.temp_health <= 0) {
            let card = player_op.board[i];
            player_op.board[i] = undefined;
            reset_card(card);
            player_op.graveyard.push(card);
        }
    }
}
function update_hand(player_me,player_op) {
    for (let i = 0; i < player_me.hand.length; i++) {
        if (player_me.hand[i].card.temp_cost >= player_me.mp && player_me.turn == true) {
            player_me.hand[i].card.status += "summonable ";
        }
    }
    for (let i = 0; i < player_op.hand.length; i++) {
            player_op.hand[i].card.status.replace("summonable ","");
    }
}
function endTurn(game, player_me, player_op) {
    game.turn+=1;
    if (card = remove_card_from_array(player_op.deck[0], player_op.deck) != undefined) {
        if (player_op.hand.length < 5) {
            player_op.hand.push(card);
        }
    }
    if(game.turn<=10){
        player_op.mp+=game.turn;
    }else{
        player_op.mp+=10;
    }
    player_me.turn = false;
    player_op.turn = true;
    game.timer.reset();
}