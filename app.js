require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');
const cors = require('cors'); // Ensure cors is imported
const app = express();

const userRouter = require('./api/user/user.controller');
const expenseRouter = require('./api/expense/expense.controller');
const resourceRouter = require('./api/resource/resource.controller');
const resourceCategoryRouter = require('./api/resource_category/resource_category.controller');
const expenseCategoryRouter = require('./api/expense_category/expense_category.controller');

//const {verify} = require('./api/middleware/auth');

app.use(express.json());
app.use(cors()); // Ensure cors middleware is used

app.use("/api/users", userRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/resources", resourceRouter);
app.use("/api/resource_categories", resourceCategoryRouter);
app.use("/api/expense_categories", expenseCategoryRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server is running on port", process.env.PORT);
});