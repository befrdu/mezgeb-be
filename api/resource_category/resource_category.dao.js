const pool = require('../../config/database');

function createResourceCategory(data, callBack) {
    pool.query(
        `INSERT INTO resource_category (category, created_date, created_by, description)
                 values($1, $2, $3, $4)`,
        [
            data.category,
            data.createdDate,
            data.createdBy,
            data.description
        ],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
}

function getResourceCategories(callBack) {
    pool.query(
        `SELECT * FROM resource_category`,
        [],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.rows);
        }
    );
}

function getResourceCategoryById(id, callBack) {
    pool.query(
        `SELECT * FROM resource_category WHERE id = $1`,
        [id],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.rows[0]);
        }
    );
}

function updateResourceCategory(data, callBack) {
    pool.query(
        `UPDATE resource_category SET category = $1, description = $2, updated_date = $3, updated_by = $4 WHERE id = $5`,
        [
            data.category,
            data.description,
            data.updatedDate,
            data.updatedBy,
            data.id
        ],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
}

function deleteResourceCategory(id, callBack) {
    pool.query(
        `DELETE FROM resource_category WHERE id = $1`,
        [id],
        (error, results, fields) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        }
    );
}

module.exports = {
    createResourceCategory,
    getResourceCategories,
    getResourceCategoryById,
    updateResourceCategory,
    deleteResourceCategory
};

