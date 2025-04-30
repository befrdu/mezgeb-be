const express = require('express');
const { createUser,getUsers, getUserById, login, createUserLog, regenerateToken} = require('./user.service');
const router = express.Router();
const {checkToken} = require('../../auth/token_validation');

/* Public api */
router.post('/login', login);
router.post('/regenerate-token', regenerateToken);
/*----------------------------------------------------*/


/* Protected api */
router.post('/', checkToken, createUser);
router.get('/', checkToken, getUsers);
router.get('/:id',checkToken, getUserById);
router.post('/create-user-log', checkToken, createUserLog);
/*----------------------------------------------------*/


module.exports = router;