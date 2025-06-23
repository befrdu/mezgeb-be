const pool = require('../../config/database');

module.exports = {  
    createCashMoney: (data, callBack) => {
        const createdDate = new Date();

        // Step 1: Get the total sum of non-zero current_amt
        const sumQuery = `SELECT SUM(current_amt) AS total_sum FROM cash_money WHERE current_amt > 0`;

        pool.query(sumQuery, [], (sumError, sumResults) => {
            if (sumError) {
                return callBack(sumError);
            }

            const totalSum = sumResults.rows[0].total_sum || 0;

            // Step 2: Add the sum to initial_amt and current_amt of the new record
            const currentBalance = data.amount + totalSum;
            const description = 'Remaining balance transerred to: '+ data.id;

            // Step 3: Update non-zero current_amt rows to zero
            const updateQuery = `UPDATE cash_money SET current_amt = $1, description = $2 WHERE current_amt > 0`;

            pool.query(updateQuery, [0, description], (updateError, updateResults) => {
                if (updateError) {
                    return callBack(updateError);
                }

                // Step 4: Insert the new record with the updated amounts
                const insertQuery = `
                    INSERT INTO cash_money(id, created_by, initial_amt, current_amt, created_on, description)
                    VALUES($1, $2, $3, $4, $5, $6)
                `;

                pool.query(
                    insertQuery,
                    [
                        data.id,
                        data.createdBy,
                        data.amount,
                        currentBalance,
                        createdDate,
                        data.description || 'Cash money created'
                    ],
                    (insertError, insertResults) => {
                        if (insertError) {
                            return callBack(insertError);
                        }
                        return callBack(null, insertResults);
                    }
                );
            });
        });
    },

    getCurrentBalance : (callBack) => {
        const query = `SELECT id, current_amt FROM cash_money WHERE current_amt > 0 ORDER BY created_on DESC LIMIT 1`;

        pool.query(query, [], (error, results) => {
            if (error) {
                return callBack(error);
            }
            if (results.rows.length > 0) {
                return callBack(null, results.rows[0]);
            } else {
                return callBack(null, 0); // Return 0 if no records found
            }
        });
    },

    updateCashMoney: (data, callBack) => {
        const updatedDate = new Date();

        const query = `
            UPDATE cash_money
            SET current_amt = current_amt - $1, description = $2, updated_by = $3, updated_on = $4
            WHERE id = $5
        `;

        pool.query(query, [data.amount, data.description, data.updatedBy, updatedDate, data.cashId], (error, results) => {
            if (error) {
                return callBack(error);
            }
            
            cashDao.createCashTransaction(data)
            .then(() => {
                console.log("Cash money updated successfully");
                return callBack(null, results);
            })
            .catch((transactionError) => {
                return callBack(transactionError);
            });
        });
    },

    createCashTransaction: (data) => {  
        const createdDate = new Date();

        const transactionId =  'TR'+Math.floor(Date.now() / 1000);// Generate a unique transaction ID if not provided
        
        const query = `
            INSERT INTO cash_transaction(transaction_id, cash_id, transaction_type, transaction_amt, transaction_date, description, created_by)
            VALUES($1, $2, $3, $4, $5, $6, $7)
        `;

        return new Promise((resolve, reject) => {
            pool.query(
                query,
                [
                    transactionId,
                    data.cashId,
                    data.transactionType || 'CASH',
                    data.amount,
                    createdDate,
                    data.description || 'Cash transaction created',
                    data.createdBy || 'system'
                ],
                (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(results);
                }
            );
        });
    }
};

const cashDao = module.exports;