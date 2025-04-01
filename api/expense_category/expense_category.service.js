const expenseCategoryDao = require('./expense_category.dao');

// Service function to get all expense categories
const getAllExpenseCategories = (req, res) => {
    expenseCategoryDao.getAllExpenseCategories((err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        return res.status(200).json({
            success: 1,
            data: results.rows
        });
    });
}

const getExpenseCategoryById = (req, res) => {
    const id = req.params.id;

    expenseCategoryDao.getExpenseCategoryById(id, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        if (!results) {
            return res.status(404).json({
                success: 0,
                message: "Resource not found"
            });
        }
        return res.status(200).json({
            success: 1,
            data: results
        });
    });
}

  const createExpenseCategory = (req, res) => {
    const request = req.body.category;
    console.log('expense categor', request);
    const currentTime = new Date();

    request.createdDate = currentTime;

    expenseCategoryDao.createExpenseCategory(request, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        return res.status(200).json({
            success: 1,
            message: "Resource created successfully"
        });
    });
}

// Service function to update an expense category by ID
const updateExpenseCategory = (req, res) => {
    const id = req.params.id;
    const body = req.body;

    expenseCategoryDao.updateExpenseCategory(id, body, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        if (!results.affectedRows) {
            return res.status(404).json({
                success: 0,
                message: "Resource not found"
            });
        }
        return res.status(200).json({
            success: 1,
            message: "Resource updated successfully"
        });
    });
}

// Service function to delete an expense category by ID
const deleteExpenseCategory = (req, res) => {
    const id = req.params.id;

    expenseCategoryDao.deleteExpenseCategory(id, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                success: 0,
                message: "Database connection error"
            });
        }
        if (!results.affectedRows) {
            return res.status(404).json({
                success: 0,
                message: "Resource not found"
            });
        }
        return res.status(200).json({
            success: 1,
            message: "Resource deleted successfully"
        });
    });
}

module.exports = {
    getAllExpenseCategories,
    getExpenseCategoryById,
    createExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory
};
