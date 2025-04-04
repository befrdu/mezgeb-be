const { createExpense, searchExpensesByCategory, searchExpensesByDate } = require('./expense.dao');

module.exports = {
    createExpense: (req, res) => {
        const body = req.body;

        createExpense(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                message: "Expense created successfully"
            });
        });
    },

    saveBulkExpense: (req, res) => {
        const expenses = req.body.expenses;
     
        let successCount = 0;

        expenses.forEach((expense, index) => {
            createExpense(expense, (err, results) => {
                if (err) {
                    console.log(`Error saving expense at index ${index}:`, err);
                    return res.status(500).json({
                        error:err,
                        message:'Process failed!'
                    })
                } else {
                    ++successCount;
                }

                // Send response after processing all expenses
                if (index === expenses.length - 1) {
                    return res.status(200).json({
                        success: 1,
                        successfulySavedRecordCount: `${successCount}`,
                        message: `${successCount} expenses created successfully`
                    });
                }
            });
        });
    },

    searchExpensesByCategory: (req, res) => {
        const query = req.body.request;

        searchExpensesByCategory(query, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },

    searchExpensesByDate: (req, res) => {
        const query = req.body.request;

        searchExpensesByDate(query, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Database connection error"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    }
}