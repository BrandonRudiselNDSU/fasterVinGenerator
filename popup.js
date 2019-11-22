var manifestData = chrome.runtime.getManifest();
var version = manifestData.version;
var oldCarValue = false;
var coolCarValue = false;
var page = ""; //tracks what is currently displaying, "" is main page
var previousVin = "" //holds the value of the last vin generated

setBoxes();         //always set boxes from memory before getting options
getOptionValues();  //always set options before loading vin
getVin();           //get vin on load

//this is the most important function in the entire project
//it runs upon clicking the submit button
//everything begins here
submitButton.onclick = function () {
    var input = document.getElementById('searchBox').value;
    if (input.charAt(0) == "/") {     //is a control command
        if (input.charAt(1) == "h")  //is a list history command
            { listVinHistory(); page = "h"; }
        else if (input.charAt(1) == "d")  //is a list decode history command
            { listDecodeHistory(); page = "d"; }
        else if (input.charAt(1) == "s")  //is a super-user tip request
            { superUserTips(); page = "s"; }
        else if (input.charAt(1) == "i") //is an info request
            { showInfo(); page = "i"; }
        else if (input.charAt(1) == "c") //is a clear history command
            { clearHistory(); page = "c"; }
        else if (input.charAt(1) == "v") //is a channel Log command
            { showChannelLog(); page = "v"; }
        else if (input.charAt(1) == "b") //is a back command
            { if(previousVin != "Something's wrong here...") { back(); } }  //if a previous vin exists, we can go back to it

        else if (Number.isInteger(parseInt(input.charAt(1)))) { //is copy-ing a previous vin
            var historyIndexString = input.substr(1,input.length);  //remove "/" and return the number
            var historyIndexInt = parseInt(historyIndexString);

            if(page == "d") { //is on decode history page. Is copy-ing a decode vin
                var transaction = db.transaction(["decodeRecord"], "readonly");
                var objectStore = transaction.objectStore("decodeRecord");

                var countRequest = objectStore.count(); //get length of database
                countRequest.onsuccess = function() {
                    var dbLength = countRequest.result; //once result returns save it in dbLength
                    //subtract one to account for zero based index, then subtract historyIndexInt from dbLength to get desired value from history
                    read(dbLength - (historyIndexInt - 1), "decodeRecord");
                }

                countRequest.onerror = function() {
                    alert("Failed to get a count on number of values in database");
                }
            }

            else if(page == "h") { //is on copy history page. Is copy-ing a copied vin
                var transaction = db.transaction(["vinRecord"], "readonly");
                var objectStore = transaction.objectStore("vinRecord");

                var countRequest = objectStore.count(); //get length of database
                countRequest.onsuccess = function() {
                    var dbLength = countRequest.result; //once result returns save it in dbLength
                    //subtract one to account for zero based index, then subtract historyIndexInt from dbLength to get desired value from history
                    read(dbLength - (historyIndexInt - 1), "vinRecord");
                }

                countRequest.onerror = function() {
                    alert("Failed to get a count on number of values in database");
                }
            }
            else
                location.reload();   //if not on either page, refresh
        }
    }
    else if (input.charAt(0) == "" && page == "") { //it's on the main page, don't reload, just get a new vin
        getVin();
    }
    else if (input.charAt(0) == "" && page != "") { //it's not on the main page, reload
        location.reload();
    }
    else {   //is a decode
        if (isValidVin(input)) { //if the vin is valid
        decodeVinAsyncOff(input);       //run with async off so that the result is definitely retrieved before stored
        var year = document.getElementById("yearBox").value;
        var make = document.getElementById("makeBox").value;
        var model = document.getElementById("modelBox").value;
        document.getElementById("vinBox").value = input;
        add(getTimeStamp() + " || " + input + " : " + year + " | " + make + " | " + model, "decodeRecord");
        }
        else{
            document.getElementById("yearBox").value = "";
            document.getElementById("makeBox").value = "Check Digit Failed Validation";
            document.getElementById("modelBox").value = "";
        }
    }

    document.getElementById("searchBox").value = "";    //clean up search box
    document.getElementById("searchBox").focus();       //returns text-cursor to searchbox
};

/*=============================================================================================
***********************************     MAJOR FUNCTIONS     ***********************************
=============================================================================================*/

function getVin(){
    previousVin = document.getElementById("vinBox").value;
    if(coolCarValue)
        var vin = coolCarArray[Math.floor(Math.random() * coolCarArray.length)];
    else if(oldCarValue)
        var vin = oldCarArray[Math.floor(Math.random() * oldCarArray.length)];
    else
        var vin = vinArray[Math.floor(Math.random() * vinArray.length)]; //returns any car
    document.getElementById("vinBox").value = vin;
    decodeVin(vin);
}

function decodeVin(vin){
    $.ajax({
    	url: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json",
    	type: "GET",
    	dataType: "json",
    	success: function(result){
    		printVehicleInfo(result.Results);
    	},
    	error: function(xhr, ajaxOptions, thrownError){
    		console.log(xhr.status);
    		console.log(thrownError);
    	}
    });
}

function decodeVinAsyncOff(vin){
    //deprecated function of javascript
    //so why use it?
    //when vins are decoded they're stored in history with the decode information
    //vins are decoded with async off to guarantee make, model, and year are stored with the vin
    $.ajax({
    	url: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json",
    	type: "GET",
    	dataType: "json",
    	async: false,
    	success: function(result){
            printVehicleInfo(result.Results);
    	},
    	error: function(xhr, ajaxOptions, thrownError){
    		console.log(xhr.status);
    		console.log(thrownError);
    	}
    });
}

/*=============================================================================================
***********************************     MINOR FUNCTIONS     ***********************************
=============================================================================================*/
function getSubheader() {
    var subheader = subheaderArray[Math.floor(Math.random() * subheaderArray.length)]; //gets any subheader

    document.getElementById("subheader").innerHTML
        = '<font color=\"white\">' + subheader + '</font>';

}

function back() {    //goes back one vin
    document.getElementById("vinBox").value = previousVin;
    decodeVin(previousVin);
}

function getTimeStamp() {    //returns time stamp for history
    var date = new Date();
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    var formattedDate = date.toDateString() + " " + hours.padStart(2,"0") + ":" + minutes.padStart(2,"0") + "." + seconds.padStart(2,"0");
    return formattedDate;
}

function printVehicleInfo(vehicleDataArray){
    //year make model
    document.getElementById("yearBox").value = vehicleDataArray[9].Value;
    document.getElementById("makeBox").value = vehicleDataArray[6].Value;
    document.getElementById("modelBox").value = vehicleDataArray[8].Value;

}

function isValidVin(input){
    //https://en.wikipedia.org/wiki/Vehicle_identification_number
    input = input.toLowerCase();
    if (!/^[a-hj-npr-z0-9]{8}[0-9x][a-hj-npr-z0-9]{8}$/.test(input)) {
        return false;
    }

    let transliterationTable = {'0': 0,'1': 1,'2': 2,'3': 3,'4': 4,'5': 5,'6': 6,'7': 7,
        '8': 8,'9': 9,'a': 1,'b': 2,'c': 3,'d': 4,'e': 5,'f': 6,'g': 7,'h': 8,'j': 1,
        'k': 2,'l': 3,'m': 4,'n': 5,'p': 7,'r': 9,'s': 2,'t': 3,'u': 4,'v': 5,'w': 6,
        'x': 7,'y': 8,'z': 9
    };

    let weightsTable = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;

    for (let i = 0; i < input.length; ++i) {
        sum += transliterationTable[input.charAt(i)] * weightsTable[i];
    }

    let mod = sum % 11;
    return mod === 10 ? input.charAt(8) === 'x' : input.charAt(8) == mod;
}

/*=============================================================================================
***************************************     HISTORY     ***************************************
=============================================================================================*/
function listVinHistory() {
    var historyString = "This is the history of VINS that have been generated and copied to the clipboard</br>" +
        "Enter '/#' to copy an item to clipboard</br></br>";
    var printedIndex = 1;

    var transaction = db.transaction("vinRecord", "readonly");
    var objectStore = transaction.objectStore("vinRecord");
    var request = objectStore.openCursor(null,"prev");
    request.onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
            historyString += "<font size = '2'><code>" + printedIndex + ": " + cursor.value.record + "</code></font></br>";
            printedIndex++;
            cursor.continue();
        } else {
            // no more results
        }
        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + historyString + '</font>';
    };
}

function listDecodeHistory() {
    var historyString = "This is the history of VINS that have been decoded</br>" +
        "Enter '/#' to copy an item to clipboard</br></br>";
    var printedIndex = 1;

    var transaction = db.transaction("decodeRecord", "readonly");
    var objectStore = transaction.objectStore("decodeRecord");
    var request = objectStore.openCursor(null,"prev");
    request.onsuccess = function(event) {
        var cursor = event.target.result;
        if(cursor) {
            historyString += "<font size = '2'><code>" + printedIndex + ": " + cursor.value.record + "</code></font></br>";
            printedIndex++;
            cursor.continue();
        } else {
            // no more results
        }
        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + historyString + '</font>';
    };
}

function clearHistory() {    //clears decode and copy history
    clearData();
    var clearText = "History Cleared</br></br>Hit Enter";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + clearText + '</font>';
}

function copy(ludicrousStatus) {
    var copyText = document.getElementById("vinBox").value;

    if(!ludicrousStatus)  //if ludicrous speed is not engaged, copy to history
        addCopied(getTimeStamp() + " || " + copyText, "vinRecord");
    else{
        var copyElement = document.getElementById("vinBox");
        copyElement.select();
        document.execCommand("copy");
        window.close();
    }
}

function historyCopy(text) {
    document.getElementById("searchBox").value = text;
    var copyText = document.getElementById("searchBox");
    copyText.select();
    document.execCommand("copy");
    window.close();
}

/*=============================================================================================
***************************************     OPTIONS     ***************************************
=============================================================================================*/
function getOptionValues(){
    getOldCarValue();
    getCoolCarValue();
    getLudiValue();     //comes last to guarantee options are set

    if(oldCarValue && coolCarValue){    //these options are mutually exclusive
        document.getElementById("coolCar").click();
    }
}

oldCar.onclick = function(){
    if(document.getElementById("coolCar").checked)
        document.getElementById("coolCar").checked = false;
    getOptionValues();
    getVin();
}
coolCar.onclick = function(){
    if(document.getElementById("oldCar").checked)
        document.getElementById("oldCar").checked = false;
    getOptionValues();
    getVin();
}

function getLudiValue() {
    if(document.getElementById("speed").checked){
        getVin();   //guarantee a vin is populated
        copy(true);
    }
}

speed.onclick = function () {
    if(document.getElementById("speed").checked) {
        alert("They've gone to plaid!!! \nCTRL + SHIFT + Y to disable");

        //get plaid colors
        var colors = "background:linear-gradient( 90deg," + getRandomColor() + " 0%,gold 10%,white 30%," + getRandomColor() + " 50%,gray 60%, " +
                     "" + getRandomColor() + " 80%," + getRandomColor() + " 100%),linear-gradient( 180deg," + getRandomColor() + " 0%," + getRandomColor() +
                     " 10%,white 30%," + getRandomColor() + " 50%,gray 60%,maroon 80%," + getRandomColor() + " 100%);background-size: "+
                     "4em 4em;background-color: #ffffff;background-blend-mode: multiply, normal;"

        document.getElementById("SearchResults").style = " width:600px; height:175px; border:5px solid black; " + colors;
        document.getElementById("vinBox").style = colors;
        document.getElementById("yearBox").style = colors;
        document.getElementById("makeBox").style = colors;
        document.getElementById("modelBox").style = colors;
    }
    else {
        document.getElementById("SearchResults").style = " width:600px; height:175px; background:#42464c; border:5px solid black;"
        document.getElementById("vinBox").style = "background:#42464c;"
        document.getElementById("yearBox").style = "background:#42464c"
        document.getElementById("makeBox").style = "background:#42464c"
        document.getElementById("modelBox").style = "background:#42464c"
    }
};

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getOldCarValue() {
    if(document.getElementById("oldCar").checked){
        oldCarValue = true;
    }
    else
        oldCarValue = false;
}

function getCoolCarValue() {
    if(document.getElementById("coolCar").checked){
        coolCarValue = true;
    }
    else
        coolCarValue = false;
}

function setBoxes(){    //I have no clue how this works
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

    var hinYear = localStorage.getItem("hinYear");
    if(hinYear != 20)
        document.getElementById("hinYear").value = hinYear;
    else
        document.getElementById("hinYear").value = "";
}

/*=============================================================================================
*****************************************     HINS    *****************************************
=============================================================================================*/
hinButton.onclick = function () {
    getHin();
};

function getHin(){
    var hinYear = document.getElementById("hinYear").value;
    if(hinYear == "")
        hinYear = 20
    if(hinYear.length < 2)
        hinYear = "0" + hinYear
    document.getElementById("searchBox").focus();
    document.getElementById("vinBox").value = letters(3) + numbers(5) + hinMonth() + numbers(1) + hinYear;
    var year = document.getElementById("yearBox");
    var make = document.getElementById("makeBox");
    var model = document.getElementById("modelBox");
    year.value = "";
    make.value = "Boats don't deserve decodes.";
    model.value = "";

    localStorage.setItem("hinYear", hinYear);
}

function letters(length) {
   var result           = '';
   var characters       = 'ABCDEFGHJKLMNPRSTUVWXYZ'; //removed IOQ
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function hinMonth() {
   var result           = '';
   var characters       = 'ABCDEFGHJKL'; //A is January, L is December. No I
   var charactersLength = characters.length;
   result += characters.charAt(Math.floor(Math.random() * charactersLength));
   return result;
}

function numbers(length){
    var result           = '';
   var characters       = '0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/*=============================================================================================
*****************************************     TEXT    *****************************************
=============================================================================================*/
var subheaderArray = [
    "The only vin generator that <i>remembers</i>",
    "The only vin generator that <i>doesn't suck</i>",
    "The only vin generator that <i>really cares</i>",
    "The only vin generator that <i>loves you too</i>",
    "The only vin generator that <i>generates hins</i>",
    "The only vin generator that <i>actually listens</i>",
    "The only vin generator that <i>reverses hair loss</i>",
    "The only vin generator that's <i>just someone's vanity project</i>",
    "Billions and billions of VINS served",
    "The best thing to come from Arkansas since cheese dip",
    "Now GNU licensed. Stallman be praised",
    "Originally called 'Vinny'",
    "It puts the 'vin' into <i>'time-saving'</i>",
    "It puts the 'vin' into <i>'vinaigrette'</i>",
    "Send your money: paypal.me/fasterVin",
    "Send your hate mail: <i>brandonrudisel@gmail.com</i>",
    "Banned in Mississippi",
    "Mostly tested",
    "<i>Version: " + version + "</i>",
    "Powered by hatred, and NHTSA",
    "First hit's free",
    "Powered by Vin Diesel",
    "From the inventor of vin humor",
    "Over 100 <strike>suckers</strike> <b>users!</b>"]

getSubheader();   //get subheader on load
                  //must come after subheader array is declared

function showInfo() {
    var infoString = "It actually doesn't generate anything. It just randomly returns a hard coded vin.</br>" +
    "Hover over options to learn their function.</br>" +
    "Made by Brandon Rudisel.<br>To send money: paypal.me/fasterVin</br>To send hate mail: brandonrudisel@gmail.com</br></br></br>" +
    "<b>Hit enter to go back</b></br>" +
    "Powered by hatred, and NHTSA </br><i>Version: " + version + "</i>";

    document.getElementById("SearchResults").innerHTML =
        '<font color=\"white\">' + infoString + '</font>';
}

function showChannelLog() {     //Shows differences between versions
    var channelLog =
    "1.6.0.2 New subheaders, tweak plaid function, tweak randomness. 11/21/19</br></br>" +
    "1.6.0.1 Note: Don't remove stuff from background.js if you don't know what it does. 11/09/19</br></br>" +
    "1.6.0.0 Add cool cars, add check digit validation, add options, add plaid, refactor code. 11/07/19</br></br>" +
    "1.5.0.1 Fix hanging window, add back one vin feature. 09/15/19</br></br>" +
    "1.5.0.0 Add vin history in addition to decode history. New power commands. New subheaders. 08/11/19</br></br>" +
    "1.4.0.4 NHTSA changed their decode results, so I fixed that. 7/19/19</br></br>" +
    "1.4.0.3 Finished vin purge. Should always populate all fields. 7/14/19</br></br>" +
    "1.4.0.2 Began junk vin purge, removed about 100 vins. 6/30/19</br></br>" +
    "1.4.0.1 Removed 20-ish junk VINS 6/2/19</br></br>" +
    "1.4.0.0 add year option for HINS, minified for more speed, removed half(ish) of the Acuras 5/24/19</br></br>" +
    "1.3.1.0 I'm a stupid person and I did HINs wrong 5/20/19</br></br>" +
    "1.3.0.0 adds a HIN generator, ludicrous speed warning, and a new logo 5/19/19</br></br>" +
    "1.2.0.0 fixes decode history</br></br>" +
    "1.1.0.0 and earlier was before time. I dunno what happened back then.";

        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + channelLog + '</font>';
}

function superUserTips(){
    var superUserTips =
    "These are the super-user shortcuts and commands for Faster Vin Generator.</br>" +
    "Commands can be entered into the decode bar to use built-in tools.<br></br>" +
    "Shortcuts:</br>" +
    "<tt>Ctrl + Shift + Z opens and closes FVG</br>" +
    "Ctrl + C copies a VIN, and closes FVG</br>" +
    "Ctrl + A copies a HIN, and closes FVG</br>" +
    "Ctrl + Shift + Y clears all options</br></br>" +
    "Commands:</br>" +
    "/h || List history of copied VINS</br>" +
    "/d || List history of decoded VINS</br>" +
    "/b || Back one VIN</br>" +
    "/c || Clears history</br>" +
    "/i || Displays info about Faster Vin Generator</br>" +
    "/v || Displays version history<tt></br>";

        document.getElementById("SearchResults").innerHTML =
                    '<font color=\"white\">' + superUserTips + '</font>';
}