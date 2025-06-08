const express = require('express');
const {createExpense, saveBulkExpense,searchExpensesByCategory, searchExpensesByDate, updateExpenseById, deleteExpense} = require('./expense.service');
const router = express.Router();
const {checkToken} = require('../../auth/token_validation');

router.post('/', checkToken, createExpense);
router.post('/search-by-category', checkToken, searchExpensesByCategory);
router.post('/search-by-date', checkToken, searchExpensesByDate);
router.post('/bulk', checkToken, saveBulkExpense);
router.post('/update', checkToken, updateExpenseById);
router.post('/delete', checkToken, deleteExpense);

module.exports = router;