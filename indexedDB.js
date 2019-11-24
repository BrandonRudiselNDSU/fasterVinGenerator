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
    var oldVin;
        if(request.result) {
            oldVin = request.result.record;
            oldVin = oldVin.substr(oldVin.indexOf("|| ") + 3, oldVin.length - 1); //remove time stamp
            if(data == "decodeRecord") //if it's a decoded vin, it has a decode that must be removed too
                oldVin = oldVin.substr(0, oldVin.indexOf(" : ")); //remove year/make/model from text
            historyCopy(oldVin);
        } else {
            alert("Could not find value");
            console.log(request.error);
        }
    };
}

function add(record, data) {
    var request = db.transaction([data], "readwrite")
    .objectStore(data)
    .add({record: record});

    request.onsuccess = function(event) {
        //do nothing
        console.log("Add record");
    };

    request.onerror = function(event) {
        alert("Unable to add data");
    }
}

function addCopied(record, data) {
    var request = db.transaction([data], "readwrite")
    .objectStore(data)
    .add({record: record});

    request.onsuccess = function(event) {
        var copyElement = document.getElementById("vinBox");
        copyElement.select();
        document.execCommand("copy");
        window.close();
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