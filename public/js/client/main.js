$(document).on('click', () => {
    if(!event.target.matches('.dropbtn')){
        $('#main-drop-menu').removeClass('show');
    }
});

function toggleDropMenu(id) {
    document.getElementById(id).classList.toggle("show");
}

function hideMainPopup() {
    $('#modal-main-popup').hide();
    $('#modal-main-popup').find(".content-main-popup").html("");
}