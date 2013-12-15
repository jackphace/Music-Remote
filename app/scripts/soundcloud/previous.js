//uses jquery before loading
if (!(!window.jQuery)) {
    var previous = $('button.skipControl__previous');

    //If there is a song to dislike, dislike it
    if (previous.length > 0) {
        if (!previous.hasClass('disabled')) {
            previous[0].click();
        }
    }
    else {
        console.log('No previous button found.');
    }
}
