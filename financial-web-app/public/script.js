class BudgetTool {
    constructor(initialSavings) {
        this.savings = initialSavings;
        this.categories = [];
        this.e_amount = [];
        this.Ecount = 0;
        this.maxEntries = 100;
    }

    restEntry() {
        if (this.Ecount >= this.maxEntries) {
            alert(`You have reached the maximum number of entries allowed: ${this.maxEntries}`);
            return false;
        }
        return true;
    }

    addEntry(category, amount) {
        if (!this.restEntry()) return;

        const index = this.categories.indexOf(category);
        if (index !== -1) {
            this.e_amount[index] += amount;
        } else {
            this.categories.push(category);
            this.e_amount.push(amount);
        }
        this.Ecount++;
    }

    calculateSavings() {
        let total = this.savings;
        this.e_amount.forEach(amount => {
            total += amount;
        });
        return total;
    }

    showBudgetReport() {
        const reportTableBody = document.querySelector('#budget-report-table tbody');
        const totalBudgetDisplay = document.getElementById('total-budget');

        reportTableBody.innerHTML = '';
        this.categories.forEach((category, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${category}</td><td>$${this.e_amount[index].toFixed(2)}</td>`;
            reportTableBody.appendChild(row);
        });

        const finalSavings = this.calculateSavings();
        totalBudgetDisplay.textContent = `Final Savings: $${finalSavings.toFixed(2)}`;
        totalBudgetDisplay.style.color = finalSavings < 0 ? 'red' : 'green';
        document.getElementById('report-section').style.display = 'block';

        this.updateChart();
    }

}

class MonthlyBudget extends BudgetTool {}
class YearlyBudget extends BudgetTool {}

let budget;

const predefinedCategories = ['Rent', 'Groceries', 'Utilities', 'Entertainment'];
const transactionCategorySelect = document.getElementById('transaction-category');
const newCategoryInput = document.getElementById('new-category');
const addCategoryBtn = document.getElementById('add-category-btn');
const budgetTypeForm = document.getElementById('budget-type-form');
const transactionForm = document.getElementById('transaction-form');
const viewReportBtn = document.getElementById('view-report-btn');

function initializeCategories() {
    transactionCategorySelect.innerHTML = '<option value="" disabled selected>Select Category</option>';
    predefinedCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        transactionCategorySelect.appendChild(option);
    });
}
initializeCategories();

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
    const initialSavings = parseFloat(document.getElementById('initial-savings').value);
    const budgetType = document.getElementById('budget-type').value;
    budget = budgetType === 'monthly' ? new MonthlyBudget(initialSavings) : new YearlyBudget(initialSavings);
    document.getElementById('budget-display').textContent = `Budget Type: ${budgetType}, Savings: $${initialSavings}`;
});

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const transactionType = document.getElementById('transaction-type').value;
    const category = transactionCategorySelect.value;
    const amountInput = document.getElementById('transaction-amount');
    let amount = parseFloat(amountInput.value);
    amount = transactionType === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    budget.addEntry(category, amount);
    amountInput.value = '';
});

viewReportBtn.addEventListener('click', () => {
    budget.showBudgetReport();
});

document.getElementById("logout-btn").addEventListener("click", function() {
    // Show the confirmation dialog
    document.getElementById("logout-confirmation").style.display = "block";
});

document.getElementById("confirm-logout").addEventListener("click", function() {
    // Clear stored user data (if using localStorage or sessionStorage)
    localStorage.removeItem('user'); // Adjust the key to match what you're using
    sessionStorage.removeItem('user'); // Optional: if you're using sessionStorage

    // Optionally clear cookies if needed
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";

    // Redirect to the homepage or login page
    window.location.href = "login-page.html";  // Adjust the URL to match your homepage or login page
});

document.getElementById("cancel-logout").addEventListener("click", function() {
    // Close the confirmation dialog without logging out
    document.getElementById("logout-confirmation").style.display = "none";
});
