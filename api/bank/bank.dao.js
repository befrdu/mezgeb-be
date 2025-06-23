const pool = require('../../config/database');

module.exports = {  
    updateBalance: (data, callBack) => {
        const currentDate = new Date();

        // Step 1: Update the balance in the bank_account table
        let updateBalanceQuery = `
            UPDATE bank_account 
            SET balance = balance 
        `;

        if (data.transactionType === 'DEBIT') {
            updateBalanceQuery += ` - $1::NUMERIC`; // Explicitly cast $1 to NUMERIC
        } else if (data.transactionType === 'CREDIT' && data.amount > 0) {
            updateBalanceQuery += ` + $1::NUMERIC`; // Explicitly cast $1 to NUMERIC
        }

        updateBalanceQuery += `, updated_on = $2 WHERE account_id = $3`;

        pool.query(
            updateBalanceQuery,
            [data.amount, currentDate, data.accountNumber],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }

                // Step 2: Insert a new record into the bank_account_trxn table
                const transactionId = 'TRXN' + Math.floor(Date.now() / 1000); // Generate a unique transaction ID
                const insertTransactionQuery = `
                    INSERT INTO bank_account_trxn(
                        trxn_id, 
                        bank_account_id, 
                        transaction_type, 
                        transaction_amt, 
                        transaction_date, 
                        description, 
                        created_by
                    ) 
                    VALUES($1, $2, $3, $4, $5, $6, $7)
                `;

                pool.query(
                    insertTransactionQuery,
                    [
                        transactionId,
                        data.accountNumber,
                        data.transactionType || 'CREDIT', // Default to 'CREDIT' if not provided
                        data.amount,
                        currentDate,
                        data.description || 'Balance updated',
                        data.createdBy || 'system'
                    ],
                    (transactionError, transactionResults) => {
                        if (transactionError) {
                            return callBack(transactionError);
                        }
                        return callBack(null, { updateResults: results, transactionResults });
                    }
                );
            }
        );
    },

    getBankAccount: (callBack) => {
        pool.query(
            `SELECT account_id as "accountNumber", balance, description FROM bank_account;`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    },

    getBankTransactions: (callBack) => {
        pool.query(
            `SELECT * FROM bank_transaction ORDER BY transaction_date DESC`,
            [],
            (error, results) => {
                if (error) {
                    return callBack(error);
                }
                return callBack(null, results.rows);
            }
        );
    }
};