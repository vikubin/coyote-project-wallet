function loading(){
    $('#bodyContainer').hide();
    $('.loading').show('');
}

function loadingHide(){
    $('.loading').hide();
    $('#bodyContainer').show();
}

window.addEventListener("loadend", function() {
    console.log('loaded');
    loadingHide();
}, false);

