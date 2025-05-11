const express = require('express');
const { createUser,getUsers, getUserById, login, createUserLog, regenerateToken, logout} = require('./user.service');
const router = express.Router();
const {checkToken} = require('../../auth/token_validation');

/* Public api */
router.post('/login', login);
router.post('/regenerate-token', regenerateToken);
router.post('/logout', logout);
/*----------------------------------------------------*/


/* Protected api */
router.post('/', checkToken, createUser);
router.get('/', checkToken, getUsers);
router.get('/:id',checkToken, getUserById);
router.post('/create-user-log', checkToken, createUserLog);
/*----------------------------------------------------*/


module.exports = router;