var deck = [];
var deck_id="";
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
        if (deck.length < 25) {
            deck.push(card);
        }
        updatedeck();
    }
});
jQuery(function ($) {
    $("#deck_num").change(function () {
        deck_id=$("#deck_num").val();
        $.ajax({
            type: "GET",
            url: "/api/games/myCards",
            success: function (data) {
                deck = data;
                updatedeck();
            },
            error: function (errMsg, status, xhr) {
                alert(errMsg.responseText);
            },
            contentType: "application/json",
            dataType: 'json'
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
    console.log(obj);
    $.ajax({
        type: "PUT",
        url: "http://localhost:3000/api/decks/",
        data: JSON.stringify(obj),
        success: function (data) {
            alert("saved");
        },
        error: function (errMsg, status, xhr) {
            alert(errMsg.responseText);
        },
        contentType: "application/json",
        dataType: 'json'
    });
})
function updatedeck() {
    var str = "";
    deck = _.orderBy(deck, ['name'], ['asc']);
    deck.forEach(card => {
        str += "<div class='card' style='cursor: pointer' card='" + JSON.stringify(card) + "'><span>" + card.name + "</span></div>"
    });
    $("#deck").empty();
    $("#deck").append(str);
    $("#deck .card").dblclick(function () {
        var card = JSON.parse($(this).attr("card"));
        deck.splice(_.findIndex(deck, { _id: card._id }), 1);
        updatedeck();
    });
}