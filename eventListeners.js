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
checkbox persistence
 =========================================================================================*/
var checkboxValues = JSON.parse(localStorage.getItem('checkboxValues')) || {},
    $checkboxes = $("#SearchResults :checkbox");

$checkboxes.on("change", function(){
  $checkboxes.each(function(){
    checkboxValues[this.id] = this.checked;
  });

  localStorage.setItem("checkboxValues", JSON.stringify(checkboxValues));
});

// On page load
$.each(checkboxValues, function(key, value) {
  $("#" + key).prop('checked', value);
});