class BudgetTool {
    constructor(initialSavings = 0) {
        this.savings = initialSavings;
        this.categories = [];
        this.e_amount = [];
        this.chart = null;
    }

    addEntry(category, amount) {
        if (this.categories.length >= 100) return;
        const index = this.categories.indexOf(category);

        if (index !== -1) {
            this.e_amount[index] += amount;
        } else {
            this.categories.push(category);
            this.e_amount.push(amount);
        }
    }

    showBudgetReport() {
        const reportTableBody = document.querySelector('#budget-report-table tbody');
        const totalBudgetDisplay = document.getElementById('total-budget');
        reportTableBody.innerHTML = '';
        
        for (let i = 0; i < this.categories.length; i++) {
            let row = document.createElement('tr');
            row.innerHTML = `<td>${this.categories[i]}</td><td>$${this.e_amount[i].toFixed(2)}</td>`;
            reportTableBody.appendChild(row);
        }

        if (this.savings > 0) {
            const finalSavings = this.calculateSavings();
            totalBudgetDisplay.textContent = `Final Savings: $${finalSavings.toFixed(2)}`;
            totalBudgetDisplay.style.color = finalSavings < 0 ? 'red' : 'green';
        } else {
            totalBudgetDisplay.textContent = '';
        }

        document.getElementById('report-section').style.display = 'block';
        this.updateChart();
    }

    calculateSavings() {
        let total = this.savings;
        for (let i = 0; i < this.e_amount.length; i++) {
            total -= this.e_amount[i];
        }
        return total;
    }

    updateChart() {
        const ctx = document.getElementById('expense-chart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: this.categories,
                datasets: [{
                    data: this.e_amount,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: { enabled: false },
                    legend: { display: false }
                },
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

const predefinedCategories = ['Rent', 'Groceries', 'Utilities', 'Entertainment'];
const transactionCategorySelect = document.getElementById('transaction-category');
const newCategoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const budgetTypeForm = document.getElementById('budget-type-form');
const transactionForm = document.getElementById('transaction-form');
const viewReportBtn = document.getElementById('view-report-btn');

let budget;

function initializeCategories() {
    transactionCategorySelect.innerHTML = '';
    predefinedCategories.unshift("Uncategorized");

    for (let category of predefinedCategories) {
        let option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        transactionCategorySelect.appendChild(option);
    }
    transactionCategorySelect.value = "Uncategorized";
}
initializeCategories();

function renderTransactionList(){
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    for ( let i =0; i < budget.catagories.length; i++) {
        const listItem = document.createElement("li");
        listItem.textContext = `${budget.catagories[i]}: $${budget.e_amount[i].toFixed(2)}`;
        transactionList.appendChild(listItem);
    }
}

addCategoryBtn.addEventListener('click', () => {
    const newCategory = newCategoryInput.value.trim();
    if (newCategory && !predefinedCategories.includes(newCategory)) {
        predefinedCategories.push(newCategory);
        initializeCategories();
        transactionCategorySelect.value = newCategory;
        newCategoryInput.value = '';
    } else {
        alert('Category already exists or is invalid.');
    }
});

budgetTypeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const initialSavings = parseFloat(document.getElementById('initial-savings').value) || 0;
    budget = new BudgetTool(initialSavings);
    document.getElementById('budget-display').textContent = `Savings: $${initialSavings}`;
    renderTransactionList();
});

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!budget) budget = new BudgetTool();

    const category = transactionCategorySelect.value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);

    if (!isNaN(amount) && amount > 0) {
        budget.addEntry(category, amount);
        renderTransactionLlist();
        document.getElementById('transaction-amount').value = '';
    } else {
        alert("Please enter a valid positive amount.");
    }
});

viewReportBtn.addEventListener('click', () => {
    if (!budget) budget = new BudgetTool();
    budget.showBudgetReport();
});

document.getElementById('logout-btn').addEventListener('click', () => {
    document.getElementById('logout-modal').style.display = 'flex';
  });
  
  document.getElementById('cancel-logout').addEventListener('click', () => {
    document.getElementById('logout-modal').style.display = 'none';
  });
  
  document.getElementById('confirm-logout').addEventListener('click', () => {
    // Redirect to logout logic or logout page
    alert('You have logged out successfully.');
    document.getElementById('logout-modal').style.display = 'none';
    window.location.href = "login-page.html";
    // Here you can add any additional logout logic, like redirecting to a login page.
  });

  
