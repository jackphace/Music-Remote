//Settings to load
var settings = ["amazon", "google", "grooveshark", "pandora", "soundcloud", "youtube", "first"];

//Sites and their corresponding url to query
var sites = {
    'amazon': "*://www.amazon.com/gp/dmusic/mp3/player*",
    'google': "*://play.google.com/music/listen*",
    'grooveshark': "*://grooveshark.com/*",
    'pandora': "*://www.pandora.com/*",
    'soundcloud': "*://soundcloud.com/*",
    'youtube': "*://www.youtube.com/*"
};

//Chords are used to combo keys to get around the 4-hotkey limit of chrome.commands API
//True if in the middle of a keyboard chord.  
var chord = false;
var activatedTabId = null;
var previousWindowId = null;
var previousTabId = null;

//Check whether new version is installed.  
//TODO: something on installs/upgrades
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        //Enable all sites on first install..?
    } else if (details.reason == "update") {
    }
});

//Listen for global hotkeys on enabled sites and execute commands
chrome.commands.onCommand.addListener(function (command) {
    chrome.storage.sync.get(settings, function (items) {
        controlSites(command, items);
    });
});


var first;
var tabsControlled;
//Controls every enabled site
function controlSites(action, settings) {
    //No tabs controlled yet
    tabsControlled = 0;

    //Chord toggles the state of chord (e.g., chord+chord = not in a chord)
    if (action == 'remote-chord') {
        chord = !chord;
        //console.log('Chord = ' + chord);
        return;
    }

    //Default = first key doesn't exist in settings
    //If default || first=true, control only the first tab encountered
    first = settings['first'] || !('first' in settings);

    //Control a site if is enabled, or if there are no settings for it
    for (site in sites) {
        if (settings[site] || !(site in settings)) {
            controlSite(site, action, chord);
        }
    }
}

//Queries chrome for each tab matching the site's query string (sites[site])
function controlSite(site, action, isChord) {
    chrome.tabs.query({
        url: sites[site]
    }, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            //If only controlling one tab and one tab has been controlled already, return
            if (first && tabsControlled > 0)
                return;

            //Otherwise perform the action on the tab being looked at and indicate a tab has been controlled
            tabsControlled++;
            controlTab(site, tabs[i], action, isChord);
        }
    });
}

//Execute the appropriate script in the scripts folder, with the format scripts/{player}/{action}.js
function controlTab(player, tab, action, isChord) {
    //Script to be executed in the tab being controlled.  **Some actions will return before injecting it**
    var file;
    //If true, this will inject jQuery into the script's executing environment before the script is run. Little messy.
    var injectJQuery = false;

    //Set of actions if in a chord
    if (isChord) {
        //Chord is finished, reset it to non-chord position
        chord = false;

        //In a chord: 
        //next = toggle = activate current tab, favorite.js, previous = dislike.js
        switch (action) {
            case 'remote-toggle':
                //If the tab ID is the same as some navigation, it means the user is still on the player's tab 
                //and activated the navigation shortcut again, and would like to go back to their previous tab
                //console.log("Activated tab = " + activatedTabId);
                //console.log("Found tab = " + tab.id);

                //Find the current tab
                //chrome.tabs.getCurrent(function (currentTab) {  --getCurrent isn't working right with an event script
                chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (currentTab) {
                    if (currentTab[0].id == tab.id) {
                        //Return user to previous tab
                        chrome.tabs.update(previousTabId, {
                            active: true
                        }, function (callback) {
                            //Clear previous tab
                            previousTabId = null;
                            activatedTabId = null;
                        });

                        //Return user to previous window
                        chrome.windows.update(previousWindowId, {
                            focused: true,
                            drawAttention: true
                        }, function (callback) {
                            //Clear previous window
                            previousWindowId = null;
                        });

                        //Do nothing else
                        return;
                    }
                        //Otherwise navigate to the player
                    else {
                        //Save the current tab
                        previousTabId = currentTab[0].id;

                        //Then activate tab in its window
                        chrome.tabs.update(tab.id, {
                            active: true
                        }, function (callback) {
                            //Set the activated tab to the one navigated to
                            activatedTabId = tab.id;
                        });

                        //Save the current window
                        chrome.windows.getCurrent(null, function (currentWindow) {
                            previousWindowId = currentWindow.id;

                            //Then put the window of the player's tab on top
                            chrome.windows.update(tab.windowId, {
                                focused: true,
                                drawAttention: true
                            }, function (callback) {
                            });
                        });

                        //Do nothing else
                        return;
                    }
                });

            case 'remote-next':
                file = 'favorite.js';
                injectJQuery = true;
                break;

            case 'remote-previous':
                file = 'dislike.js';
                injectJQuery = true;
                break;
        }
    }
    else {
        //Out of chord:
        //toggle = playPause.js, next = next.js, previous = previous.js
        switch (action) {
            case 'remote-toggle':
                file = 'playPause.js';
                break;

            case 'remote-next':
                file = 'next.js';
                break;

            case 'remote-previous':
                file = 'previous.js';
                break;
        }
    }

    //Always injecting jQuery for now
    chrome.tabs.executeScript(tab.id, { file: "jquery-1.10.2.min.js" }, function () {
        chrome.tabs.executeScript(tab.id, { file: file });
    }

        ////Inject whatever script action is specified into the select tab
        ////Uses injection technique described here: http://stackoverflow.com/questions/4698118/google-chrome-extensions-how-to-include-jquery-in-programatically-injected-cont
        //file = "scripts/" + player + "/" + file;
        //if (injectJQuery) {
        //    chrome.tabs.executeScript(tab.id, { file: "jquery-1.10.2.min.js" }, function () {
        //        chrome.tabs.executeScript(tab.id, { file: file });
        //    });
        //}
        //    //No jQuery injected into script's environment
        //else {
        //    chrome.tabs.executeScript(tab.id, {
        //        file: file
        //    });
        //}
    }