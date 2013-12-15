//uses jquery before loading
if (!(!window.jQuery)) {
    var next = $('button.skipControl__next');

    //If there is a song to dislike, dislike it
    if (next.length > 0) {
        if (!next.hasClass('disabled')) {
            next[0].click();
        }
    }
    else {
        console.log('No previous button found.');
    }
}
