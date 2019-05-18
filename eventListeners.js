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

var hinButton = document.getElementById("hinButton");
hinButton.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 17) {
        hinButton.addEventListener("keydown", function(event) {
            if (event.keyCode === 67) {
                copy();
            }
        });
    }
});
