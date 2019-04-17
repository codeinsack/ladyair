const express = require('express');
const morgan = require('morgan');
require('./db/mongoose');
const userRouter = require('./routers/user');
const orderRouter = require('./routers/order');

const app = express();
const port = process.env.PORT;

app.use(morgan('dev'));
app.use(express.json());
app.use(userRouter);
app.use(orderRouter);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
