// Import dependencies
const { 
    create, 
    getUsers, 
    getUserById, 
    deleteUser, 
    updateUser, 
    getUserByUserName,
    createUserLog, 
    saveUserLogInDetails,
    getUserLogInDetailsByUserName,
    deleteUserLogInDetails,
    updateUserLogInDetails
} = require('./user.dao');
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const { sign, verify } = require('jsonwebtoken');

// Utility functions
const generateToken = (user) => {
    user.password = undefined;

    const accessToken = sign({ user }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = sign({ user }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    console.log("Access Token and Refresh Token generated:");

    return {
        accessToken,
        refreshToken
    };
};

const updateRefreshToken = (userName, refreshToken) => {
    const payload = {
        userName: userName,
        refreshToken: refreshToken
    };

    updateUserLogInDetails(payload, (err, results) => {
        if (err) {
            console.error("Error updating refresh token:", err);

            throw new Error("Error updating refresh token", err);
        }

        console.log("Refresh token updated successfully for user:", userName);
    });
};

const saveLogInDetails = async (loginDetails) => {
    try {
        const results = await new Promise((resolve, reject) => {
            getUserLogInDetailsByUserName(loginDetails.userName, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (results && results.rows.length > 0) {
            console.log("deleting existing record");

            await new Promise((resolve, reject) => {
                deleteUserLogInDetails(loginDetails.userName, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        await new Promise((resolve, reject) => {
            saveUserLogInDetails(loginDetails, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        console.log("Refresh token saved successfully for user:");
    } catch (err) {
        console.error("Error in saveLogInDetails:", err);
        throw new Error("Error saving login details", err);
    }
};

const setTokenAndReturn = (res, refreshToken, accessToken) => {
    console.log("Setting refresh token in cookie");
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        sameSite: "None", // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.json({
        success: true,
        message: "Login successfully",
        authToken: accessToken
    });
};

const buildLoginDetails = (userName, refreshToken, req) => {
    return {
        userName: userName,
        refreshToken: refreshToken,
        otherDetails: {
            activity: "Login",
            activityDate: new Date(),
            ipAddress: req.ip
        }
    };
};

const getRefreshTokenFromDB = (userName) => {
    return new Promise((resolve, reject) => {
        getUserLogInDetailsByUserName(userName, (err, results) => {
            if (err) {
                console.error("Error fetching refresh token from DB:", err);
                return reject(err);
            }

            if (!results || results.rows.length === 0) {
                return resolve(null);
            }

            const refreshToken = results.rows[0].r_roken;
            return resolve(refreshToken);
        });
    });
}

const saveUserLog = (userLog) => {
    createUserLog(userLog, (err, results) => {
        if (err) {
            console.error("Error creating user log:", err);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
        console.log("User log created successfully");
    });
}
// User CRUD operations
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

    // Authentication and token management
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

           const tokens = generateToken(user);

           const userLog = {
            userName: user.user_name,
            activity: "LOGIN",
            activityDate: new Date(),
            activityDetails: "{}",
          };

        saveUserLog(userLog);
          
        return setTokenAndReturn(res, tokens.refreshToken, tokens.accessToken);
            
        });
    },
    regenerateToken: async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(403).json({ message: 'Refresh token missing' });
        }

        try {
            const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const userName = decoded.user.user_name;

            console.log("User name from decoded token:", userName);

            const refreshTokenFromDB = await getRefreshTokenFromDB(userName);

            // if (!refreshTokenFromDB || refreshTokenFromDB !== refreshToken) {
            //     return res.status(403).json({ message: 'Refresh token mismatch' });
            // }

            const tokens = generateToken(decoded.user);

            console.log("tokens", tokens);

            return setTokenAndReturn(res, tokens.refreshToken, tokens.accessToken);

        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
    },
    logout: (req, res) => {
        console.log("Logout request received");

        const data = req.body;

        const userLog = {
            userName: user.user_name,
            activity: "LOGOUT",
            activityDate: new Date(),
            activityDetails: "{}",
          };    

        saveUserLog(userLog);
  
        // Clear the refresh token from the cookie
        // Assuming you have a way to invalidate the refresh token on the server side
        const token = req.cookies.refreshToken;
        if (token) refreshTokens.delete(token);
      
        res.clearCookie('refreshToken');
        res.sendStatus(204);

        console.log("User logged out successfully");
    },

    // User activity logging
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
};
