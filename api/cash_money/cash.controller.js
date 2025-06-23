const express = require('express');

const {createCashMoney, getCurrentBalance, updateCashMoney} = require('./cash.service');

const {checkToken} = require('../../auth/token_validation');  

const router = express.Router();

router.post('/', checkToken, createCashMoney);
router.get('/balance', checkToken, getCurrentBalance);
router.put('/', checkToken, updateCashMoney);


module.exports = router;