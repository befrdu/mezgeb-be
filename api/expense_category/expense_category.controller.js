const express = require('express');
const {
createExpenseCategory,
getAllExpenseCategories
} = require('./expense_category.service');
const router = express.Router();
const { checkToken } = require('../../auth/token_validation');

/* Protected api */
router.post('/', checkToken, createExpenseCategory);
router.get('/', checkToken, getAllExpenseCategories);    

module.exports = router;