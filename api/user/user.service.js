const { create, getUsers, getUserById, deleteUser, updateUser, getUserByUserName, createUserLog, getUserLog, getUserLogByUserName} = require('./user.dao');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const { sign, verify } = require('jsonwebtoken');

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
                console.error("Login DB error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }
    
            if (!results || results.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
    
            const user = results.rows[0];
            const result = compareSync(body.password, user.password);
    
            if (!result) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }
    
            user.password = undefined;
    
            const accessToken = sign({ user }, process.env.JWT_SECRET, { expiresIn: "15m" });
            const refreshToken = sign({ user }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    
            return res.json({
                success: true,
                message: "Login successfully",
                authToken: accessToken,
                refreshToken: refreshToken
            });
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
    },
    regenerateToken: (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: 0,
                message: "Refresh token is required"
            });
        }

        try {
            const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const newToken = sign({ user: decoded.user }, process.env.JWT_SECRET, {
                expiresIn: "15m"
            });

            return res.json({
                success: 1,
                message: "Token regenerated successfully",
                authToken: newToken
            });
        } catch (err) {
            console.log(err);
            return res.status(401).json({
                success: 0,
                message: "Invalid or expired refresh token"
            });
        }
    }
};
