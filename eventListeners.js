//a file to hold key event listeners
//these are necessary to get desirable function out of keyboard keys

//this function allows a user to hit enter to submit search when the search box is focused
var searchBox = document.getElementById("searchBox");
searchBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
});

/*========================================================================================
The rest of these blocks allow the user to hit enter to search when a checkbox is in focus
 =========================================================================================*/
var songCheckBox = document.getElementById("songCheckbox");
songCheckBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 32) {
        document.getElementById("songCheckbox").click();
    }
});

var albumCheckBox = document.getElementById("albumCheckbox");
albumCheckBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 32) {
        document.getElementById("albumCheckbox").click();
    }
});

