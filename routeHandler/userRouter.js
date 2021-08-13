const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../schemas/userSchema');


// creating model of the user collection
const User = new mongoose.model('user', userSchema);
const userRouter = express.Router();


// SIGNUP ROUTE
userRouter.post('/signup', async (req, res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword,
            status: req.body.status,
        });
        await newUser.save();
        res.status(200).json({message: 'SignUp Successful!'});
    } catch (error) {
        res.status(500).json({error});
    }
});

//LOGIN ROUTE
userRouter.post('/login', async (req, res)=>{
    try {
        const user = await User.findOne({username: req.body.username});
        if(user){
            // comparing password
            const isMatched = await bcrypt.compare(req.body.password, user.password);
            // checking if the password is matched
            if(isMatched){
                // generate jwt
                const token = jwt.sign({
                    username: user.username,
                    userId: user._id,
                }, process.env.JWT_SECRET, { expiresIn: '2h' });
                
                res.status(200).json({
                    access_token: token,
                    message: 'Login Successful!',
                });

            } else {
                res.status(401).json({error: 'Authentication Failure!'});
            }
        } else {
            res.status(401).json({error: 'Authentication Failure!'});
        }
        
    } catch (error) {
        res.status(500).json({error});
    }
});

// GET ALL USERS
userRouter.get('/all', async (req, res)=>{
    try {

        const allUser = await User.find().populate('todos')

        res.status(200).json({
            allUser
        });
    } catch (error) {
        res.status(500).json({
            error
        });
    }
});

// export module
module.exports = userRouter;