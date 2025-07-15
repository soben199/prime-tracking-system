let records = [];

// 🔐 Firebase setup — replace with your config
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function checkLogin() {
  if (localStorage.getItem("loggedIn") === "true") {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    fetchEntries();
  } else {
    document.getElementById("loginForm").style.display = "block";
    document.getElementById("mainApp").style.display = "none";
  }
}

function login() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  if (user === "admin" && pass === "1234") {
    localStorage.setItem("loggedIn", "true");
    checkLogin();
  } else {
    alert("Invalid login!");
  }
}

function logout() {
  localStorage.removeItem("loggedIn");
  location.reload();
}

function addEntry() {
  const record = {
    bookingDate: document.getElementById("bookingDate").value,
    awb: document.getElementById("awb").value,
    branch: document.getElementById("branch").value,
    receiver: document.getElementById("receiver").value,
    dispatchedDate: document.getElementById("dispatchedDate").value,
    update: document.getElementById("update").value,
    remarks: document.getElementById("remarks").value,
    status: document.getElementById("status").value
  };
  db.collection("tracking").add(record).then(() => {
    alert("Saved ✅");
    fetchEntries();
  });
}

function fetchEntries() {
  db.collection("tracking").get().then(snapshot => {
    records = [];
    snapshot.forEach(doc => {
      records.push({...doc.data(), id: doc.id});
    });
    renderTable();
  });
}

function renderTable() {
  const tbody = document.getElementById("dataTable");
  tbody.innerHTML = "";
  records.forEach((r, i) => {
    const row = `
      <tr>
        <td>${r.bookingDate}</td>
        <td>${r.awb}</td>
        <td>${r.branch}</td>
        <td>${r.receiver}</td>
        <td>${r.dispatchedDate}</td>
        <td>${r.update}</td>
        <td>${r.remarks}</td>
        <td>${r.status}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editEntry(${i})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="deleteEntry(${i})">🗑️</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function editEntry(index) {
  const r = records[index];
  document.getElementById("bookingDate").value = r.bookingDate;
  document.getElementById("awb").value = r.awb;
  document.getElementById("branch").value = r.branch;
  document.getElementById("receiver").value = r.receiver;
  document.getElementById("dispatchedDate").value = r.dispatchedDate;
  document.getElementById("update").value = r.update;
  document.getElementById("remarks").value = r.remarks;
  document.getElementById("status").value = r.status;
}

function clearTable() {
  if (confirm("Clear all records?")) {
    records = [];
    renderTable();
  }
}

function chooseExport() {
  const choice = confirm("Do you want to export as Excel?\nPress Cancel for PDF.");
  if (choice) {
    exportToExcel();
  } else {
    exportToPDF();
  }
}

function exportToExcel() {
  const data = records.map(r => ({
    "Booking Date": r.bookingDate,
    "AWB Number": r.awb,
    "Branch": r.branch,
    "Receiver Name": r.receiver,
    "Dispatched Date": r.dispatchedDate,
    "Today's Update": r.update,
    "Remarks": r.remarks,
    "Status": r.status
  }));
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tracking Records");
  XLSX.writeFile(workbook, "Prime_Tracking_Records.xlsx");
}

async function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Prime Tracking Records", 15, 15);

  const headers = ["Booking", "AWB", "Branch", "Receiver", "Dispatch", "Update", "Remarks", "Status"];
  const data = records.map(r => [
    r.bookingDate, r.awb, r.branch, r.receiver,
    r.dispatchedDate, r.update, r.remarks, r.status
  ]);

  let startY = 25;
  let rowHeight = 8;

  doc.setFontSize(10);
  headers.forEach((h, i) => {
    doc.text(h, 10 + i * 25, startY);
  });

  data.forEach((row, rIndex) => {
    row.forEach((cell, cIndex) => {
      doc.text(String(cell), 10 + cIndex * 25, startY + rowHeight * (rIndex + 1));
    });
  });

  doc.save("Prime_Tracking_Records.pdf");
}
