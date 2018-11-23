const { User } = require('../models/user');
const { Card } = require('../models/card');
const { Deck } = require('../models/deck');
const _ = require('lodash');
var Timer = require('easytimer.js');
var games = new Map();
module.exports = {
    incomingPlay: function (room, play) {
        //id_me #@# id_op #@# action #@# id_card1 #@# x #@# y #@# id_card2
        //console.log(play);
        var delay = false;
        var data = play.split("#@#");
        var game = get_game_state(room._id);
        var player_me = check_player(game, data[0]);
        var player_op = check_player(game, data[1]);
        switch (data[2]) {
            case "endTurn":
                if (player_me.turn == true) {
                    endTurn(game, player_me, player_op);
                }
                break;
            case "attack":
                if (player_me.turn == true && (card = get_card_from_array(data[3], player_me.board)) != undefined && card.card.hidden.includes("attackable")) {
                    let guards = get_array_has_status("guard", player_op.board);
                    if ((card_target = get_card_from_array(data[6], player_op.board)) != undefined && card_target.card.hidden.includes("targetable")) {
                        card_target.card.temp_health -= card.card.temp_attack;
                        card.card.temp_health -= card_target.card.temp_attack;
                        if (!card_target.card.status.includes("boom")) {
                            card_target.card.status += "boom ";
                        }
                        add_to_board(player_op.board.indexOf(card_target), 0, card_target, player_me, player_op);
                    }
                    else if (guards.length == 0 && data[6] == "player") {
                        player_op.hp -= card.card.temp_attack;
                        if (!player_op.status.includes("boom")) {
                            player_op.status += "boom ";
                        }
                    }
                    if (!card.card.status.includes("boom")) {
                        card.card.status += "boom ";
                    }
                    add_to_board(player_op.board.indexOf(card), 1, card, player_me, player_op);
                    card.card.hidden = card.card.hidden.replace("attackable ", "");
                    card.card.hidden = card.card.hidden.replace("selected ", "");
                }
                reset_suggestion(player_me, player_op);
                delay = true;
                setTimeout(function () {
                    player_op.status = player_op.status.replace("boom ", "");
                    player_me.status = player_me.status.replace("boom ", "");
                    for (let i = 0; i < player_op.board.length; i++) {
                        if (player_op.board[i] != undefined && player_op.board[i] != "targetable")
                            player_op.board[i].card.status = player_op.board[i].card.status.replace("boom ", "");
                    }
                    for (let i = 0; i < player_me.board.length; i++) {
                        if (player_me.board[i] != undefined && player_me.board[i] != "targetable")
                            player_me.board[i].card.status = player_me.board[i].card.status.replace("boom ", "");
                    }
                    update_hand(game, player_me, player_op);
                    update_broad(game, player_me, player_op);
                    var temp = {
                        turn_num: game.turn_num,
                        timer: game.timer,
                        player1: player_me,
                        player2: player_op
                    }
                    set_game_state(room._id, temp);
                    send(room._id, temp);
                }, 800);
                if (player_op.hp <= 0) {
                    if (delay == true) {
                        setTimeout(function () {
                            game = undefined;
                            player_op.socket.emit("err", "YOU LOSE");
                            player_me.socket.emit("err", "YOU WIN");
                            games.delete(room._id);
                        }, 1000);
                    }
                }
                break;
            case "summon":
                if (player_me.turn == true && (card = get_card_from_array(data[3], player_me.hand)) != undefined && card.card.hidden.includes("summonable") == true && (zone = get_card_from_board(parseInt(data[4]), parseInt(data[5]), player_me, player_op)) != undefined && zone == "targetable") {
                    remove_card_from_array(card, player_me.hand);
                    add_to_board(parseInt(data[4]), parseInt(data[5]), card, player_me, player_op);
                    player_me.mp -= card.card.temp_cost;
                    card.card.hidden = card.card.hidden.replace("summonable ", "");
                    card.card.hidden = card.card.hidden.replace("selected ", "");
                    if (card.card.effect.event == "on_summon") {
                        eval(card.card.effect.code);
                    }
                }
                reset_suggestion(player_me, player_op);
                break;
            case "select":
                if (player_me.turn == true) {
                    if ((card = get_card_from_array(data[3], player_me.board)) != undefined) {
                        if (!card.card.hidden.includes("selected")) {
                            reset_suggestion(player_me, player_op);
                            if (card.card.hidden.includes("attackable")) {
                                card.card.hidden += "selected ";
                                let guards = get_array_has_status("guard", player_op.board);
                                if (guards.length > 0) {
                                    for (let i = 0; i < guards.length; i++) {
                                        guards[i].card.hidden += "targetable ";
                                    }
                                } else {
                                    for (let i = 0; i < player_op.board.length; i++) {
                                        if (player_op.board[i] != undefined && player_op.board[i] != "targetable")
                                            player_op.board[i].card.hidden += "targetable ";
                                    }
                                    if (!player_op.hidden.includes("targetable"))
                                        player_op.hidden += "targetable ";
                                }
                            }
                        }
                        else {
                            reset_suggestion(player_me, player_op);
                            card.card.hidden = card.card.hidden.replace("selected ", "");
                        }
                    }
                    if ((card = get_card_from_array(data[3], player_me.hand)) != undefined) {
                        if (!card.card.hidden.includes("selected")) {
                            reset_suggestion(player_me, player_op);
                            if (card.card.hidden.includes("summonable")) {
                                card.card.hidden += "selected ";
                                for (let i = 0; i < player_me.board.length; i++) {
                                    if (player_me.board[i] == undefined) {
                                        player_me.board[i] = "targetable";
                                    }
                                }
                            }

                        }
                        else {
                            reset_suggestion(player_me, player_op);
                            card.card.hidden = card.card.hidden.replace("selected ", "");
                        }
                    }
                }
                break;
            case "target":

                break;
            case "activate":

                break;
            default:
                break;
        }
        update_hand(game, player_me, player_op);
        update_broad(game, player_me, player_op);
        var temp = {
            turn_num: game.turn_num,
            timer: game.timer,
            player1: player_me,
            player2: player_op
        }
        set_game_state(room._id, temp);
        // if (delay == true) {
        //     setTimeout(function () {
        //         send(room._id, temp);
        //     }, 1000);
        // }
        // else
        send(room._id, temp);
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
            _id: client1._id,
            name: client1.name,
            socket: client1.socket,
            turn: false,
            hp: 30,
            mp: 5,
            deck: _.shuffle(deck1),
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: [],
            status: "",
            hidden: "",
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
            _id: client2._id,
            name: client2.name,
            socket: client2.socket,
            turn: false,
            hp: 30,
            mp: 5,
            deck: _.shuffle(deck2),
            hand: [],
            board: [undefined, undefined, undefined, undefined],
            graveyard: [],
            status: "",
            hidden: "",
        }
        var game = {
            turn_num: 0,
            timer: new Timer(),
            player1: player1,
            player2: player2
        }
        game.timer.start({
            startValues: {
                minutes: 1,
            },
            target: {
                seconds: 0,
            },
            countdown: true,
        })
        game.timer.addEventListener("targetAchieved", function (room) {
            if ((game_temp = get_game_state(room._id)) != undefined) {
                if (game_temp.player1.turn == true) {
                    endTurn(game_temp, game_temp.player1, game_temp.player2);
                    update_hand(game_temp, game_temp.player1, game_temp.player2);
                    update_broad(game_temp, game_temp.player1, game_temp.player2);
                } else {
                    endTurn(game_temp, game_temp.player2, game_temp.player1);
                    update_hand(game_temp, game_temp.player2, game_temp.player1);
                    update_broad(game_temp, game_temp.player2, game_temp.player1);
                }
                var temp = {
                    turn_num: game_temp.turn_num,
                    timer: game_temp.timer,
                    player1: game_temp.player1,
                    player2: game_temp.player2
                }
                set_game_state(room._id, temp);
                send(room._id, temp);
            }
        })
        for (let i = 0; i < 3; i++) {
            if ((card = remove_card_from_array(game.player1.deck[0], game.player1.deck)) != undefined) {
                if (game.player1.hand.length < 5) {
                    game.player1.hand.push(card);
                }
            }
            if ((card = remove_card_from_array(game.player2.deck[0], game.player2.deck)) != undefined) {
                if (game.player2.hand.length < 5) {
                    game.player2.hand.push(card);
                }
            }
        }
        player1 = _.sample([true, false])
        if (player1.turn == true) {
            update_hand(game, game.player1, game.player2);
        }
        else {
            player2.turn = true;
            update_hand(game, game.player2, game.player1);
        }
        set_game_state(room._id, game);
        send(room._id, game);
    },
    reconnect: function (user, room) {
        if ((game = get_game_state(room._id)) != undefined) {
            player_me = check_player(game, user._id);
            player_op = check_op(game, user._id);
            player_me.socket = user.socket;
            var temp = {
                turn_num: game.turn_num,
                timer: game.timer,
                player1: player_me,
                player2: player_op
            }
            set_game_state(room._id, temp);
            send(room._id, temp);
        }
    },
    surrender: function (room) {
        if ((game = get_game_state(room._id)) != undefined) {
            game = get_game_state(room._id);
            player_me = check_player(game, user._id);
            player_op = check_op(game, user._id);
            player_me.socket.emit("err", "YOU LOSE");
            player_op.socket.emit("err", "YOU WIN");
            games.delete(room._id);
        }
    }
}
function send(room_id, game) {
    //me(hp,mp,deck_num,hand,board,graveyard) op(hp,mp,deck_num,hand_num,board,graveyard)
    var data1 = {
        _id: game.player1._id,
        player_name: game.player1.name,
        turn: game.player1.turn,
        hp: game.player1.hp,
        mp: game.player1.mp,
        deck_num: game.player1.deck.length,
        hand: game.player1.hand,
        board: game.player1.board,
        graveyard: game.player1.graveyard,
        status: game.player1.status,
        hidden: game.player1.hidden,
    },
        data2 = {
            _id: game.player2._id,
            player_name: game.player2.name,
            turn: game.player2.turn,
            hp: game.player2.hp,
            mp: game.player2.mp,
            deck_num: game.player2.deck.length,
            hand_num: game.player2.hand.length,
            board: game.player2.board,
            graveyard: game.player2.graveyard,
            status: game.player2.status,
            hidden: game.player2.hidden,
        };
    game.player1.socket.emit('updateGame', room_id, game.timer.getTimeValues(), data1, data2);
    var data1 = {
        _id: game.player2._id,
        player_name: game.player2.name,
        turn: game.player2.turn,
        hp: game.player2.hp,
        mp: game.player2.mp,
        deck_num: game.player2.deck.length,
        hand: game.player2.hand,
        board: game.player2.board,
        graveyard: game.player2.graveyard,
        status: game.player2.status,
        hidden: game.player2.hidden,
    },
        data2 = {
            _id: game.player1._id,
            player_name: game.player1.name,
            turn: game.player1.turn,
            hp: game.player1.hp,
            mp: game.player1.mp,
            deck_num: game.player1.deck.length,
            hand_num: game.player1.hand.length,
            board: game.player1.board,
            graveyard: game.player1.graveyard,
            status: game.player1.status,
            hidden: game.player1.hidden,
        };
    game.player2.socket.emit('updateGame', room_id, game.timer.getTimeValues(), data1, data2);
}
function set_game_state(room_id, game) {
    games.set(room_id, game);
}
function get_game_state(room_id) {
    return games.get(room_id);
}
function check_player(game, id) {
    if (game.player1._id == id) {
        return game.player1;
    }
    return game.player2;
}
function check_op(game, id) {
    if (game.player1._id != id) {
        return game.player1;
    }
    return game.player2;
}
function get_card_from_array(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != undefined && arr[i]._id == id) {
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
                hidden: "",
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
function update_broad(game, player_me, player_op) {
    for (let i = 0; i < player_me.board.length; i++) {
        if (player_me.board[i] != undefined && typeof (player_me.board[i]) === 'object' && player_me.board[i].card.temp_health <= 0) {
            let card = player_me.board[i];
            if (card.card.effect.event == "on_death") {
                eval(card.card.effect.code);
            }
            player_me.board[i] = undefined;
            reset_card(card);
            player_me.graveyard.push(card);
        }

    }
    for (let i = 0; i < player_op.board.length; i++) {
        if (player_op.board[i] != undefined && typeof (player_op.board[i]) === 'object' && player_op.board[i].card.temp_health <= 0) {
            let card = player_op.board[i];
            if (card.card.effect.event == "on_death") {
                eval(card.card.effect.code);
            }
            player_op.board[i] = undefined;
            reset_card(card);
            player_op.graveyard.push(card);
        }
    }
}
function update_hand(game, player_me, player_op) {
    for (let i = 0; i < player_me.hand.length; i++) {
        if (player_me.hand[i].card.temp_cost <= player_me.mp && player_me.turn == true) {
            if (!player_me.hand[i].card.hidden.includes("summonable"))
                player_me.hand[i].card.hidden += "summonable ";
        } else {
            player_me.hand[i].card.hidden = player_me.hand[i].card.hidden.replace("summonable ", "");
        }
    }
    for (let i = 0; i < player_op.hand.length; i++) {
        if (player_op.hand[i].card.temp_cost <= player_op.mp && player_op.turn == true) {
            if (!player_op.hand[i].card.hidden.includes("summonable"))
                player_op.hand[i].card.hidden += "summonable ";
        } else {
            player_op.hand[i].card.hidden = player_op.hand[i].card.hidden.replace("summonable ", "");
        }
    }
}
function draw(player) {
    if ((card = remove_card_from_array(player.deck[0], player.deck)) != undefined) {
        if (player.hand.length < 5) {
            player.hand.push(card);
        }
    }
    else{
        player.hp-=5;
    }
}
function endTurn(game, player_me, player_op) {
    game.turn_num += 1;
    reset_suggestion(player_me, player_op);
    for (let i = 0; i < player_op.board.length; i++) {
        if (player_op.board[i] != undefined && player_op.board[i] != "targetable" && !player_op.board[i].card.hidden.includes("attackable"))
            player_op.board[i].card.hidden += "attackable ";
    }
    draw(player_op);
    if (game.turn_num <= 10) {
        player_op.mp += game.turn_num;
    } else {
        player_op.mp += 10;
    }
    for (let i = 0; i < player_op.board.length; i++) {
        if (player_op.board[i] != undefined && player_op.board[i] != "targetable" && player_op.board[i].card.effect.event == "on_startTurn") {
            let card = player_op.board[i];
            eval(player_op.board[i].card.effect.code);
            player_op.board[i] = card;
        }
    }
    for (let i = 0; i < player_me.board.length; i++) {
        if (player_me.board[i] != undefined && player_me.board[i] != "targetable" && player_me.board[i].card.effect.event == "on_endTurn") {
            let card = player_me.board[i];
            eval(player_me.board[i].card.effect.code);
            player_me.board[i] = card;
        }
    }
    player_me.turn = false;
    player_op.turn = true;
    game.timer.reset();
}
function get_array_has_status(status, arr) {
    let temp = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] != undefined && arr[i] != "targetable" && arr[i].card.status.includes(status)) {
            temp.push(arr[i]);
        }
    }
    return temp;
}
function reset_suggestion(player_me, player_op) {
    player_op.hidden = player_op.hidden.replace("targetable ", "");
    player_me.hidden = player_me.hidden.replace("targetable ", "");

    for (let i = 0; i < player_op.board.length; i++) {
        if (player_op.board[i] != undefined && player_op.board[i] != "targetable")
            player_op.board[i].card.hidden = player_op.board[i].card.hidden.replace("targetable ", "");
    }
    for (let i = 0; i < player_me.board.length; i++) {
        if (player_me.board[i] != undefined && player_me.board[i] != "targetable")
            player_me.board[i].card.hidden = player_me.board[i].card.hidden.replace("selected ", "");
        if (player_me.board[i] == "targetable")
            player_me.board[i] = undefined;
    }
    for (let i = 0; i < player_me.hand.length; i++) {
        player_me.hand[i].card.hidden = player_me.hand[i].card.hidden.replace("selected ", "");
    }
}
function reduce(varl, val) {
    if (varl >= val) {
        varl -= val;
    } else {
        varl = 0;
    }
    return varl;
}