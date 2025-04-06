const pool = require('../../config/database');

module.exports = {  
    createExpense: (data, callBack) => {
        const createdDate = new Date();

        data.createdDate = createdDate;

        pool.query(
            `INSERT INTO payment (category, payment_method, amount, payed_to, payment_date, created_date, created_by, description, other_details, receipt_file_url, receipt_file_name, receipt_file_size, receipt_file_type,receipt_file_key )
                     values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
                data.category,
                data.paymentMethod,
                data.amount,
                data.payedTo,
                data.date,
                data.createdDate,
                data.createdBy,
                data.description,
                data.otherDetails,
                data.receiptUrl || null, // Store file data if available
                data.receiptFileName || null,  // Store file type if available
                data.receiptFileSize || null,  // Store file type if available,
                data.receiptFileType || null,  // Store file type if available
                data.receiptFileUniqueKey || null  // Store file type if available
            ],
            (error, results, fields) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    },
    searchExpensesByCategory: (query, callBack) => {
        console.log(query);

        let placeholders = query.category.map((_, index) => `$${index + 1}`).join(', ');

        let sqlQuery = `SELECT category, SUM(amount) FROM payment 
                        WHERE category IN (${placeholders}) 
                        AND created_by = $${query.category.length + 1} 
                        AND payment_date BETWEEN to_date($${query.category.length + 2}, 'YYYY-MM-DD') 
                        AND to_date($${query.category.length + 3}, 'YYYY-MM-DD') 
                        GROUP BY category;`;

        console.log('query', sqlQuery) ;              

        let params = [...query.category, query.userName, query.fromDate, query.toDate];

        console.log('params', params);

        pool.query(sqlQuery, params, (error, results) => {
            if (error) {
                return callBack(error);
            }
            console.log('result', results);
            
            return callBack(null, results.rows);
        });
    },
    searchExpensesByDate: (query, callBack) => {
        let sqlQuery = `SELECT * FROM payment 
                        WHERE payment_date BETWEEN to_date($1, 'YYYY-MM-DD') AND to_date($2, 'YYYY-MM-DD')
                        and created_by =$3`;

        let params = [query.fromDate, query.toDate, query.userName];

        pool.query(sqlQuery, params, (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.rows);
        });
    }
}