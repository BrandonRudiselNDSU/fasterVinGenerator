//a file to hold key event listeners
//these are necessary to get desirable function out of keyboard keys

//when searchBox is focused, can hit enter to enter text
//when searchbox is focused, can hit ctrl + c to copy vin text
var searchBox = document.getElementById("searchBox");
searchBox.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 17) {
        searchBox.addEventListener("keydown", function(event) {
            if (event.keyCode === 67) {
                copy();
            }
        });
    }
});

/*========================================================================================
The rest of these blocks allow the user to hit enter to search when a checkbox is in focus
 =========================================================================================*/
/*var oldCarCheckBox = document.getElementById("oldCarCheckbox");
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

*/