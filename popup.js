var storage = window.localStorage;
var searchCounter = storage.length;
var copied = false;


submitButton.onclick = function () {   //this function runs upon clicking the submit button
    var input = searchString = document.getElementById('searchBox').value;

    if (input.charAt(0) == "/") {     //is a control command
        if (input.charAt(1) == "h")  //is a list history command
            listHistory();
        else if (input.charAt(1) == "c") //is a clear history command
            clearHistory();
        else if (Number.isInteger(parseInt(input.charAt(1)))) { //is redoing a previous search
            // prepare search and category data for search
            searchString = storage.getItem(input.charAt(1));
            searchString = searchString.substr(searchString.indexOf("|| ") + 3, searchString.length - 1); //remove time stamp
            boxes = searchString.substr(searchString.indexOf(": ") + 2, searchString.length - 1); //grab categories
            boxes = boxes.trim();
            boxes = boxes.split(" "); //put categories in an array
            searchString = searchString.substr(0, searchString.indexOf(": ")); //remove categories from search phrase

            search(searchString, boxes);
        }
    } else {   //is a search
        var historySearch = searchString = document.getElementById('searchBox').value + " : " + getCheckedBoxes(); //
        storage.setItem(searchCounter, getTimeStamp() + " || " + historySearch);
        searchCounter++;
        var boxes = getCheckedBoxes();
        boxes = boxes.split(" "); //prepare categories in array

        search(searchString, boxes);
    }

    document.getElementById("searchBox").value = ""; //clean up search box
    document.getElementById("searchBox").focus();
    copied = false;
};

function search(searchString, boxes) {  //handles searching
    var output = "";
    var checked = 0;

    for (var i = 0; i < boxes.length; i++) { //read categories
        output += '<font size="5">' + boxes[i] + ':</font>' +
            '<br>Placeholder data for search: ' + searchString + '<br><br>';
        checked += 1;
    }

    if (searchString === "") {
        output = "Searched for nothing"; // check search
    }

    if (checked === 0) {
        output = "No categories specified"; // check categories
    }

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">'
        + output + '</font>';
}

function listHistory() {     //lists search history
    var historyString = "Enter '/#' to search an item again</br>Enter '/clear' to clear Search History</br></br>";

    for (var i = 1; i < searchCounter; i++) {
        historyString += i + ": " + storage.getItem(localStorage.key(i)) + "</br>";
    }

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + historyString + '</font>';
}

function clearHistory() {    //clears search history
    storage.clear();
    searchCounter = 1;
    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + "Search History Cleared" + '</font>';
    storage.setItem(0, ""); //placeholder string for the zero-ith position
}

function getTimeStamp() {    //returns time stamp
    var date = new Date();
    var formattedDate = date.toDateString() + " " + date.getHours() + ":" + date.getMinutes() + "." + date.getSeconds();
    return formattedDate;
}

function getCheckedBoxes() {    //returns the values checked in the boxes
    var boxes = document.getElementsByName('searchType');
    var txt = "";
    var i;

    for (i = 0; i < boxes.length; i++) {
        if (boxes[i].checked) {
            txt = txt + boxes[i].value + " ";
        }
    }
    txt = txt.trim();
    return txt;
}

function copy() {
  /* Get the text field */
  var copyText = document.getElementById("vinBox");

  /* Select the text field */
  copyText.select();

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  //alert("Copied the text: " + copyText.value);
  copied = true;
  window.close();
}

$.ajax({
	url: "https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeId/440?format=json",
	type: "GET",
	dataType: "json",
	success: function(result)
	{
		console.log(result);
	},
	error: function(xhr, ajaxOptions, thrownError)
	{
		console.log(xhr.status);
		console.log(thrownError);
	}
});