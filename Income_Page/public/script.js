function BudgetApp() {
  this.chart = null;
}

BudgetApp.prototype.saveTransaction = function(type, category, amount, date) {
  var url = "http://localhost:3001/save-" + type;
  var data = {
    amount: amount,
    description: category,
    date: date
  };

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(function(response) {
    return response.text();
  })
  .then(function(text) {
    console.log(text);
  });
};

BudgetApp.prototype.getData = function() {
  return fetch("http://localhost:3001/get-data")
    .then(function(response) {
      return response.json();
    });
};

BudgetApp.prototype.showChart = function(data) {
  var canvas = document.getElementById("income-expense-chart");
  var ctx = canvas.getContext("2d");
  var totalIncome = 0;
  var totalExpenses = 0;

  data.income.forEach(function(item) {
    totalIncome += item.amount;
  });

  data.expenses.forEach(function(item) {
    totalExpenses += item.amount;
  });

  if (this.chart) {
    this.chart.destroy();
  }

  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [totalIncome, totalExpenses],
        backgroundColor: ['green', 'red']
      }]
    }
  });
};

var app = new BudgetApp();

var form = document.getElementById("transaction-form");
form.addEventListener("submit", function(e) {
  e.preventDefault();

  var type = document.querySelector('input[name="transaction-type"]:checked').value;
  var category = document.getElementById("transaction-category").value;
  var amountInput = document.querySelector(".textbox");
  var amount = parseFloat(amountInput.value);
  var date = document.getElementById("transaction-date").value;

  app.saveTransaction(type, category, amount, date);

  amountInput.value = "";
});

var reportBtn = document.getElementById("report-btn");
reportBtn.addEventListener("click", function() {
  app.getData().then(function(data) {
    app.showChart(data);
    var chartSection = document.getElementById("chart-section");
    chartSection.style.display = "block";
  });
});

var categories = ["Uncategorized"];
var categorySelect = document.getElementById("transaction-category");

function loadCategories() {
  fetch("http://localhost:3001/get-categories")
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      categories = ["Uncategorized"].concat(data);
      updateCategorySelect();
    });
}

function updateCategorySelect() {
  categorySelect.innerHTML = "";
  categories.forEach(function(cat) {
    var option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
  categorySelect.value = "Uncategorized";
}

loadCategories();

var addCategoryBtn = document.getElementById("add-category-btn");
addCategoryBtn.addEventListener("click", function() {
  var newCategoryInput = document.getElementById("new-category");
  var newCategory = newCategoryInput.value.trim();

  if (newCategory !== "" && categories.indexOf(newCategory) === -1) {
    fetch("http://localhost:3001/add-category", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: newCategory })
    })
    .then(function(response) {
      return response.text();
    })
    .then(function(text) {
      console.log(text);
      loadCategories();
      newCategoryInput.value = "";
    });
  }
});
