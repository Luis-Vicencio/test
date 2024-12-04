document.addEventListener("DOMContentLoaded", function () {
  const categorySelect = document.getElementById("category-select");
  const categoryBudgetInput = document.getElementById("category-budget");
  const warningsDiv = document.getElementById("warnings");
  const chartCanvas = document.getElementById("expense-chart").getContext("2d");
  const viewReportBtn = document.getElementById("view-report-btn");
  let chart;
  let categoriesWithBudgets = {}; // To store budgets separately

  function fetchCategories() {
    // Fetch categories as names only
    fetch("/get-categories")
      .then(res => res.json())
      .then(categories => {
        categorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
        categories.forEach(categoryName => {
          const option = document.createElement("option");
          option.value = categoryName;
          option.textContent = categoryName;
          categorySelect.appendChild(option);
        });
        fetchCategoryBudgets(); // Fetch budgets for all categories
      })
      .catch(() => {
        alert("Failed to load categories. Please try again.");
      });
  }

  function fetchCategoryBudgets() {
    // Fetch budgets for all categories separately
    fetch("/get-categories-with-budgets")
      .then(res => res.json())
      .then(data => {
        categoriesWithBudgets = {}; // Reset budget mapping
        data.forEach(category => {
          categoriesWithBudgets[category.name] = category.budget;
        });

        // Update category display with budgets
        Array.from(categorySelect.options).forEach(option => {
          if (categoriesWithBudgets[option.value]) {
            option.textContent = `${option.value} ($${categoriesWithBudgets[option.value].toFixed(2)})`;
          }
        });
      })
      .catch(() => {
        alert("Failed to load category budgets. Please try again.");
      });
  }

  document.getElementById("budget-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const category = categorySelect.value;
    const budget = parseFloat(categoryBudgetInput.value);

    if (!category || budget <= 0 || isNaN(budget)) {
      alert("Please enter a valid budget.");
      return;
    }

    fetch("/add-category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: category, budget }),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        alert("Category budget updated successfully!");
        fetchCategories(); // Refresh categories and budgets
      })
      .catch(() => {
        alert("Failed to update category budget. Please try again.");
      });
  });

  function updateChart() {
    fetch("/get-expense-data")
      .then(res => res.json())
      .then(data => {
        const labels = data.categories.map(item => item.name);
        const amounts = labels.map(label => {
          const matchingExpense = data.expenses.find(e => e.category === label);
          return matchingExpense ? matchingExpense.totalSpent : 0;
        });

        const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];

        if (chart) chart.destroy();
        chart = new Chart(chartCanvas, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                data: amounts,
                backgroundColor: colors.slice(0, labels.length),
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: true,
                position: "bottom",
              },
            },
            responsive: false,
          },
        });

        warningsDiv.innerHTML = "";
        data.categories.forEach(category => {
          const matchingExpense = data.expenses.find(e => e.category === category.name);
          const totalSpent = matchingExpense ? matchingExpense.totalSpent : 0;

          if (totalSpent > categoriesWithBudgets[category.name]) {
            const warning = document.createElement("p");
            warning.textContent = `Overspent in ${category.name} - Spent: $${totalSpent}, Budget: $${categoriesWithBudgets[category.name]}`;
            warning.style.color = "red";
            warningsDiv.appendChild(warning);
          }
        });
      })
      .catch(() => {
        alert("Error updating chart. Please try again.");
      });
  }

  viewReportBtn.addEventListener("click", function () {
    document.getElementById("report-section").style.display = "block";
    updateChart();
  });

  fetchCategories(); // Initial category fetch
});
