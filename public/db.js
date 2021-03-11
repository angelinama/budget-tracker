let db;

// create a new db for the budget db
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  //create the object store "pending"
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log("Error" + event.target.errorCode);
};

function saveRecord(record) {
  // create a transaction on the pendinging db with rewrite access
  const transaction = db.transaction(["pending"], "readwrite");
  // acesss your pending object store
  const store = transaction.objectStore("pending");
  // add record to your store
  store.add(record);
}

function checkDatabase() {
  // create a transaction on the pending db with rewrite access
  const transaction = db.transaction(["pending"], "readwrite");
  // acesss your pending object store
  const store = transaction.objectStore("pending");
  // get all records from the store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          // access your pending object store
          const pendingStore = transaction.objectStore("pending");
          // clear all items in your store
          pendingStore.clear();
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
