//a file to hold key event listeners
//these are necessary to get desirable function out of keyboard keys

//run on start
showResult();

//this function allows a user to hit enter to submit search when the search box is focused
var searchBox = document.getElementById("searchBox");
searchBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
});

var vinBox = document.getElementById("vinBox");  //ctrl is 17 c is 67
vinBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 17) {
        vinBox.addEventListener("keyup", function(event) {
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
oldCarCheckBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 32) {
        document.getElementById("oldCarCheckbox").click();
    }
});

var coolCarCheckBox = document.getElementById("coolCarCheckbox");
coolCarCheckBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 32) {
        document.getElementById("coolCarCheckbox").click();
    }
});

