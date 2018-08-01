$(function () {
    /*$('#chat-screen').bind("DOMSubtreeModified", function () {
        var objDiv = document.getElementById("chat-screen");
        objDiv.scrollTop = objDiv.scrollHeight;
    });*/

    $('#msg-input').keypress(function (e) {
        if (e.which == 13) {
            $("#send-btn").click();
        }
    });
});

function chatBoxAddMsg(tagId, id, msg) {
    $('#' + tagId).append(
        '<div class="msg-box">' +
        '<div class="name">' + id + '</div>' +
        '<div class="msg-frame"><span class="msg">' + msg + '</span></div>' +
        '</div>'
    );
    var objDiv = document.getElementById(tagId);
    objDiv.scrollTop = objDiv.scrollHeight;
}