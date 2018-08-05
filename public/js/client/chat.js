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

// POPUP = {

function popupCreateRoom(roomId) {
    if (typeof roomId === "undefined") roomId = "";
    let content = $('#modal-main-popup').find(".content-main-popup");
    content.html(
        "<div class='title'>สร้างห้อง</div>" +
        "ชื่อห้อง <input type='text' id='room-name-input' placeholder='ชื่อห้อง'>" +
        "รหัสผ่าน <input type='text' id='room-password-input' placeholder='รหัสผ่าน'>" +
        "<button onclick='createRoom()'>ตกลง</button>" +
        "<div class='wrong-txt'></div>"
    );
    $('#modal-main-popup').show();
}

function popupJoinRoom(roomId) {
    if (typeof roomId === "undefined") roomId = "";
    let content = $('#modal-main-popup').find(".content-main-popup");
    content.html(
        "<div class='title'>เข้าร่วมห้อง</div>" +
        "ไอดีห้อง <input type='text' id='join-room-id-input' value='" + roomId + "' placeholder='ไอดีห้อง'>" +
        "รหัสผ่าน <input type='text' id='join-room-password-input' placeholder='รหัสผ่าน'>" +
        "<button onclick='joinRoomLock()'>ตกลง</button>" +
        "<div class='wrong-txt'></div>"
    );
    $('#modal-main-popup').show();
}

function hideMainPopup() {
    $('#modal-main-popup').hide();
    $('#modal-main-popup').find(".content-main-popup").html("");
}

// } ENDPOPUP();
