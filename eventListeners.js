//a file to hold key event listeners
//these are necessary to get desirable function out of keyboard keys

//this function allows a user to hit enter to submit search when the search box is focused
var searchBox = document.getElementById("searchBox");
searchBox.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 17) {
        searchBox.addEventListener("keydown", function(event) {
            event.preventDefault();
            if (event.keyCode === 67 && !copied) {
                copy();
            }
        });
    }
});

/*========================================================================================
The rest of these blocks allow the user to hit enter to search when a checkbox is in focus
 =========================================================================================*/
var oldCarCheckBox = document.getElementById("oldCarCheckbox");
oldCarCheckBox.addEventListener("keydown", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 32) {
        document.getElementById("oldCarCheckbox").click();
    }
});

var coolCarCheckBox = document.getElementById("coolCarCheckbox");
coolCarCheckBox.addEventListener("keydown", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 32) {
        document.getElementById("coolCarCheckbox").click();
    }
});

