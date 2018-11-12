var user_id, rooms, room_id, data_me, data_op, socket;
//room_id #@# id_me #@# id_op #@# action #@# id_card #@# x #@# y
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
            user_id = data;
            hideGame();
        });
        socket.on('room_id', function (data) {
            room_id = data;
            updateRooms();
        });
        socket.on('updateRooms', function (data) {
            rooms = data;
            updateRooms();
        });
        socket.on('updateGame', function (r, timer, me, op) {
            showGame();
            room_id = r;
            data_me = me;
            data_op = op;
            // console.log(room_id);
            // console.log(data_me);
            // console.log(data_op);
            updategame();
            if (data_me.turn == true) {
                $(".summonable").click(function () {
                    card_id = $(this).attr("id");
                    sendPlay("select", card_id);
                })
                $(".attackable").click(function () {
                    card_id = $(this).attr("id");
                    sendPlay("select", card_id);
                })
                $(".summonable.selected").draggable({
                    containment: "document",
                    connectWith: ".placeable",
                    revert: 'invalid',
                });
                $(".attackable.selected").draggable({
                    containment: "document",
                    revert: 'invalid',
                    // helper: function () {
                    //     var dom = [];
                    //     dom.push();
                    //     return $(dom.join(''));
                    // },
                    // cursor:"url(../images/attack_cursor.png)",
                });
                $(".placeable").droppable({
                    drop: function (event, ui) {
                        x = $(this).attr("x");
                        y = $(this).attr("y");
                        card_id = ui.draggable.attr("id");
                        sendPlay("summon", card_id, x, y);
                    },
                    tolerance: "pointer"
                });
                $(".card-holder.targetable").droppable({
                    drop: function (event, ui) {
                        card_id1 = ui.draggable.attr("id");
                        card_id2 = $(this).attr("id");
                        sendPlay("attack", card_id1, "", "", card_id2);
                    },
                    tolerance: "pointer"
                })
                $(".hp.targetable").droppable({
                    drop: function (event, ui) {
                        card_id1 = ui.draggable.attr("id");
                        card_id2 = "player";
                        sendPlay("attack", card_id1, "", "", card_id2);
                    },
                    tolerance: "pointer"
                })
            }
        });
        socket.on('err', function (data) {
            alert(data);
            if (data == "YOU LOSE" || data == "YOU WIN") {
                socket.emit("leaveRoom", user_id, room_id);
            }
            room_id = undefined;
            data_me = undefined;
            data_op = undefined;
            hideGame();
        });
    });
    $("#host").click(function () {
        socket.emit('host', user_id);
    });
    $("#random").click(function () {
        socket.emit('random', user_id);
    });
    function sendPlay(action, card_id1, x, y, card_id2) {
        socket.emit("play", user_id, data_me._id + "#@#" + data_op._id + "#@#" + action + "#@#" + card_id1 + "#@#" + x + "#@#" + y + "#@#" + card_id2);
    }
    $("#endTurn").click(function () {
        sendPlay("endTurn");
    });
    $("#leaveRoom").click(function () {
        socket.emit("leaveRoom", user_id, room_id);
    });
    function showGame() {
        $("#game").css("display", "block");
        $("#loader").css("display", "none");
        $("#leaveRoom").css("display", "none");
    }
    function hideGame() {
        if (room_id != undefined || data_op != undefined && data_op.hp <= 0 || data_me != undefined && data_me.hp <= 0) {
            $("#leaveRoom").css("display", "block");
        }
        else {
            $("#leaveRoom").css("display", "none");
        }
        $("#game").css("display", "none");
        $("#loader").css("display", "block");
    }
});

function loadcard(card) {
    var attr = card.card.status
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
    $("#endTurn").css("display", "none");
    let str = "";
    if (data_op.turn == true) {
        $("#op_info .player_name").attr("class", "player_name " + str);
    }
    else {
        $("#me_info .player_name").attr("class", "player_name " + str);
    }
    str = "";
    if (data_me.turn == true) {
        $("#endTurn").css("display", "block");
        str += "turn_current ";
    }

    $("#op_info .player_name").text(data_op.player_name);
    $("#op_info .deck_num").text(data_op.deck_num);
    $("#op_info .hand_num").text(data_op.hand_num);
    $("#op_info .mp").text(data_op.mp);
    $("#op_info .hp").text(data_op.hp);
    $("#op_info .hp").attr("class", "hp " + data_op.status);
    $("#me_info .player_name").text(data_me.player_name);
    $("#me_info .deck_num").text(data_me.deck_num);
    $("#me_info .mp").text(data_me.mp);
    $("#me_info .hp").text(data_me.hp);

    for (let i = 0; i < 4; i++) {
        $("td[y$='0'][x$='" + i + "']").empty();
        $("td[y$='0'][x$='" + i + "']").removeClass("placeable");
        $("td[y$='0'][x$='" + i + "']").removeClass("targetable");
        if (data_op.board[i] != undefined) {
            if (typeof (data_op.board[i]) === 'object') {
                $("td[y$='0'][x$='" + i + "']").append(loadcard(data_op.board[i]));
            }
        }
    }
    for (let i = 0; i < 4; i++) {
        $("td[y$='1'][x$='" + i + "']").empty();
        $("td[y$='1'][x$='" + i + "']").removeClass("placeable");
        $("td[y$='1'][x$='" + i + "']").removeClass("targetable");
        if (data_me.board[i] != undefined) {
            if (typeof (data_me.board[i]) === 'object') {
                $("td[y$='1'][x$='" + i + "']").append(loadcard(data_me.board[i]));
            } else if (data_me.board[i].includes("targetable")) {
                $("td[y$='1'][x$='" + i + "']").addClass("placeable targetable");
            }
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
    var str = "", player_name = "";
    room.players.forEach(p => {
        player_name += "<span>" + p.name + "</span>"
    });
    if (room.players.length == 1 && room_id == undefined) {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + player_name
            + "<button class='btn-success' id='join' val='" + room._id + "'>Join</button>"
            + "</div>";
    }
    else if (room.players.length == 2 && room_id == undefined) {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + player_name
            + "<button class='btn-success' id='spectate' val='" + room._id + "'>Spectate</button>"
            + "</div>";
    }
    else {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + player_name
            + "</div>";
    }
    return str;
}
function updateRooms() {
    $("#rooms").empty();
    rooms.forEach(room => {
        if (_.find(room.players, { _id: user_id }) != undefined) {
            if (room_id == undefined && room.players.length == 2) {
                socket.emit('recon', user_id, room._id);
                $("#leaveRoom").css("display", "none");
            }
            room_id = room._id;
        }
        $("#rooms").append(loadRoom(room));
    });
    $("#join").click(function () {
        socket.emit('join', user_id, $(this).attr("val"));
    });
    $("#spectate").click(function () {
        socket.emit('spectate', user_id, $(this).attr("val"));
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