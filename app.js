require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

const userRouter = require('./api/user/user.controller');
const expenseRouter = require('./api/expense/expense.controller');
const resourceRouter = require('./api/resource/resource.controller');
const resourceCategoryRouter = require('./api/resource_category/resource_category.controller');
const expenseCategoryRouter = require('./api/expense_category/expense_category.controller');
const uploadFileToS3 = require('./api/expense/aws/awsS3Controller');
const cashMoneyRouter = require('./api/cash_money/cash.controller');
const bankAccountRouter = require('./api/bank/bank.controller');

const corsOptions = {
  origin: ['https://mezgeb-d01000e33d0f.herokuapp.com', 'http://localhost:4200'], // Allow specific origins
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

app.use(cors(corsOptions)); // Apply CORS middleware
app.options('*', cors(corsOptions)); // Handle preflight requests

app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies

app.use("/users", userRouter);
app.use("/expenses", expenseRouter);
app.use("/resources", resourceRouter);
app.use("/resource_categories", resourceCategoryRouter);
app.use("/expense_categories", expenseCategoryRouter);
app.use("/file", uploadFileToS3);
app.use("/cash_money", cashMoneyRouter);
app.use("/bank_account", bankAccountRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is running on port", process.env.PORT);
});