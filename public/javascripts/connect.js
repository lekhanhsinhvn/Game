var user_id, rooms, room_id, data_me, data_op, socket;
var down = false;
//room_id #@# id_me #@# id_op #@# action #@# id_card #@# x #@# y
$(document).ready(function () {
    $(document).mousedown(function () {
        down = true;
    }).mouseup(function () {
        down = false;
    });
    var token = undefined;
    $.ajax({
        type: "POST",
        url: "/auth/getToken/",
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
        socket.on('updateGame', function (r, t, me, op) {
            showGame();
            $("#leaveRoom").css("display", "none");
            room_id = r;
            data_me = me;
            data_op = op;
            timer = new Timer();
            timer.start({
                startValues: t,
                target: {
                    seconds: 0,
                },
                countdown: true,
            })
            timer.addEventListener('secondsUpdated', function (e) {
                $('#timer').html(timer.getTimeValues().minutes.toString() + ":" + timer.getTimeValues().seconds.toString());
            });
            updategame();
            if (data_me.turn == true) {
                $(".guard.targetable").append("<img src='/images/guard.png' alt='' class='guard_img'>");
                $(".card.targetable").append("<img src='/images/attack.png' alt='' class='attack_img'>");
                $("#op_info .attack_img").css("display", "none");
                $("#op_info.targetable .attack_img").css("display", "block");
                $(".summonable").mouseenter(function () {
                    if (!$(this).hasClass("selected") && down == false) {
                        card_id = $(this).attr("id");
                        sendPlay("select", card_id);
                    }
                })
                $(".summonable").mouseleave(function () {
                    if ($(this).hasClass("selected") && down == false) {
                        card_id = $(this).attr("id");
                        sendPlay("select", card_id);
                    }
                })
                $(".attackable").mouseenter(function () {
                    if (!$(this).hasClass("selected") && down == false) {
                        card_id = $(this).attr("id");
                        sendPlay("select", card_id);
                    }
                })
                $(".attackable").mouseleave(function () {
                    if ($(this).hasClass("selected") && down == false) {
                        card_id = $(this).attr("id");
                        sendPlay("select", card_id);
                    }
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
                $(".card.targetable").droppable({
                    drop: function (event, ui) {
                        card_id1 = ui.draggable.attr("id");
                        card_id2 = $(this).attr("id");
                        sendPlay("attack", card_id1, "", "", card_id2);
                    },
                    tolerance: "pointer"
                })
                $("#op_info.targetable").droppable({
                    drop: function (event, ui) {
                        card_id1 = ui.draggable.attr("id");
                        card_id2 = "player";
                        sendPlay("attack", card_id1, "", "", card_id2);
                    },
                    tolerance: "pointer"
                })
            }
            $("#op_info .boom_img").css("display", "none");
            $("#op_info.boom .boom_img").css("display", "block");
            $("#me_info .boom_img").css("display", "none");
            $("#me_info.boom .boom_img").css("display", "block");
            $(".card.boom").append("<img src='/images/boom.png' alt='' class='attack_img'>");
        });
        socket.on('err', function (data) {
            if (data == "YOU LOSE" || data == "YOU WIN") {
                socket.emit("leaveRoom", user_id, room_id);
            }
            room_id = undefined;
            data_me = undefined;
            data_op = undefined;
            hideGame();
            alert(data);
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
    $(".endTurn").click(function () {
        sendPlay("endTurn");
    });
    $(".surrender").click(function () {
        socket.emit("surrender", user_id, room_id);
    });
    $("#leaveRoom").click(function () {
        socket.emit("leaveRoom", user_id, room_id);
    });
    function showGame() {
        $("#game").css("display", "block");
        $("#loader").css("display", "none");
    }
    function hideGame() {
        $("#game").css("display", "none");
        $("#loader").css("display", "block");
    }
});

function loadcard(c, hide) {
    var attr = c.card.status;
    var hidden = "";
    if (hide == true) {
        hidden = c.card.hidden;
        console.log(c.card.hidden);
    }
    var str = `
        <div class="card ${attr} ${hidden}" card='${JSON.stringify(c)}' id='${c._id}'>
            <div class="titleCard">
                <p>${c.card.name}</p>
            </div>
            <div class="monsterImg">
                <img src="/images/monster/${c.card.avatar}" alt="">
                <div class="grade">
                    <p>${c.card.grade}</p>
                </div>
                <div class="cost"><img src="/images/point.png" alt="">
                    <p>${c.card.cost}</p>
                </div>
                <div class="description">
                    <p>${c.card.effect.description}</p>
                </div>
                <div class="attack">
                    <p>${c.card.temp_attack}</p><img src="/images/attack.png" alt="">
                </div>
                <div class="health"><img src="/images/life.png" alt="">
                    <p>${c.card.temp_health}</p>
                </div>
            </div>
        </div>
    `

    return str;
}

function updategame() {
    $(".endTurn").css("display", "none");
    let str = "";
    if (data_op.turn == true) {
        $("#op_info .player_name").attr("class", "player_name " + str);
    }
    else {
        $("#me_info .player_name").attr("class", "player_name " + str);
    }
    str = "";
    if (data_me.turn == true) {
        $(".endTurn").css("display", "block");
        str += "turn_current ";
    }

    $("#op_info .player_name").text(data_op.player_name);
    $("#op_info .deck_num").text(data_op.deck_num);
    $("#op_info .hand_num").text(data_op.hand_num);
    $("#op_info .mp").text(data_op.mp);
    $("#op_info .hp_num").text(data_op.hp);
    $("#me_info .player_name").text(data_me.player_name);
    $("#me_info .deck_num").text(data_me.deck_num);
    $("#me_info .mp").text(data_me.mp);
    $("#me_info .hp_num").text(data_me.hp);

    $("#me_info").attr("class", data_me.status);
    $("#op_info").attr("class", data_op.hidden+" "+data_op.status);

    let hp_me = $("#me_info .hp").data("value");
    let dmg_me = hp_me - data_me.hp;
    $("#me_info .hp .hit").css("width", (dmg_me / hp_me) * 100 + "%");
    $("#me_info .hp").data("value", data_me.hp);
    setTimeout(function () {
        $("#me_info .hp .hit").css({ 'width': '0' });
        $("#me_info .hp .bar").css('width', (data_me.hp / 30) * 100 + "%");
    }, 500);
    let hp_op = $("#op_info .hp").data("value");
    let dmg_op = hp_op - data_op.hp;
    $("#op_info .hp .hit").css("width", (dmg_op / hp_op) * 100 + "%");
    $("#op_info .hp").data("value", data_op.hp);
    setTimeout(function () {
        $("#op_info .hp .hit").css({ 'width': '0' });
        $("#op_info .hp .bar").css('width', (data_op.hp / 30) * 100 + "%");
    }, 500);

    for (let i = 0; i < 4; i++) {
        $("td[y$='0'][x$='" + i + "']").empty();
        $("td[y$='0'][x$='" + i + "']").removeClass("placeable");
        $("td[y$='0'][x$='" + i + "']").removeClass("targetable");
        if (data_op.board[i] != undefined) {
            if (typeof (data_op.board[i]) === 'object') {
                if (data_me.turn == true) {
                    $("td[y$='0'][x$='" + i + "']").append(loadcard(data_op.board[i], true));
                } else {
                    $("td[y$='0'][x$='" + i + "']").append(loadcard(data_op.board[i], false));
                }
            }
        }
    }
    for (let i = 0; i < 4; i++) {
        $("td[y$='1'][x$='" + i + "']").empty();
        $("td[y$='1'][x$='" + i + "']").removeClass("placeable");
        $("td[y$='1'][x$='" + i + "']").removeClass("targetable");
        if (data_me.board[i] != undefined) {
            if (typeof (data_me.board[i]) === 'object') {
                if (data_me.turn == true) {
                    $("td[y$='1'][x$='" + i + "']").append(loadcard(data_me.board[i], true));
                } else {
                    $("td[y$='1'][x$='" + i + "']").append(loadcard(data_me.board[i], false));
                }
            } else if (data_me.board[i] == "targetable") {
                $("td[y$='1'][x$='" + i + "']").addClass("placeable targetable");
            }
        }
    }
    $("#hand").empty();
    for (let i = 0; i < 6; i++) {

        if (data_me.hand[i] != undefined) {
            if (data_me.turn == true) {
                $("#hand").append(loadcard(data_me.hand[i], true));
            } else {
                $("#hand").append(loadcard(data_me.hand[i], false));
            }
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
            + "<button class='btn btn-success' id='join' val='" + room._id + "'>Join</button>"
            + "<div class='player_name'>" + player_name + "</div>"
            + "</div>";
    }
    else if (room.players.length == 2 && room_id == undefined) {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + "<button class='btn btn-success' id='spectate' val='" + room._id + "'>Spectate</button>"
            + "<div class='player_name'>" + player_name + "</div>"
            + "</div>";
    }
    else {
        str += "<div class='room'>"
            + "<p>" + room._id + "</p>"
            + "<div class='player_name'>" + player_name + "</div>"
            + "</div>";
    }
    return str;
}
function updateRooms() {
    $("#rooms").empty();
    $("#leaveRoom").css("display", "none");
    $("#host").css("display", "inline");
    $("#random").css("display", "inline");
    rooms.forEach(room => {
        if (_.find(room.players, { _id: user_id }) != undefined) {
            $("#leaveRoom").css("display", "block");
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
    if (room_id != undefined) {
        $("#host").css("display", "none");
        $("#random").css("display", "none");
    }
}
function get_card_from_array(id, arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return arr[i];
        }
    }
    return -1;
}