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
        // Step 1: Retrieve user by userName from the user table
        const userQuery = `SELECT * FROM "user" u WHERE user_name = $1`;
        pool.query(userQuery, [query.userName], (userError, userResults) => {
            if (userError) {
                return callBack(userError);
            }

            const user = userResults.rows[0];

            let userType = user?.user_type?.toLowerCase() || '';
            let status = user?.status?.toLowerCase() || '';

            // Step 2: If user does not exist or is not active, return an empty result
            if (!user || status !== 'active') {
                return callBack(null, []);
            }

            // Step 3: Construct the base query
            let sqlQuery = `SELECT category, SUM(amount) FROM payment 
                            WHERE payment_date BETWEEN to_date($1, 'YYYY-MM-DD') 
                            AND to_date($2, 'YYYY-MM-DD')`;
            let params = [query.fromDate, query.toDate];

            // Step 4: Apply filters based on user type
           if (userType === 'admin'&&query.users && query.users.length > 0) {
                const userListPlaceholder = query.users.map((_, index) => `$${params.length + index + 1}`).join(', ');
                sqlQuery += ` AND created_by IN (${userListPlaceholder})`;
                params = [...params, ...query.users];
            }else { 
                sqlQuery += ` AND created_by = $3`;
                params.push(query.userName);
            }

            // Add category filter if provided
            if (query.categories && query.categories.length > 0) {
                const categoriesPlaceholder = query.categories.map((_, index) => `$${params.length + index + 1}`).join(', ');
                sqlQuery += ` AND category IN (${categoriesPlaceholder})`;
                params = [...params, ...query.categories];
            }

            sqlQuery += ` GROUP BY category;`;

            // Execute the final query
            pool.query(sqlQuery, params, (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            });
        });
    },

    searchExpensesByDate: (query, callBack) => {
       // Step 1: Retrieve user by userName from the user table
       const userQuery = `SELECT * FROM  "user" u WHERE user_name = $1`;
       pool.query(userQuery, [query.userName], (userError, userResults) => {
        if (userError) {
            return callBack(userError);
        }

        const user = userResults.rows[0];

        let userType = user.user_type ? user.user_type.toLowerCase() : '';
        let status = user.status ? user.status.toLowerCase() : '';

        // Step 2: If user does not exist or is not active, return an empty result
        if (!user || !user.status || status !== 'active') {
            return callBack(null, []);
        }

        // Step 3: If user exists and is not admin, filter data by userName
        let sqlQuery = `SELECT * FROM payment 
                        WHERE payment_date BETWEEN to_date($1, 'YYYY-MM-DD') AND to_date($2, 'YYYY-MM-DD')`;
                     
        let params = [query.fromDate, query.toDate];

        if (userType !== 'admin') {
            sqlQuery += ` AND created_by = $3`;
            params.push(query.userName);
        } else {
            // Step 4: If user is admin, filter by userList if provided
            if (userType === 'admin'&& query.users && query.users.length > 0) {
                const userListPlaceholder = query.users.map((_, index) => `$${index + 3}`).join(', ');
                sqlQuery += ` AND created_by IN (${userListPlaceholder})`;
                params = [...params, ...query.users];
            }
        }

        // Add category filter if provided
        if (query.categories && query.categories.length > 0) {
            const categoriesPlaceholder = query.categories.map((_, index) => `$${params.length + index + 1}`).join(', ');
            sqlQuery += ` AND category IN (${categoriesPlaceholder})`;
            params = [...params, ...query.categories];
        }

        // Execute the final query
        pool.query(sqlQuery, params, (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results.rows);
        });
    });
    },

    updateExpenseById: (data, callBack) => {     
        const updatedDate = new Date();

        const updates = [];
        const params = [];

      
            updates.push('category = $' + (params.length + 1));
            params.push(data.category);
      
            updates.push('payment_method = $' + (params.length + 1));
            params.push(data.paymentMethod);

            updates.push('amount = $' + (params.length + 1));
            params.push(data.amount);

            updates.push('payed_to = $' + (params.length + 1));
            params.push(data.payedTo);
     
            updates.push('payment_date = $' + (params.length + 1));
            params.push(data.date);

            updates.push('description = $' + (params.length + 1));
            params.push(data.description);
           
            updates.push('updated_by = $' + (params.length + 1));
            params.push(data.updatedBy);
        
        if (data.receiptUrl != null && data.receiptFileSize != null && data.receiptFileSize >0) {
            updates.push('receipt_file_url = $' + (params.length + 1));
            params.push(data.receiptUrl);

            updates.push('receipt_file_name = $' + (params.length + 1));
            params.push(data.receiptFileName);

            updates.push('receipt_file_size = $' + (params.length + 1));
            params.push(data.receiptFileSize);

            updates.push('receipt_file_type = $' + (params.length + 1));
            params.push(data.receiptFileType);

            updates.push('receipt_file_key = $' + (params.length + 1));
            params.push(data.receiptFileUniqueKey);
        }

        updates.push('updated_on = $' + (params.length + 1));
        params.push(updatedDate);
        params.push(data.id);

        const sqlQuery = `UPDATE payment SET ${updates.join(', ')} WHERE id = $${params.length}`;

        pool.query(sqlQuery, params, (error, results) => {
            if (error) {
                return callBack(error);
            }
            return callBack(null, results);
        });
    },

    deleteExpenseById: (id, callBack) => {
        pool.query(
            `DELETE FROM payment WHERE id = $1`,
            [id],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results);
            }
        );
    }
}