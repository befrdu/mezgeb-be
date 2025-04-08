const pool = require('../../config/database');

module.exports = {
    createResource: (data, callBack) => {
        pool.query(
            `INSERT into public.resource (category, acquired_by, status, quantity,unit, description, created_by, acquired_date, created_date)
                    values($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                data.category,
                data.acquiredBy,
                data.status,
                data.quantity,
                data.unit,
                data.description,
                data.createdBy,
                data.acquiredDate,
                data.createdDate
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getById: (id, callBack) => {
        pool.query(
            `SELECT * FROM public.resource WHERE id = $1`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows[0]);
            }
        );
    },
    getAll: (callBack) => {
        pool.query(
            `SELECT * FROM public.resource`,
            [],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    },
    update: (data, callBack) => {
        pool.query(
            `UPDATE public.resource SET category = $1, acquired_by = $2, status = $3, description = $4, created_by = $5, acquired_date = $6, created_date = $7 WHERE id = $8`,
            [
                data.category,
                data.acquiredBy,
                data.status,
                data.description,
                data.createdBy,
                data.acquiredDate,
                data.createdDate,
                data.id
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    delete: (id, callBack) => {
        pool.query(
            `DELETE FROM public.resource WHERE id = $1`,
            [id],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    getByCategory: (category, callBack) => {
        pool.query(
            `SELECT * FROM public.resource WHERE category = $1`,
            [category],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    },
    getByStatus: (status, callBack) => {
        pool.query(
            `SELECT * FROM public.resource WHERE status = $1`,
            [status],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    },
    getByAcquiredBy: (acquiredBy, callBack) => {
        pool.query(
            `SELECT * FROM public.resource WHERE acquired_by = $1`,
            [acquiredBy],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    },
    getByCreatedBy: (createdBy, callBack) => {
        pool.query(
            `SELECT * FROM public.resource WHERE created_by = $1`,
            [createdBy],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    },
    searchResourcesByCategory: (query, callBack) => {
        let sqlQuery = `SELECT category, SUM(quantity), unit FROM resource 
            WHERE resource.created_by = $1 
            AND acquired_date BETWEEN TO_DATE($2, 'YYYY-MM-DD') AND TO_DATE($3, 'YYYY-MM-DD')`;

        let params = [query.userName, query.fromDate, query.toDate];

        if (query.categories && query.categories.length > 0) {
            const placeholders = query.categories.map((_, index) => `$${index + 4}`).join(', ');
            sqlQuery += ` AND category IN (${placeholders})`;
            params = params.concat(query.categories);
        }

        sqlQuery += ` GROUP BY category, unit;`;

        console.log('params', params);
        console.log('quer', sqlQuery);

        pool.query(sqlQuery, params, (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.rows);
        });
    },
    searchResourcesByDate: (query, callBack) => {
        let sqlQuery = `select * from resource 
        where resource.created_by = $1 
        and acquired_date between to_date($2, 'YYYY-MM-DD') and to_date($3, 'YYYY-MM-DD')`;

        let params = [query.userName, query.fromDate, query.toDate];

        if (query.categories && query.categories.length > 0) {
            const placeholders = query.categories.map((_, index) => `$${index + 4}`).join(', ');
            sqlQuery += ` AND category IN (${placeholders})`;
            params = params.concat(query.categories);
        }

        sqlQuery += `;`;

        pool.query(sqlQuery, params, (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.rows);
        });
    }
}