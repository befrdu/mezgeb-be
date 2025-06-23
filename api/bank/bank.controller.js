const express = require('express');

const {updateBalance,getBankTransactions, getBankAccount} = require('./bank.service');

const {checkToken} = require('../../auth/token_validation');  

const router = express.Router();

router.put('/', checkToken, updateBalance);
router.get('/transactions', checkToken, getBankTransactions);
router.get('/account', checkToken, getBankAccount);

module.exports = router;