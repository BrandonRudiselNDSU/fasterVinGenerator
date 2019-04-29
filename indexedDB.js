//prefixes of implementation that we want to test
window.indexedDB = window.indexedDB || window.mozIndexedDB ||
window.webkitIndexedDB || window.msIndexedDB;

//prefixes of window.IDB objects
window.IDBTransaction = window.IDBTransaction ||
window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
window.msIDBKeyRange

if (!window.indexedDB) {
    window.alert("Your browser doesn't support a stable version of IndexedDB.")
}

var db;
var request = window.indexedDB.open("history", 2);

request.onerror = function(event) {
    console.log("error: ");
};

request.onsuccess = function(event) {
    db = request.result;
    console.log("success: "+ db);
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("record", {autoIncrement:true});
}

function read() {
    var transaction = db.transaction(["record"]);
    var objectStore = transaction.objectStore("record");
    var request = objectStore.get(1);

    request.onerror = function(event) {
        alert("Unable to retrieve data from database!");
    };

    request.onsuccess = function(event) {
        if(request.result) {
            alert(request.result.record);
        } else {
            alert("Could not find value");
        }
    };
}

function add(record) {
    var request = db.transaction(["record"], "readwrite")
    .objectStore("record")
    .add({record: record});

    request.onsuccess = function(event) {
        //do nothing
        console.log("Add record");
    };

    request.onerror = function(event) {
        alert("Unable to add data");
    }
}

function clearData(){
    var transaction = db.transaction(["record"],"readwrite");
    var objectStore = transaction.objectStore("record");

    objectStore.clear();
}

function getCount(){
    var transaction = db.transaction(["record"], "readonly");
    var objectStore = transaction.objectStore("record");

    var countRequest = objectStore.count();
    countRequest.onsuccess = function() {
        return countRequest.result;
    }
}