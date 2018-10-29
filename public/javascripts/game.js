var games=new Map();
module.exports = {
    incomingPlay: function (room, me, op, msg, socket) {
        var game=get_game_state(room);
        var player_me=check_player(game,me);
        var player_op=check_player(game,op);
        console.log(msg);
        //action #@# card #@# x #@# y 
        var data=msg.split("#@#");
        switch (data[0]) {
            case "draw":
                add_to_hand(remove_from_deck(player_me.deck[0],player_me),player_me);
                break;
            case "attack":
                
                break;
            case "summon_from_hand":
                add_to_board(data[2],data[3],remove_from_hand(data[1]),player_me,player_op);
                break;
            default:
                break;
        }
        check_player(game,id)=player_me;
        check_player(game,op)=player_op;
        set_game_state(room,game);
        //me(hp,mp,deck_num,hand,board,graveyard) op(hp,mp,deck_num,hand_num,board,graveyard)
        socket.to(game.room).emit('update',
                                player_me.hp,
                                player_me.mp,
                                player_me.deck.length(),
                                player_me.hand,
                                player_me.board,
                                player_me.graveyard,
                                player_op.hp,
                                player_op.mp,
                                player_op.deck.length(),
                                player_op.hand.length(),
                                player_op.board,
                                player_op.graveyard);
    },
    creategame: function (room,socket) {
        var player1 = {
            id: 1,
            hp=30,
            mp=0,
            deck: [],
            hand: [],
            board: new Map(),
            graveyard: []
        }
        var player2 = {
            id: 2,
            hp=30,
            mp=0,
            deck: [],
            hand: [],
            board: new Map(),
            graveyard: []
        }
        var game = {
            player1: player1,
            player2: player2
        }
        set_game_state(room,game);
        socket.to(room).emit('update', game);
    }
}
function set_game_state(room,game){
    games.set(room,game);
}
function get_game_state(room){
    return games.get(room);
}
function check_player(game, id) {
    if (game.player1.id == id) {
        return game.player1;
    }
    return game.player2;
}
function remove_from_hand(player, card) {
    player.hand.splice(player.hand.indexOf(card),1);
    return card;
}
function remove_from_deck(player, card) {
    player.deck.splice(player.deck.indexOf(card),1);
    return card;
}
function remove_from_graveyard(player, card) {
    player.graveyard.splice(player.graveyard.indexOf(card),1);
    return card;
}
function add_to_hand(card,player) {
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
function add_to_board(x, y, card,player_me,player_op) {
    if (y == 0) {
        player_me.board.set(x,card);
    }
    else if (y == 1) {
        player_op.board.set(x,card);
    }
    return card;
}