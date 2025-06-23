const {createCashMoney, getCurrentBalance, updateCashMoney} = require('./cash.dao');

module.exports = {
    createCashMoney: (req, res) => {
        const body = req.body;

        createCashMoney(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Cash money created successfully"
            });
        });
    },
    getCurrentBalance: (req, res) => {
        getCurrentBalance((err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                data: result
            });
        });
    },

    updateCashMoney: (req, res) => {
        const body = req.body;

        updateCashMoney(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Cash money updated successfully"
            });
        });
    }

};
