function allowDrop(ev) {
    ev.preventDefault();
}
var socket = io.connect('http://localhost:4000');
var room;
var me;
var op;
var game;
socket.on('connect', function (data) {
    socket.emit('cmd', 'join');
});
var n = 0;
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    console.log(ev.target.id);
}
function drop(ev) {
    ev.preventDefault();
    var id=parseInt(ev.dataTransfer.getData("text"));
    var x = ev.target.getAttribute("x");
    var y = ev.target.getAttribute("y");
    var card=remove_from_hand(me,id);
    add_to_board(x, y, card);
}
socket.on('update', function (game) {
    room = game.room;
    me = check_me(game, socket);
    op = check_op(game, socket);
    console.log(game);
    updategame();
})
function send(me, op) {
    temp = {
        room: room,
        player1: me,
        player2: op
    }
    socket.emit("play", temp);

}
function loadcard(card) {
    var str = "<table id=" + card.id + " class='card-holder' draggable='true' ondragstart='drag(event)'>"
        + "<tr>"
        + "<td class='name-holder' colspan='3'>"
        + "<p>" + card.id + "</p>"
        + "</td>"
        + "<td class='value-holder cost'>0</td>"
        + "</tr>"
        + "<tr>"
        + "<td class='image-holder' colspan='4'></td>"
        + "</tr>"
        + "<tr>"
        + "<td class='effect-holder' colspan='4'></td>"
        + "</tr>"
        + "<tr>"
        + "<td class='value-holder atk'>0</td>"
        + "<td class='value-holder rarity' colspan='2'></td>"
        + "<td class='value-holder hp'>0</td>"
        + "</tr>" +
        +"</table>";
    return str;
}

function updategame() {
    for (let i = 0; i < 4; i++) {
        $("td[y$='0'][x$='" + i + "']").empty();
        if (op.board[i] != undefined) {
            $("td[y$='0'][x$='" + i + "']").html(loadcard(op.board[i]));
        }
    }
    for (let i = 0; i < 4; i++) {
        $("td[y$='1'][x$='" + i + "']").empty();
        if (me.board[i] != undefined) {
            $("td[y$='1'][x$='" + i + "']").html(loadcard(me.board[i]));
        }
    }
    for (let i = 0; i < 7; i++) {
        $("#hand td[x$='" + i + "']").empty();
        if (me.hand[i] != undefined) {
            $("#hand td[x$='" + i + "']").html(loadcard(me.hand[i]));
        }
    }
}
$("#draw").click(function () {
    
});
