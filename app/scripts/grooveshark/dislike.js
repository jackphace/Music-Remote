//uses jquery before loading
if (!(!window.jQuery)) {
    //div.queue-item.active selects currently playing song
    //a.frown-queue-radio-option selects dislike button
    var dislike = $('div.queue-item.queue-item-active a.frown.queue-radio-option');

    //If there is a song to dislike, dislike it
    if (dislike.length > 0) {
        dislike[0].click();
    }
    else {
        console.log('no item to dislike');
    }
}
