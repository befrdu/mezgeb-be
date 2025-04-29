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
    },

    saveReceiptFileOnToS3(expense){
        const { uploadFileToS3 } = require('./aws/awsS3Service');
            if (expense.receiptFile) {
                const fileName = `${expense.fileName}`;
                const fileAsFormData = expense.receiptFileToUplaod; // Remove the metadata part

                console.log(`Uploading file: ${fileName}`);
                console.log(`Base64 string: ${fileAsFormData}`);

                uploadFileToS3(fileAsFormData)
                    .then((url) => {
                        expense.s3FileLocation = url; // Update the expense object with the S3 URL
                        console.log(`File uploaded successfully: ${url}`);
                    })
                    .catch((error) => {
                        console.error(`Error uploading file: ${error}`);
                    });
            }
            else {
                console.log("No file to upload");
            }
        console.log("Expense data:", expense);
    }
}