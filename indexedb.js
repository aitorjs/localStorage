var html5rocks = {};
var indexedDB = window.indexedDB || window.webkitIndexedDB ||
                window.mozIndexedDB;

if ('webkitIndexedDB' in window) {
  window.IDBTransaction = window.webkitIDBTransaction;
  window.IDBKeyRange = window.webkitIDBKeyRange;
}

html5rocks.indexedDB = {};
html5rocks.indexedDB.db = null;

html5rocks.indexedDB.onerror = function(e) {
  console.log(e);
};

html5rocks.indexedDB.open = function() {
  var request = indexedDB.open("todos");

  request.onsuccess = function(e) {
    var v = "1.99";
    html5rocks.indexedDB.db = e.target.result;
    var db = html5rocks.indexedDB.db;
    // We can only create Object stores in a setVersion transaction;
    if (v!= db.version) {
      var setVrequest = db.setVersion(v);

      // onsuccess is the only place we can create Object Stores
      setVrequest.onerror = html5rocks.indexedDB.onerror;
      setVrequest.onsuccess = function(e) {
        if(db.objectStoreNames.contains("todo")) {
          db.deleteObjectStore("todo");
        }

        var store = db.createObjectStore("todo",
          {keyPath: "timeStamp"});

        html5rocks.indexedDB.getAllTodoItems();
      };
    }
    else {
      html5rocks.indexedDB.getAllTodoItems();
    }
  };

  request.onerror = html5rocks.indexedDB.onerror;
}

html5rocks.indexedDB.addTodo = function(todoText) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
  var store = trans.objectStore("todo");

  var data = {
    "text": todoText,
    "timeStamp": new Date().getTime()
  };

  var request = store.put(data);

  request.onsuccess = function(e) {
    html5rocks.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log("Error Adding: ", e);
  };
};

html5rocks.indexedDB.deleteTodo = function(id) {
  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
  var store = trans.objectStore("todo");

  var request = store.delete(id);

  request.onsuccess = function(e) {
    html5rocks.indexedDB.getAllTodoItems();
  };

  request.onerror = function(e) {
    console.log("Error Adding: ", e);
  };
};

html5rocks.indexedDB.getAllTodoItems = function() {
  var todos = document.getElementById("todoItems");
  todos.innerHTML = "";

  var db = html5rocks.indexedDB.db;
  var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
  var store = trans.objectStore("todo");

  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(!!result == false)
      return;

    renderTodo(result.value);
    result.continue();
  };

  cursorRequest.onerror = html5rocks.indexedDB.onerror;
};

 function deletedb() {
  alert('deleteddb dentro');
  try {
    alert('intentando...');
    var db = html5rocks.indexedDB.db;
    var trans = db.transaction(["todo"], IDBTransaction.READ_WRITE);
    var store = trans.objectStore("todo");
    if (store) {
      var clearReq = store.clear();
      clearReq.onsuccess = function (ev) {
        console.log("clear successed.");
      }
      clearReq.onerror = function (ev) {
        console.log("clear error." + ev.message);
      }
  }
  }
  catch (e) {
    console.log(e.message);
  }
};

function renderTodo(row) {
  var todos = document.getElementById("todoItems");
  var li = document.createElement("li");
  var a = document.createElement("a");
  var t = document.createTextNode(row.text);

  a.addEventListener("click", function() {
    html5rocks.indexedDB.deleteTodo(row.timeStamp);
  }, false);

  a.textContent = " [Delete]";
  li.appendChild(t);
  li.appendChild(a);
  todos.appendChild(li)
}

function addTodo() {
  var todo = document.getElementById("todo");
  html5rocks.indexedDB.addTodo(todo.value);
  todo.value = "";
}

function init() {
  html5rocks.indexedDB.open();
}

 window.addEventListener("offline", function(e) {
    alert('offline');
      html5rocks.indexedDB.open();
  }, true);

  window.addEventListener("online", function(e) {
    alert('online');
    deletedb();
  }, true);