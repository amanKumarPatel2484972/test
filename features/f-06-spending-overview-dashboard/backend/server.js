const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Dummy data - replace with actual PostgreSQL queries
const getMonthlySpendingSummary = async (month, year) => {
    // In a real app, query PostgreSQL for total spending in the given month/year
    return { total: 1500.75 };
};

const getSpendingByCategory = async (month, year) => {
    // In a real app, query PostgreSQL for spending distribution by category
    return [
        { category: 'Groceries', amount: 400.50 },
        { category: 'Utilities', amount: 150.25 },
        { category: 'Entertainment', amount: 300.00 },
        { category: 'Transport', amount: 250.00 },
        { category: 'Other', amount: 400.00 }
    ];
};

const getBudgetProgress = async (month, year) => {
    // In a real app, query PostgreSQL for budget progress
    return [
        { category: 'Groceries', spent: 400.50, budget: 500.00 },
        { category: 'Utilities', spent: 150.25, budget: 200.00 },
        { category: 'Entertainment', spent: 300.00, budget: 250.00 }
    ];
};

app.get('/api/dashboard/summary', async (req, res) => {
    const { month, year } = req.query;
    try {
        const summary = await getMonthlySpendingSummary(month, year);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summary', error: error.message });
    }
});

app.get('/api/dashboard/categories', async (req, res) => {
    const { month, year } = req.query;
    try {
        const categories = await getSpendingByCategory(month, year);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});

app.get('/api/dashboard/budgets', async (req, res) => {
    const { month, year } = req.query;
    try {
        const budgets = await getBudgetProgress(month, year);
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Basic test for server start
console.log('Server setup complete. Ready to start.');
