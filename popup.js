var manifestData = chrome.runtime.getManifest();
var version = manifestData.version;
var oldCarValue = false;
var coolCarValue = false;
var page = "";       //tracks what is currently displaying, "" is main page
var previousVin = "" //holds the value of the last vin generated

setBoxes();         //always set boxes from memory before getting options
getOptionValues();  //always set options before loading vin
getVin();           //get vin on load

//consider this the spinal cord of the project
submitButton.onclick = function () {
    var input = document.getElementById('searchBox').value;
    if (input.charAt(0) == "/") {     //is a control command
        if (input.charAt(1) == "h")   //is a list copy history command
            { listHistory("vinRecord"); page = "h"; }
        else if (input.charAt(1) == "d")  //is a list decode history command
            { listHistory("decodeRecord"); page = "d"; }
        else if (input.charAt(1) == "s")  //is a super-user tip request
            { superUserTips(); page = "s"; }
        else if (input.charAt(1) == "i") //is an info request
            { showInfo(); page = "i"; }
        else if (input.charAt(1) == "m") //open vin manager
            { vinManager(); page = "m"; }
        else if (input.charAt(1) == "c") //is a clear history command
            { clearHistory(); page = "c"; }
        else if (input.charAt(1) == "v") //is a channel Log command
            { showChannelLog(); page = "v"; }
        else if (input.charAt(1) == "p") //is a channel Log command
            { privacyPolicy(); page = "p"; } //is a privacy policy command
        else if (input.charAt(1) == "b") //is a back command
            { if(previousVin != "Something's wrong here...") { back(); } }  //if a previous vin exists, we can go back to it

        else if (Number.isInteger(parseInt(input.charAt(1)))) { //is copy-ing a previous vin
            if(page == "d") //is on decode history page. Is copy-ing a decode vin
                getDBValue(input, "decodeRecord");
            else if(page == "h") //is on copy history page. Is copy-ing a copied vin
                getDBValue(input, "vinRecord");
            else
                location.reload();   //if not on either page, refresh
        }
    }
    else if (input.charAt(0) == "" && page == "")   //it's on the main page, don't reload, just get a new vin
        getVin();
    else if (input.charAt(0) == "" && page != "")   //it's not on the main page, reload
        location.reload();
    else {   //is a decode
        if (isValidVin(input))        //if the vin is valid
            decodeVin(input, true);
        else
            decodeMessage("Check Digit Failed Validation");
    }
    document.getElementById("searchBox").value = "";    //clean up search box
    document.getElementById("searchBox").focus();       //returns text-cursor to searchbox
};

/*=============================================================================================
***********************************     MAJOR FUNCTIONS     ***********************************
=============================================================================================*/
function decodeVin(vin, userInput){
    decodeMessage("Decoding...");
    $.ajax({
    	url: "https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/" + vin + "?format=json",
    	type: "GET",
    	dataType: "json",
    	success: function(result){
    	    document.getElementById("yearBox").value = result.Results[9].Value;
    	    document.getElementById("makeBox").value = result.Results[6].Value;
            document.getElementById("modelBox").value = result.Results[8].Value;
    		if (userInput)      //if the user entered this vin for decoding, store it
    		    storeRecord(vin, "decodeRecord");
    	}, error: function(xhr, ajaxOptions, thrownError){
    		console.log(xhr.status);
    		console.log(thrownError);
    	}
    });
}

function getVin(){
    previousVin = document.getElementById("vinBox").value;
    if(coolCarValue)
        var vin = coolCarArray[Math.floor(Math.random() * coolCarArray.length)];
    else if(oldCarValue)
        var vin = oldCarArray[Math.floor(Math.random() * oldCarArray.length)];
    else
        var vin = vinArray[Math.floor(Math.random() * vinArray.length)]; //returns any car
    document.getElementById("vinBox").value = vin;
    decodeVin(vin, false);
}

function getSubheader() {
    var subheader = subheaderArray[Math.floor(Math.random() * subheaderArray.length)]; //gets any subheader

    document.getElementById("subheader").innerHTML
        = '<font color=\"white\">' + subheader + '</font>';
}

/*=============================================================================================
***********************************     MINOR FUNCTIONS     ***********************************
=============================================================================================*/
function isValidVin(input){ //https://en.wikipedia.org/wiki/Vehicle_identification_number
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
    for (let i = 0; i < input.length; ++i)
        sum += transliterationTable[input.charAt(i)] * weightsTable[i];
    let mod = sum % 11;
    return mod === 10 ? input.charAt(8) === 'x' : input.charAt(8) == mod;
}

function getDBValue(input, database) {
    var historyIndexString = input.substr(1,input.length);  //remove "/" and return the number
    var historyIndexInt = parseInt(historyIndexString);

    var transaction = db.transaction([database], "readonly");
    var objectStore = transaction.objectStore(database);
    var countRequest = objectStore.count(); //get length of database
    countRequest.onsuccess = function() {
        var dbLength = countRequest.result; //once result returns save it in dbLength
        //subtract one to account for zero based index, then subtract historyIndexInt from dbLength to get desired value from history
        read(dbLength - (historyIndexInt - 1), database);
    }
    countRequest.onerror = function() {
            alert("Failed to get a count on number of values in database");
    }
}

function getTimeStamp() {    //returns time stamp for history
    var date = new Date();
    var hours = date.getHours().toString();
    var minutes = date.getMinutes().toString();
    var seconds = date.getSeconds().toString();
    var formattedDate = date.toDateString() + " " + hours.padStart(2,"0") + ":" + minutes.padStart(2,"0") + "." + seconds.padStart(2,"0");
    return formattedDate;
}

function decodeMessage(message) {       //clears year and model while passing message into make
    document.getElementById("yearBox").value = "";
    document.getElementById("makeBox").value = message;
    document.getElementById("modelBox").value = "";
}

function back() {    //goes back one vin
    document.getElementById("vinBox").value = previousVin;
    decodeVin(previousVin, false);
}

/*=============================================================================================
***************************************     HISTORY     ***************************************
=============================================================================================*/
function listDatabase(historyString, database){
    var printedIndex = 1;   //this is the number next to the listed row
    var transaction = db.transaction([database], "readonly");
    var objectStore = transaction.objectStore(database);
    var countRequest = objectStore.count(); //get length of database for padding later

    countRequest.onsuccess = function() {
        var dbDigitsInLength = countRequest.result.toString().length; //get num of digits in the count of indexes in this database
        var transaction = db.transaction(database, "readonly");
        var objectStore = transaction.objectStore(database);
        var request = objectStore.openCursor(null,"prev");
        request.onsuccess = function(event) {
            var cursor = event.target.result;
            if(cursor) {
                historyString += printedIndex.toString().padStart(dbDigitsInLength, ' ') + ": " + cursor.value.record + "</br>";
                printedIndex++;
                cursor.continue();
            }
            document.getElementById("SearchResults").innerHTML =
                        "<pre><font size = '2'; color=\"white\">" + historyString + "</font></pre>";
        };
    }
    countRequest.onerror = function() {
        alert("Failed to get a count on number of values in database");
    }
}

function listHistory(database) {
    if (database == "vinRecord") {
        var historyString = "This is the history of VINS that have been generated and copied to the clipboard</br>" +
            "Enter '/#' to copy an item to clipboard</br></br>";
        listDatabase(historyString, database);
    }
    if (database == "decodeRecord"){
        var historyString = "This is the history of VINS that have been decoded</br>" +
            "Enter '/#' to copy an item to clipboard</br></br>";
        listDatabase(historyString, database)
    }
}

function storeRecord(vin, database) {
    var year = document.getElementById("yearBox").value;
    var make = document.getElementById("makeBox").value;
    var model = document.getElementById("modelBox").value;
    var decode;
    if (year == "")
        decode = "Vin copied before decode returned"
    else
        decode = year + " | " + make + " | " + model
    document.getElementById("vinBox").value = vin;
    addRecord(getTimeStamp() + " || " + vin + " : " + decode, database);
}

function copyVin(storeVin) {   //this copies the value in the vinBox
    if(storeVin)  //allows caller to choose to store vin
        storeRecord(document.getElementById("vinBox").value, "vinRecord");
    else{
        var copyElement = document.getElementById("vinBox");
        copyElement.select();
        document.execCommand("copy");
        window.close();
    }
}

function clearHistory() {    //clears decode and copy history
    clearData();
    var clearText = "History Cleared</br></br>Hit Enter";

    document.getElementById("SearchResults").innerHTML =
        "<font color=\"white\">" + clearText + "</font>";
}

/*=============================================================================================
***************************************     OPTIONS     ***************************************
=============================================================================================*/
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
    } else {
        document.getElementById("SearchResults").style = " width:600px; height:175px; background:#42464c; border:5px solid black;"
        document.getElementById("vinBox").style = "background:#42464c;"
        document.getElementById("yearBox").style = "background:#42464c"
        document.getElementById("makeBox").style = "background:#42464c"
        document.getElementById("modelBox").style = "background:#42464c"
    }
};

function setBoxes(){    //I have no clue how this works
    var checkboxValues = JSON.parse(localStorage.getItem('checkboxValues')) || {},
        $checkboxes = $("#SearchResults :checkbox");

    $checkboxes.on("change", function(){
      $checkboxes.each(function(){
        checkboxValues[this.id] = this.checked;
      });
      localStorage.setItem("checkboxValues", JSON.stringify(checkboxValues));
    });

    $.each(checkboxValues, function(key, value) {   // On page load
      $("#" + key).prop('checked', value);
    });

    var hinYear = localStorage.getItem("hinYear");
    if(hinYear != 20)
        document.getElementById("hinYear").value = hinYear;
    else
        document.getElementById("hinYear").value = "";
}

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
        copyVin(false);
    }
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++)
    color += letters[Math.floor(Math.random() * 16)];
  return color;
}

function getOldCarValue() {
    if(document.getElementById("oldCar").checked){
        oldCarValue = true;
    } else
        oldCarValue = false;
}

function getCoolCarValue() {
    if(document.getElementById("coolCar").checked){
        coolCarValue = true;
    } else
        coolCarValue = false;
}

/*=============================================================================================
*****************************************     HINS    *****************************************
=============================================================================================*/
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
    decodeMessage("Boats don't deserve decodes");

    localStorage.setItem("hinYear", hinYear);
}

function letters(length) {
   var result           = '';
   var characters       = 'ABCDEFGHJKLMNPRSTUVWXYZ'; //removed IOQ
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ )
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   return result;
}

function numbers(length){
    var result           = '';
   var characters       = '0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ )
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   return result;
}

function hinMonth() {
   var result           = '';
   var characters       = 'ABCDEFGHJKL'; //A is January, L is December. No I
   var charactersLength = characters.length;
   result += characters.charAt(Math.floor(Math.random() * charactersLength));
   return result;
}

hinButton.onclick = function () {
    getHin();
};

/*=============================================================================================
*****************************************     TEXT    *****************************************
=============================================================================================*/
function vinManager() {
    var infoString = "It actually doesn't generate anything. It just randomly returns a hard coded vin.</br>" +
    "Hover over options to learn their function.</br>" +
    "Made by Brandon Rudisel.<br>To send money: paypal.me/fasterVin</br>To send hate mail: 1600 Amphitheatre Parkway</br></br></br>" +
    "<b>Hit enter to go back</b></br>" +
    "Powered by hatred, and NHTSA </br><i>Version: " + version + "</i>";

    document.getElementById("SearchResults").innerHTML =
        "<font color=\"white\">" + infoString + "</font>";
}

function showChannelLog() {     //Shows differences between versions
    var channelLog =
    "1.6.1.5 CSS Fix 7/27/20</br></br>" +
    "1.6.1.4 Add new feature, privacy policy 06/10/20</br></br>" +
    "1.6.1.3 Add new feature, VIN manager. Allows user to add and remove VINs. 03/06/20</br></br>" +
    "1.6.1.2 Add more cool cars, and a new subheader. 03/04/20</br></br>" +
    "1.6.1.1 Removed decode from vin history copy. 11/30/19</br></br>" +
    "1.6.1.0 Removed some Acuras, code overhaul, tweaks: plaid function, randomness, history listings. 11/24/19</br></br>" +
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
                    "<font color=\"white\">" + channelLog + "</font>";
}

function privacyPolicy() {
    var channelLog =
    "No personal information is collected, or transmitted. </br>Ever."
        document.getElementById("SearchResults").innerHTML =
                    "<font color=\"white\">" + channelLog + "</font>";
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
    "/m || Manage VINs</br>" +
    "/b || Back one VIN</br>" +
    "/c || Clears history</br>" +
    "/i || Displays info about Faster Vin Generator</br>" +
    "/v || Displays version history<tt></br>";

        document.getElementById("SearchResults").innerHTML =
                    "<font color=\"white\">" + superUserTips + "</font>";
}

function showInfo() {
    var infoString = "It actually doesn't generate anything. It just randomly returns a hard coded vin.</br>" +
    "Hover over options to learn their function.</br>" +
    "Made by Brandon Rudisel.<br>To send money: paypal.me/fasterVin</br>To send hate mail: brandonrudisel@gmail.com</br></br></br>" +
    "<b>Hit enter to go back</b></br>" +
    "Powered by hatred, and NHTSA </br><i>Version: " + version + "</i>";

    document.getElementById("SearchResults").innerHTML =
        "<font color=\"white\">" + infoString + "</font>";
}

var subheaderArray = [
    "The only vin generator that <i>remembers</i>",
    "The only vin generator that <i>doesn't suck</i>",
    "The only vin generator that <i>really cares</i>",
    "The only vin generator that <i>loves you too</i>",
    "The only vin generator that <i>generates HINs</i>",
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
    "Send your hate mail: <i>1600 Amphitheatre Parkway</i>",
    "Banned in Mississippi",
    "Mostly tested",
    "<i>Version: " + version + "</i>",
    "Powered by hatred, and NHTSA",
    "First hit's free",
    "Powered by Vin Diesel",
    "From the inventor of vin humor",
    "Over 100 <strike>suckers</strike> <b>daily users!</b>",
    "\"Super helpful for work\" -Charles"]

//get subheader on load
//must come after subheader array is declared
getSubheader();