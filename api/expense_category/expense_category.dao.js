const pool = require('../../config/database');

function createExpenseCategory(data, callBack) {
    pool.query(
        `INSERT INTO payment_category (category, created_date, created_by, description)
                 values($1, $2, $3, $4)`,
        [
            data.category,
            data.createdDate,
            data.createdBy,
            data.description
        ],
        (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
}

function getAllExpenseCategories(callBack) {
    const query = `SELECT * FROM payment_category`;
    pool.query(query, (error, results) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, results);
    });
}

function getExpenseCategoryById(id, callBack) {
    const query = `SELECT * FROM payment_category WHERE id = $1`;
    pool.query(query, [id], (error, results) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, results);
    });
}

function updateExpenseCategory(id, data, callBack) {
    const query = `
        UPDATE payment_category
        SET category = $1, updated_date = $2, description = $3
        WHERE id = $4
    `;
    const values = [data.category, data.updated_date, data.description, id];
    pool.query(query, values, (error, results) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, results);
    });
}

function deleteExpenseCategory(id, callBack) {
    const query = `DELETE FROM payment_category WHERE id = $1`;
    pool.query(query, [id], (error, results) => {
        if (error) {
            return callBack(error);
        }
        return callBack(null, results);
    });
}

module.exports = {
    createExpenseCategory,
    getAllExpenseCategories,
    getExpenseCategoryById,
    updateExpenseCategory,
    deleteExpenseCategory,
};

