import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, LinearProgress, Button } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [summary, setSummary] = useState({ total: 0 });
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentMonth = new Date().getMonth() + 1; // 1-indexed
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [summaryRes, categoriesRes, budgetsRes] = await Promise.all([
                    fetch(`/api/dashboard/summary?month=${currentMonth}&year=${currentYear}`).then(res => res.json()),
                    fetch(`/api/dashboard/categories?month=${currentMonth}&year=${currentYear}`).then(res => res.json()),
                    fetch(`/api/dashboard/budgets?month=${currentMonth}&year=${currentYear}`).then(res => res.json())
                ]);
                setSummary(summaryRes);
                setCategories(categoriesRes);
                setBudgets(budgetsRes);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentMonth, currentYear]);

    const pieChartData = {
        labels: categories.map(item => item.category),
        datasets: [
            {
                data: categories.map(item => item.amount),
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#E7E9ED', '#77DD77', '#836FFF', '#FFD700'
                ],
                hoverBackgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                    '#FF9F40', '#E7E9ED', '#77DD77', '#836FFF', '#FFD700'
                ]
            }
        ]
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4 }}>
                Spending Overview
            </Typography>
            {loading ? (
                <Box sx={{ width: '100%' }}><LinearProgress /></Box>
            ) : (
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="h6">Total Spending (This Month)</Typography>
                            <Typography variant="h3">${summary.total.toFixed(2)}</Typography>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Spending Distribution by Category</Typography>
                            <Box sx={{ height: '300px', position: 'relative' }}>
                                <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Budget Progress</Typography>
                            {budgets.length > 0 ? (
                                budgets.map(budget => (
                                    <Box key={budget.category} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1">{budget.category}</Typography>
                                        <LinearProgress variant="determinate" value={(budget.spent / budget.budget) * 100} sx={{ height: 10, borderRadius: '5px' }} />
                                        <Typography variant="caption">{budget.spent.toFixed(2)} / {budget.budget.toFixed(2)}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography>No budget data available for this month.</Typography>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ textAlign: 'center', mb: 4 }}>
                        <Button variant="contained" color="primary" href="/transactions">
                            View All Transactions
                        </Button>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default Dashboard;
