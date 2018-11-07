var socket = io.connect('/');
socket.on('connect', function (data) {
    id = $("script[src*='/javascripts/connect.js']").attr("val");
    socket.emit('cmd', 'join@#@' + id);
});
var room_id, data_me, data_op;
//room_id #@# id_me #@# id_op #@# action #@# id_card #@# x #@# y
socket.on('update', function (r, me, op) {
    room_id = r;
    data_me = me;
    data_op = op;
    console.log(room_id);
    console.log(data_me);
    console.log(data_op);
    updategame();
    $("#hand .summonable").draggable({
        containment: "document",
        connectWith: ".placeable",
        revert: 'invalid',
    });
    $(".placeable").droppable({
        drop: function (event, ui) {
            x = $(this).attr("x");
            y = $(this).attr("y");
            id = ui.draggable.attr("id");
            send("summon", id, x, y);
        }
    });
})
function send(action, id, x, y) {
    socket.emit("cmd", "play@#@" + room_id + "#@#" + data_me.id + "#@#" + data_op.id + "#@#" + action + "#@#" + id + "#@#" + x + "#@#" + y);

}
function loadcard(card) {
    var str = "<table id='" + card.id + "' class='card-holder summonable' card='" + JSON.stringify(card) + "'>"
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
        + "</tr>"
        + "</table>";
    return str;
}

function updategame() {
    $("#op_info .deck_num").text(data_op.deck_num);
    $("#op_info .hand_num").text(data_op.hand_num);
    $("#op_info .mp").text(data_op.mp);
    $("#me_info .deck_num").text(data_me.deck_num);
    $("#me_info .mp").text(data_me.mp);
    for (let i = 0; i < 4; i++) {
        $("td[y$='0'][x$='" + i + "']").empty();
        if (data_op.board[i] != undefined) {
            $("td[y$='0'][x$='" + i + "']").append(loadcard(data_op.board[i]));
            $("td[y$='0'][x$='" + i + "']").removeClass("placeable");
            $("td[y$='0'][x$='" + i + "']").droppable('disable');
        }
    }
    for (let i = 0; i < 4; i++) {
        $("td[y$='1'][x$='" + i + "']").empty();
        if (data_me.board[i] != undefined) {
            $("td[y$='1'][x$='" + i + "']").append(loadcard(data_me.board[i]));
            $("td[y$='1'][x$='" + i + "']").removeClass("placeable");
            $("td[y$='1'][x$='" + i + "']").droppable('disable');
        }
    }
    for (let i = 0; i < 7; i++) {
        $("#hand td[x$='" + i + "']").empty();
        if (data_me.hand[i] != undefined) {
            $("#hand td[x$='" + i + "']").append(loadcard(data_me.hand[i]));
        }
    }
}
$("#endTurn").click(function () {
    send("endTurn");
});
function get_card_from_array(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return arr[i];
        }
    }
    return -1;
}
