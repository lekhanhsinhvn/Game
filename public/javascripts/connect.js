var id, rooms, room_id, data_me, data_op, socket;
//room_id #@# id_me #@# id_op #@# action #@# id_card #@# x #@# y
function showGame() {
    $("#game").css("display", "block");
    $("#loader").css("display", "none");
}
function hideGame() {
    $("#game").css("display", "none");
    $("#loader").css("display", "block");
}
$(document).ready(function () {
    var token = undefined;
    $.ajax({
        type: "POST",
        url: "/api/auth/getToken/",
        dataType: "text",
        success: function (data, status, xhr) {
            token = data;
            connect(token);
        },
        error: function (errMsg, status, xhr) {
            alert(errMsg.responseText);
        }
    })
    function connect(token) {
        socket = io.connect('/', {
            query: {
                token: token
            }
        });
    }
    $(document).ajaxComplete(function () {
        socket.on('connect', function (data) {
            socket.emit('refreshRoom');
        });
        socket.on('id', function (data) {
            id = data;
        });
        socket.on('updateRooms', function (data) {
            rooms = data;
            console.log(rooms);
            updateRooms();
        });
        socket.on('leaveRoom', function (data) {
            room_id = undefined;
            updateRooms();
        });
        socket.on('updateGame', function (me, op) {
            showGame();
            data_me = me;
            data_op = op;
            console.log(room_id);
            console.log(data_me);
            console.log(data_op);
            updategame();
            if (data_me.turn == true) {
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
                        sendPlay("summon", id, x, y);
                    }
                });
            }
        });
        socket.on('err', function (data) {
            alert(data);
        });
    });

    $("#host").click(function () {
        socket.emit('host', id);
    });
    $("#random").click(function () {
        socket.emit('random', id);
    });
    function sendPlay(action, card_id, x, y) {
        socket.emit("play", id, data_me._id + "#@#" + data_op._id + "#@#" + action + "#@#" + card_id + "#@#" + x + "#@#" + y);
    }
    $("#endTurn").click(function () {
        sendPlay("endTurn");
    });
});

function loadcard(card) {
    var attr = status
    var str = "<table id='" + card._id + "' class='card-holder " + attr + "' card='" + JSON.stringify(card) + "'>"
        + "<tr>"
        + "<td class='name-holder' colspan='3'>"
        + "<p>" + card.card.name + "</p>"
        + "</td>"
        + "<td class='value-holder cost'>" + card.card.temp_cost + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td class='image-holder' colspan='4'>"
        + "<img src='/images/" + card.card.avatar + "'>"
        + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td class='effect-holder' colspan='4'>" + card.card.effect.name + "</td>"
        + "</tr>"
        + "<tr>"
        + "<td class='value-holder atk'>" + card.card.temp_attack + "</td>"
        + "<td class='value-holder rarity' colspan='2'>" + card.card.grade + "</td>"
        + "<td class='value-holder hp'>" + card.card.temp_health + "</td>"
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
function loadRoom(room) {
    var str = "";
    if (room.players_name.length == 1 && room_id == undefined) {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + "<span>" + room.players_name + "</span>"
            + "<button class='btn-success' id='join' val='" + room._id + "'>Join</button>"
            + "</div>";
    }
    else if (room.players_name.length == 2 && room_id == undefined) {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + "<span>" + room.players_name + "</span>"
            + "<button class='btn-success' id='spectate' val='" + room._id + "'>Spectate</button>"
            + "</div>";
    }
    else{
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + "<span>" + room.players_name + "</span>"
            + "</div>";
    }
    return str;
}
function updateRooms() {
    $("#rooms").empty();
    rooms.forEach(room => {
        $("#rooms").append(loadRoom(room));
    });
    $("#join").click(function () {
        socket.emit('join', id, $(this).attr("val"));
    });
    $("#spectate").click(function () {
        socket.emit('spectate', id, $(this).attr("val"));
    });
}
function get_card_from_array(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return arr[i];
        }
    }
    return -1;
}
