//this file contains all the functionality of Indexed DB
//I have no clue what's going on here anymore. But it works.

//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB ||
window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction ||
window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
window.msIDBKeyRange

var db;
var request = window.indexedDB.open("history", 3);

request.onerror = function(event) {
    console.log("error: new database failed");
};

request.onsuccess = function(event) {
    db = request.result;
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var decodeTable = db.createObjectStore("decodeRecord", {autoIncrement:true});
    var vinTable = db.createObjectStore("vinRecord", {autoIncrement:true});
}

function read(index, data) {
    var transaction = db.transaction([data]);
    var objectStore = transaction.objectStore([data]);
    var request = objectStore.get(index);

    request.onerror = function(event) {
        alert("Unable to retrieve data from database!");
    };

    request.onsuccess = function(event) {
    var retrievedVin;
        if(request.result) {
            retrievedVin = request.result.record;
            retrievedVin = retrievedVin.substr(retrievedVin.indexOf("|| ") + 3, retrievedVin.length - 1); //remove time stamp
            retrievedVin = retrievedVin.substr(0, retrievedVin.indexOf(" : ")); //remove year/make/model from text
            document.getElementById("searchBox").value = retrievedVin;      //copyVin() won't work here
            var searchBoxElement = document.getElementById("searchBox");    //hence the special logic
            searchBoxElement.select();
            document.execCommand("copy");
            window.close();
        } else {
            alert("Could not find value");
            console.log(request.error);
        }
    };
}

function addRecord(record, data) {
    var request = db.transaction([data], "readwrite")
    .objectStore(data)
    .add({record: record});

    request.onsuccess = function(event) {
        if(data == "vinRecord") //if it's not a decode, we need to copy and close after storing
            copyVin(false);
    };

    request.onerror = function(event) {
        alert("Unable to add data");
    }
}

function clearData(){
    var historyDeleteRequest = window.indexedDB.deleteDatabase("history");
    historyDeleteRequest.onerror = function(event) {
      alert("Error deleting decode database.");
    };
}