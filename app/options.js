var actions = ['Previous', 'Next', 'Play', 'Dislike', 'Store', 'Activate Tab'];

var siteCompatibility = {
    'Amazon': ['O', 'O', 'O', 'X', 'X', 'O'],
    'Google': ['O', 'O', 'O', 'X', 'X', 'O'],
    'Grooveshark': ['O', 'O', 'O', 'O', 'O', 'O'],
    'Pandora': ['O', 'O', 'O', 'X', 'X', 'O'],
    'Soundcloud': ['O', 'O', 'O', 'X', 'X', 'O'],
    'Youtube': ['O', 'O', 'O', 'X', 'X', 'O'],
}

$(function () {
    //Display the commands and corresponding keyboard shortcuts in the #commands table
    displayCommands();

    //Display the compatibility sites have for the different commands
    displayCompatibility();

    //Don't reload page
    $('form').submit(function () { return false; });

    //Load existing values
    loadValues();

    //Click 'save' button to save values
    $('#save').click(saveOptions);
});

function displayCompatibility() {
    //Get the table row of the thead of the compatibility table
    var header = $('#compatibility-actions');

    //Empty first cell
    var actionsHtml = '<th></th>';

    //Then list every action in a table header
    for (var i = 0; i < actions.length; i++) {
        actionsHtml += '<th>' + actions[i] + '</th>';
    }
    //Write the actions to the headers of the compatibility table
    header.html(actionsHtml);

    var compatibility = $('#compatibility-list');
    var compatibilityHtml = '';

    //For each site, add a new row in the tbody of the compatibility table...
    for (site in siteCompatibility) {
        compatibilityHtml += '<tr id="' + site + '-compatibility">';        //Open row
        compatibilityHtml += '<td>' + site + '</td>';                       //Add site header

        //For each action, output the compatibility (assumes in the same order as 'actions' array, O=working, X=not working)
        for (var i = 0; i < siteCompatibility[site].length; i++) {
            compatibilityHtml += '<td>' + siteCompatibility[site][i] + '</td>';
        }

        compatibilityHtml += '</td>';                                       //Close current site's compatibility row
    }

    //Write the sites' compatibilities with each of the actions out to the compatibility table
    compatibility.html(compatibilityHtml);
}

function displayCommands() {
    chrome.commands.getAll(function (commands) {
        var commandsContainer = $('#remote-controls tbody');

        var chord;

        //Display all non-chord hotkeys
        for (var i = 0; i < commands.length; i++) {
            var description = commands[i]['description'];
            var shortcut = commands[i]['shortcut'];

            if (commands[i]['name'] == 'remote-chord')
                chord = shortcut;

            if (shortcut == '') {
                shortcut = "No shortcut";
                $('#shortcutsAlert').removeClass('hidden');
            }

            $('#remote-controls tr.template').clone()
            .find('.description').html(description).end()
            .find('.shortcut').html(shortcut).end()
            .appendTo(commandsContainer)
            .removeClass('template hidden');
        }

        //Display chord hotkeys
        //TODO: let people choose chord hotkeys..?
        for (var i = 0; i < commands.length; i++) {
            var shortcut;
            var description;

            if (chord == '')
                shortcut = 'No shortcut';
            else
                shortcut = chord + '&#10137;' + commands[i]['shortcut'];

            var description;

            switch (commands[i]['name']) {
                case 'remote-chord':
                    description = 'Cancel chord';
                    break;
                case 'remote-toggle':
                    description = 'Activate tab';
                    break;
                case 'remote-previous':
                    description = 'Dislike current song';
                    break;
                case 'remote-next':
                    description = 'Save current song';
                    break;

            }

            $('#remote-controls tr.template').clone()
            .find('.description').html(description).end()
            .find('.shortcut').html(shortcut).end()
            .appendTo(commandsContainer)
            .removeClass('template hidden');
        }

    });
}

//Save out the values of all input elements (assumes checkbox)
function saveOptions() {
    var output = 'Saving values...';
    $('#status').html(output);

    var valuesToSave = {};

    //Save out all non-null input
    $('input').each(function (i, el) {
        var key = el.id;
        var val = el.checked;

        //Only add if the value exists. Possibly check for valid input here..? WHY WOULD PEOPLE RUIN THINGS FOR THEMSELVES THOUGH?! ;___;
        if (val != null) {
            valuesToSave[key] = val;
        }
    });

    // Save it using the Chrome sync storage API.
    //chrome.storage.local.set   --  local storage.  5mb available.
    chrome.storage.sync.set(valuesToSave, function () {
        output += '<br />Saved options successfully!';
        $('#status').html(output);
    });

    //Don't reload page
    return false;
}

//Loads previously saved values
function loadValues() {
    var valuesToLoad = new Array();

    //Request all elements that might have a storage value
    $('input').each(function (i, el) {
        valuesToLoad[i] = el.id;
    });

    chrome.storage.sync.get(valuesToLoad, function (items) {
        console.log(chrome.runtime.lastError == null);

        //'items' is the associative array of values for the inputs with the key name
        for (key in items) {
            var input = $('#' + key);

            if (input.length == 1) {
                input.prop('checked', items[key]);
            }
        }
    });
}