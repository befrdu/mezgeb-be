const express = require('express');
const {
createResourceCategory,
getAllResourceCategories
} = require('./resource_category.service');
const router = express.Router();
const { checkToken } = require('../../auth/token_validation');

/* Protected api */
router.post('/', checkToken, createResourceCategory);
router.get('/', checkToken, getAllResourceCategories);    

module.exports = router;