const { create, getUsers, getUserById, deleteUser, updateUser, getUserByUserName, createUserLog, getUserLog, getUserLogByUserName} = require('./user.dao');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const {sign} = require('jsonwebtoken')

module.exports = {
    createUser: (req, res) => {
        const body = req.body;

        const salt = genSaltSync(10);
        
        const currentTime = new Date();

        body.password = hashSync(body.password, salt);
        body.createdDate = currentTime;
        body.updatedDate = currentTime;
        body.status = 'Active';

        create(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "User created successfully"
            });
        });

    },
    getUserById: (req, res) => {
        const id = req.params.id;

        getUserById(id, (err, results) => {
            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results || results.rows.length === 0) {
                return res.status(404).json({
                    success: 0,
                    message: "Record not found"
                });
            }
            return res.json({
                success: 1,
                data: results.rows[0]
            });
        });
    },
    getUsers: (req, res) => {
        getUsers((err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            return res.json({
                success: 1,
                result: results.rows
            });
        });
    },
    updateUser: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        const currentTime = new Date();

        body.password = hashSync(body.password, salt);
        body.updatedDate = currentTime;

        updateUser(body, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.status(404).json({
                    success: 0,
                    message: "Record not found"
                });
            }
            return res.json({
                success: 1,
                message: "updated successfully"
            });
        });
    },
    deleteUser: (req, res) => {
        const data = req.body;
        deleteUser(data, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.status(404).json({
                    success: 0,
                    message: "Record not found"
                });
            }
            return res.json({
                success: 1,
                message: "user deleted successfully"
            });
        });
    }, 
    getUserByUserName: (req, res) => {
        const userName = req.body.userName;

        getUserByUserName(userName, (err, results) => {
            if (err) {
                console.log(err);

                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            if (!results || results.rows.length === 0) {
                return res.status(404).json({
                    success: 0,
                    message: "Record not found"
                });
            }
            return res.json({
                success: true,
                data: results.rows[0]
            });
        });
    }, 
    login: (req, res) => {
        const body = req.body;
        getUserByUserName(body.userName, (err, results) => {
            if (err) {
                console.log(err);
            }
            if (!results || results.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const user = results.rows[0];

            const result = compareSync(body.password, user.password);

            if (result) {
                results.rows[0].password = undefined;

                const jsontoken = sign({ user: user }, process.env.JWT_SECRET, {
                    expiresIn: "1h"
                });
                return res.json({
                    success: true,
                    message: "login successfully",
                    authToken: jsontoken
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
        });
    },
    createUserLog: (req, res) => {
        const data = req.body;

        const jsonString = JSON.stringify(data.otherDetails);

        data.otherDetails = jsonString;
        data.activityDate = new Date();

        createUserLog(data, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "User log created successfully",
                response: results
            });
        });
    }
};
