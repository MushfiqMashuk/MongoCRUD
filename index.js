const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const todoRouter = require('./routeHandler/todoRouter');
const userRouter = require('./routeHandler/userRouter');

const app = express();
dotenv.config();
app.use(express.json());

// database connection with mongoose
mongoose.connect('mongodb://localhost/todos', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(()=>{
        console.log('Successfully Connected to the Database...');
    })
    .catch((err)=>{
        console.log(err);
    });

app.get('/', (req, res)=>{
    console.log('Hello World!');
    res.end();
});

app.use('/todo', todoRouter);
app.use('/user', userRouter);

// default error handler
const errorHandler = (err, req, res, next)=>{
    if(res.headersSent){
        return next(err);
    }
    res.status(500).json({error: err});
}

app.use(errorHandler);

app.listen(3000, ()=>{
    console.log('Listening to port 3000');
});