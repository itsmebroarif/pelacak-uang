document.addEventListener("DOMContentLoaded", function () {
  // Initial Values
  let incomeTotal = 0;
  let expenseTotal = 0;

  // DOM Elements
  const currentBalanceEl = document.getElementById("current-balance");
  const incomeForm = document.getElementById("income-form");
  const expenseForm = document.getElementById("expense-form");
  const incomeTable = $("#income-table").DataTable();
  const expenseTable = $("#expense-table").DataTable();
  const themeSwitcher = document.getElementById("themeSwitcher");
  const incomeExpenseChart = document
    .getElementById("incomeExpenseChart")
    .getContext("2d");

  // Initialize Chart.js
  const chart = new Chart(incomeExpenseChart, {
    type: "bar",
    data: {
      labels: ["Pemasukan", "Pengeluaran"],
      datasets: [
        {
          label: "Jumlah",
          data: [incomeTotal, expenseTotal],
          backgroundColor: ["#28a745", "#dc3545"],
          borderColor: ["#218838", "#c82333"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  // Function to Format Amount to Rupiah
  function formatRupiah(amount) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  }

  // Update Current Balance Display
  function updateBalance() {
    const balance = incomeTotal - expenseTotal;
    currentBalanceEl.textContent = formatRupiah(balance);
  }

  // Handle Income Form Submission
  incomeForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const description = document.getElementById("income-description").value;
    const amount = parseFloat(document.getElementById("income-amount").value);
    const date = document.getElementById("income-date").value;

    if (description === "" || isNaN(amount) || amount <= 0 || !date) {
      Swal.fire(
        "Error",
        "Silakan masukkan deskripsi, jumlah, dan tanggal yang valid.",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Tambah Pemasukan",
      text: `Apakah Anda yakin ingin menambahkan ${formatRupiah(
        amount
      )} ke pemasukan?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        incomeTotal += amount;
        updateBalance();
        updateChart();
        const listItem = `
                    <tr>
                        <td>${description}</td>
                        <td>${formatRupiah(amount)}</td>
                        <td>${date}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-income" data-description="${description}" data-amount="${amount}" data-date="${date}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-income">Hapus</button>
                        </td>
                    </tr>
                `;
        incomeTable.row.add($(listItem)).draw();
        incomeForm.reset();
        Swal.fire("Sukses", "Pemasukan berhasil ditambahkan!", "success");
      }
    });
  });

  // Handle Expense Form Submission
  expenseForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const description = document.getElementById("expense-description").value;
    const amount = parseFloat(document.getElementById("expense-amount").value);
    const date = document.getElementById("expense-date").value;

    if (description === "" || isNaN(amount) || amount <= 0 || !date) {
      Swal.fire(
        "Error",
        "Silakan masukkan deskripsi, jumlah, dan tanggal yang valid.",
        "error"
      );
      return;
    }

    if (amount > incomeTotal - expenseTotal) {
      Swal.fire(
        "Error",
        "Anda tidak dapat mengeluarkan lebih dari pemasukan yang tersedia saat ini.",
        "error"
      );
      return;
    }

    Swal.fire({
      title: "Tambah Pengeluaran",
      text: `Apakah Anda yakin ingin mengeluarkan ${formatRupiah(amount)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        expenseTotal += amount;
        updateBalance();
        updateChart();
        const listItem = `
                    <tr>
                        <td>${description}</td>
                        <td>${formatRupiah(amount)}</td>
                        <td>${date}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-expense" data-description="${description}" data-amount="${amount}" data-date="${date}">Edit</button>
                            <button class="btn btn-danger btn-sm delete-expense">Hapus</button>
                        </td>
                    </tr>
                `;
        expenseTable.row.add($(listItem)).draw();
        expenseForm.reset();
        Swal.fire("Sukses", "Pengeluaran berhasil ditambahkan!", "success");
      }
    });
  });

  // Update Chart.js Data
  function updateChart() {
    chart.data.datasets[0].data[0] = incomeTotal;
    chart.data.datasets[0].data[1] = expenseTotal;
    chart.update();
  }

  // Handle Table Actions
  $("#income-table").on("click", ".delete-income", function () {
    const row = $(this).closest("tr");
    const amount = parseFloat(
      row.find("td:eq(1)").text().replace("Rp", "").replace(/\./g, "")
    );
    Swal.fire({
      title: "Hapus Pemasukan",
      text: `Apakah Anda yakin ingin menghapus pemasukan sebesar ${formatRupiah(
        amount
      )}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        incomeTotal -= amount;
        updateBalance();
        updateChart();
        row.remove();
        Swal.fire("Dihapus", "Pemasukan telah dihapus.", "success");
      }
    });
  });

  $("#expense-table").on("click", ".delete-expense", function () {
    const row = $(this).closest("tr");
    const amount = parseFloat(
      row.find("td:eq(1)").text().replace("Rp", "").replace(/\./g, "")
    );
    Swal.fire({
      title: "Hapus Pengeluaran",
      text: `Apakah Anda yakin ingin menghapus pengeluaran sebesar ${formatRupiah(
        amount
      )}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        expenseTotal -= amount;
        updateBalance();
        updateChart();
        row.remove();
        Swal.fire("Dihapus", "Pengeluaran telah dihapus.", "success");
      }
    });
  });

  $("#income-table").on("click", ".edit-income", function () {
    const description = $(this).data("description");
    const amount = $(this).data("amount");
    const date = $(this).data("date");
    Swal.fire({
      title: "Edit Pemasukan",
      html: `
                <input type="text" id="edit-description" class="swal2-input" value="${description}">
                <input type="number" id="edit-amount" class="swal2-input" value="${amount}">
                <input type="date" id="edit-date" class="swal2-input" value="${date}">
            `,
      confirmButtonText: "Simpan",
      showCancelButton: true,
      preConfirm: () => {
        return {
          description: document.getElementById("edit-description").value,
          amount: parseFloat(document.getElementById("edit-amount").value),
          date: document.getElementById("edit-date").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const data = result.value;
        const row = $(this).closest("tr");
        row.find("td:eq(0)").text(data.description);
        row.find("td:eq(1)").text(formatRupiah(data.amount));
        row.find("td:eq(2)").text(data.date);
        Swal.fire("Diperbarui", "Pemasukan telah diperbarui.", "success");
      }
    });
  });

  $("#expense-table").on("click", ".edit-expense", function () {
    const description = $(this).data("description");
    const amount = $(this).data("amount");
    const date = $(this).data("date");
    Swal.fire({
      title: "Edit Pengeluaran",
      html: `
                <input type="text" id="edit-description" class="swal2-input" value="${description}">
                <input type="number" id="edit-amount" class="swal2-input" value="${amount}">
                <input type="date" id="edit-date" class="swal2-input" value="${date}">
            `,
      confirmButtonText: "Simpan",
      showCancelButton: true,
      preConfirm: () => {
        return {
          description: document.getElementById("edit-description").value,
          amount: parseFloat(document.getElementById("edit-amount").value),
          date: document.getElementById("edit-date").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const data = result.value;
        const row = $(this).closest("tr");
        row.find("td:eq(0)").text(data.description);
        row.find("td:eq(1)").text(formatRupiah(data.amount));
        row.find("td:eq(2)").text(data.date);
        Swal.fire("Diperbarui", "Pengeluaran telah diperbarui.", "success");
      }
    });
  });

  // Handle Theme Switcher
  themeSwitcher.addEventListener("change", function () {
    if (this.checked) {
      document.body.classList.add("dark-mode");
      document
        .querySelectorAll(".card")
        .forEach((card) => card.classList.add("dark-mode"));
    } else {
      document.body.classList.remove("dark-mode");
      document
        .querySelectorAll(".card")
        .forEach((card) => card.classList.remove("dark-mode"));
    }
  });
});
