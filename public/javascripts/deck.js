var deck = [];
var deck_id = "";
var page = 0;
var cards;
$(".item").draggable({
    helper: "clone",
    containment: "document",
    connectWith: "#deck",
    revert: 'invalid',
    stack: "div",
    distance: 0
});
$("#deck").droppable({
    drop: function (event, ui) {
        var card = JSON.parse(ui.draggable.attr("card"));
        if ((_.filter(deck, { _id: card._id })).length < 3 && deck.length < 25) {
            deck.push(card);
        }
        updatedeck();
    }
});
jQuery(function ($) {
    $("#deck_num").change(function () {
        deck_id = $("#deck_num").val();
        $.ajax({
            type: "GET",
            url: "/api/games/myCards",
            contentType: "application/json",
            dataType: 'json',
            success: function (data) {
                deck = data;
                updatedeck();
            },
            error: function (errMsg, status, xhr) {
                alert(errMsg.responseText);
            }
        });
    }).change();
});
$("#save").click(function () {
    var cardList = [];
    deck.forEach(card => {
        cardList.push({ card: card._id });
    });
    var obj = {
        _id: deck_id,
        cardList: cardList
    };
    $.ajax({
        type: "PUT",
        url: "/api/decks/",
        data: JSON.stringify(obj),
        success: function (data) {
            $('#infoSaved').text("saved");
        },
        error: function (errMsg, status, xhr) {
            alert(errMsg.responseText);
        },
        contentType: "application/json",
        dataType: 'json'
    });
})
$("#next").click(function () {
    if (page <= 3) {
        page += 1;
    }
    var obj = {
        page: page,
    };
    $.ajax({
        type: "POST",
        url: "/api/games/card/",
        data: JSON.stringify(obj),
        success: function (data) {
            cards = data;
            loadcards();
        },
        error: function (errMsg, status, xhr) {
            alert(errMsg.responseText);
        },
        contentType: "application/json",
        dataType: 'json'
    });
})
$("#back").click(function () {
    if (page <= 1) {
        page = 0;
    } else
        page -= 1;
    var obj = {
        page: page,
    };
    $.ajax({
        type: "POST",
        url: "/api/games/card/",
        data: JSON.stringify(obj),
        success: function (data) {
            cards = data;
            loadcards()
        },
        error: function (errMsg, status, xhr) {
            alert(errMsg.responseText);
        },
        contentType: "application/json",
        dataType: 'json'
    });
})
function updatedeck() {
    var btn = "";
    deck = _.orderBy(deck, ['name'], ['asc']);
    deck.forEach(card => {
        btn += `
        <div class="card-name" card='${JSON.stringify(card)}'>
            <img src="/images/monster/${card.avatar}">
            <p>${card.name}</p>
        </div>`
    });
    $("#deck").empty();
    $("#deck").append(btn);
    $("#deck .card-name").dblclick(function () {
        var card = JSON.parse($(this).attr("card"));
        deck.splice(_.findIndex(deck, { _id: card._id }), 1);
        updatedeck();
    });
    $("#deck_length").text(deck.length);
}
function loadcards() {
    var str = "";
    cards.forEach(c => {
        str +=
            `<div class="card item" card='${JSON.stringify(c)}' id='${c.id}'>
                <div class="titleCard">
                    <p>${c.name}</p>
                </div>
                <div class="monsterImg"><img src="/images/monster/${c.avatar}" alt="">
                    <div class="grade">
                        <p>${c.grade}</p>
                    </div>
                    <div class="cost"><img src="/images/point.png" alt="">
                        <p>${c.cost}</p>
                    </div>
                    <div class="description">
                        <p>${c.effect.description}</p>
                    </div>
                    <div class="attack">
                        <p>${c.attack}</p><img src="/images/attack.png" alt="">
                    </div>
                    <div class="health"><img src="/images/life.png" alt="">
                        <p>${c.health}</p>
                    </div>
                </div>
            </div>`
    });
    $("#cardCollection .grid").empty();
    $("#cardCollection .grid").html(str);
    $(".item").draggable({
        helper: "clone",
        containment: "document",
        connectWith: "#deck",
        revert: 'invalid',
        stack: "div",
        distance: 0
    });
}