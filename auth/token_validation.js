const {verify} = require('jsonwebtoken');

module.exports = {
    checkToken: (req, res, next) => {
        let token = req.get("authorization");

        if (token) {
            // Remove Bearer from string
            token = token.slice(7);

            verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({
                        success: 0,
                        message: "Unauthorized User!"
                    });
                } else {
                    next();
                }
            });
        } else {
            return res.status(401).json({
                success: 0,
                message: "Access Denied! Unauthorized User"
            });
        }
    }
}