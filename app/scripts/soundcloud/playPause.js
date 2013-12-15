//uses jquery before loading
if (!(!window.jQuery)) {
    var toggle = $('button.playControl');

    //If there is a song to dislike, dislike it
    if (toggle.length > 0) {
        previous[0].click();
    }
    else {
        console.log('No play toggle button found.');
    }
}
