//uses jquery before loading
if (!(!window.jQuery)) {
    var fav = $('#np-fav');

    //Already favorited
    if(fav.hasClass('favorite active')){
        //Do nothing..? 
        //Remove from collection..?  
        //Wut do?  Ignoring for now.
        console.log('Already in favorites!');
    }
    else {
        fav[0].click();
    }
}
