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
 var request = window.indexedDB.open("history", 1);

 request.onerror = function(event) {
    console.log("error: ");
 };

 request.onsuccess = function(event) {
    db = request.result;
    console.log("success: "+ db);
 };

 request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("record", {keyPath: "id"});

    for (var i in historyData) {
       objectStore.add(historyData[i]);
    }
 }

 function read() {
    var transaction = db.transaction(["record"]);
    var objectStore = transaction.objectStore("record");
    var request = objectStore.get("00-03");

    request.onerror = function(event) {
       alert("Unable to retrieve data from database!");
    };

    request.onsuccess = function(event) {
       // Do something with the request.result!
       if(request.result) {
          alert("Name: " + request.result.name + ", Age: " + request.result.age + ", Email: " + request.result.email);
       } else {
          alert("It wasn't found in the database");
       }
    };
 }

 function readAll() {
    var objectStore = db.transaction("record").objectStore("record");

    objectStore.openCursor().onsuccess = function(event) {
       var cursor = event.target.result;

       if (cursor) {
          alert("Name for id " + cursor.key + " is " + cursor.value.name + ", Age: " + cursor.value.age + ", Email: " + cursor.value.email);
          cursor.continue();
       } else {
          alert("No more entries!");
       }
    };
 }

 function add() {
    var request = db.transaction(["employee"], "readwrite")
    .objectStore("employee")
    .add({ id: "00-03", name: "Kenny", age: 19, email: "kenny@planet.org" });

    request.onsuccess = function(event) {
       alert("Kenny has been added to your database.");
    };

    request.onerror = function(event) {
       alert("Unable to add data\r\nKenny is aready exist in your database! ");
    }
 }

 function remove() {
    var request = db.transaction(["employee"], "readwrite")
    .objectStore("employee")
    .delete("00-03");

    request.onsuccess = function(event) {
       alert("Kenny's entry has been removed from your database.");
    };
 }

function readAll() {
   var objectStore = db.transaction("employee").objectStore("employee");

   objectStore.openCursor().onsuccess = function(event) {
      var cursor = event.target.result;

      if (cursor) {
         alert("Name for id " + cursor.key + " is " + cursor.value.name + ", Age: " + cursor.value.age + ", Email: " + cursor.value.email);
         cursor.continue();
      } else {
         alert("No more entries!");
      }
   };
}