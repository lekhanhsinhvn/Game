var deck=[];
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
        if(deck.length<25){
            deck.push(card);
        }
        updatedeck();
    }
});
$.ajax({

});
$("#deck_num").change(function() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/api/games/deck?deck_num="+$("#deck_num").val(),
        success: function(data){
          console.log(data);
          deck=data;
        },
        contentType: "application/json",
        dataType: 'json'
      });
});
$("#save").click(function(){
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/api/games/deck/save",
        data: JSON.stringify({	
            "deck": deck
        }),
        success: function(data){
          console.log(data);
        },
        contentType: "application/json",
        dataType: 'json'
      });
})
function updatedeck(){
    var str="";
    deck=_.orderBy(deck,['name'],['asc']);
    deck.forEach(card => {
        str+="<div class='card' style='cursor: pointer' card='"+JSON.stringify(card)+"'><span>"+card.name+"</span></div>"
    });
    $("#deck").empty();
    $("#deck").append(str);
    $("#deck .card").dblclick(function() {
        var card = JSON.parse($(this).attr("card"));
        deck.splice(_.findIndex(deck, {_id:card._id}),1);
        updatedeck();
    });
}