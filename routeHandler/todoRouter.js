const express = require('express');
const mongoose = require('mongoose');
const todoSchema = require('../schemas/todoSchema');
const userSchema = require('../schemas/userSchema');
const authUser = require('../middlewares/authUser');
const Todo = new mongoose.model('todo', todoSchema);
const User = new mongoose.model('user', userSchema);

const todoRouter = express.Router();

// Creating routes

// get all the todos
todoRouter.get('/', authUser, (req, res)=>{
    Todo.find({user: req.userId})
    .populate('user')
    .select({
        _id: 0,
        date: 0
    }).limit(2).exec((err, data) => {
        if (err) {
            res.status(500).json({
                error: err
            });
        } else {
            console.log(data[0].title); // we are getting this as a valid JS object
            res.status(200).json({
                result: data,
            });
        }
    });

});

// get all active todos
todoRouter.get('/active', authUser, async (req, res)=>{
    try {
        const todo = new Todo();
        const data = await todo.findActive();
        res.status(200).json({data});
    } catch (error) {
        res.status(500).json({error});
    }
});

// same code as above using callback
todoRouter.get('/active-callback', (req, res)=>{
    const todo = new Todo();
    todo.findActiveWithCallback((err, data)=>{
        if(data){
            res.status(200).json({data});
        } else {
            res.status(500).json({err});
        }
    });
});

todoRouter.get('/js', async (req, res)=>{
    try {
        const data = await Todo.findJsTodo();
        res.status(200).json({data});
    } catch (error) {
        res.status(500).json({error});
    }
});

todoRouter.get('/lang', async (req, res)=>{
    try {
        const data = await Todo.find().findByLang('js').select({
            _id: 0,
            __v: 0,
        });
        res.status(200).json({data});
    } catch (error) {
        res.status(500).json({error});
    }
});

// get a particular todo
todoRouter.get('/:id', async (req, res)=>{
    
    try {
        const data = await Todo.findById({_id: req.params.id}).select({description: 1});
        res.status(200).json({
            result: data,
        });

    } catch (error) {
        res.status(500).json({
            error
        });
    }

// It can also be done by this

    // await Todo.findById({_id: req.params.id}).select({description: 1})
    //     .then((data)=>{
    //         res.status(200).json({
    //             data
    //         })
    //     })
    //     .catch((err)=>{
    //         res.status(500).json({
    //             err
    //         });
    //     });
    
});

// There is no need to use async, await if we use callback functions

// create a todo
todoRouter.post('/', authUser, async (req, res)=>{ 
    try {
        const newTodo = new Todo({ // It will create the collection object according to the schema
            ...req.body,
            user: req.userId,
        });

        // saving the plain JS object into the mongo database with a simple function .save(). 
        const todo = await newTodo.save();
        
        await User.updateOne({_id: todo.user}, {
            $push: {
                todos: todo._id
            }
        })

        res.status(200).json({
            message: 'Todo saved successfully!'
        });
    } catch (error) {
        res.status(500).json({
            error: error
        });
    }
});

// create multiple todo
todoRouter.post('/all',(req, res)=>{
    Todo.insertMany(req.body, (err)=>{
        if(err){
            res.status(500).json({
                error: err,
            })
        }else{
            res.status(200).json({
                message: 'Todos were created successfully!'
            })
        }
    });
});

// update a todo
todoRouter.put('/:id', (req, res)=>{
    const result = Todo.findOneAndUpdate({_id: req.params.id}, {
        $set: {
            status: 'inactive',
            title: 'Horray!',
            description: 'I am a voyager!',
            owner: "Mashuk",
        }
    },
    {
        useFindAndModify: false,
    },
    (err)=>{
        if(err){
            res.status(500).json({
                error: err
            })
        } else{
            res.status(200).json({
                message: 'Todo Updated Successfully!'
            })
        }
    });
    console.log(result);
});

// delete a todo
todoRouter.delete('/:id', (req, res)=>{
    Todo.deleteOne({_id: req.params.id}, (err)=>{
        if(err){
            res.status(500).json({
                error: err
            })
        } else{
            res.status(200).json({
                message: 'Todo Deleted Successfully!'
            })
        }
    });
});

// export handler
module.exports = todoRouter;