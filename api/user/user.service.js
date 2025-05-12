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

// Private function to generate tokens
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

const saveLogInDetails = (loginDetails) => {
    console.log("retrieve login details by username:", loginDetails.userName);

     getUserLogInDetailsByUserName(loginDetails.userName, (err, results) => {
        if (err) {
            console.error("Error fetching existing login details:", err);

            throw new Error("Error fetching existing login details", err);
        }

        if (results && results.rows.length > 0) {
            console.log("deleting existing record");

            deleteUserLogInDetails(loginDetails.userName, (err, results) => {
                if (err) {
                    console.error("Error deleting existing login details:", err);

                    throw new Error("Error deleting existing login details", err);
                }
            });
        }
    }
    );

    saveUserLogInDetails(loginDetails, (err, results) => {
        if (err) {
            console.error("Error saving login details:", err);

            throw new Error("Error saving login details", err);
        }

        console.log("Refresh token saved successfully for user:", loginDetails.userName);
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

        console.log("process.env.NODE_ENV = ", process.env.NODE_ENV);
    
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

           const loginDetails = buildLoginDetails(user.user_name, tokens.refreshToken, req);
        
           try {
               saveLogInDetails(loginDetails);
           } catch (error) {
                console.error("Error saving login details:", error);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error"
                });
            }

            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
                secure: process.env.NODE_ENV === "production", // Use HTTPS in production
                sameSite: "None", // Prevent CSRF attacks
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
            });

            return res.json({
                success: true,
                message: "Login successfully",
                authToken: tokens.accessToken
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

    regenerateToken: async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
    
        if (!refreshToken) {
            return res.status(403).json({ message: 'Refresh token missing' });
        }
    
        try {
            const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const userName = decoded.user.user_name;
    
            const results = await new Promise((resolve, reject) => {
                getUserLogInDetailsByUserName(userName, (err, results) => {
                    if (err) return reject(err);
                    return resolve(results);
                });
            });
    
            if (!results || results.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            const refreshTokenFromDB = results.rows[0].r_token;
    
            if (!refreshTokenFromDB || refreshTokenFromDB !== refreshToken) {
                return res.status(403).json({ message: 'Refresh token mismatch' });
            }
    
            const tokens = generateToken(decoded.user);
            await updateRefreshToken(userName, tokens.refreshToken);
    
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "None",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
    
            return res.json({
                success: 1,
                message: "Token regenerated successfully",
                authToken: tokens.accessToken,
            });
    
        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }
    },
    

    logout: (req, res) => {
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

        // Clear the refresh token from the cookie
        // Assuming you have a way to invalidate the refresh token on the server side
        const token = req.cookies.refreshToken;
        if (token) refreshTokens.delete(token);
      
        res.clearCookie('refreshToken');
        res.sendStatus(204);
    },
};
