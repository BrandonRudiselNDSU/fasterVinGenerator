//a file to hold key event listeners
//these are necessary to get desirable function out of keyboard keys

//when searchBox is focused, can hit enter to enter text
//when searchbox is focused, can hit ctrl + c to copy vin text
var searchBox = document.getElementById("searchBox");
searchBox.addEventListener("keydown", function(event) {
    if (event.keyCode === 13) { //enter key
        document.getElementById("submitButton").click();
    }
    if (event.keyCode === 17) { //Ctrl
        searchBox.addEventListener("keydown", function(event) {
            if (event.keyCode === 67) { //'C' to copy VIN
                copy();
            }
            if (event.keyCode === 65) { //'A' to copy HIN
                getHin();
                copy();
            }
        });
    }
});
