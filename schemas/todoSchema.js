const express = require('express');
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is Required!'],
    },
    description: String,
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Instance Methods
todoSchema.methods = {
    findActive: function(){
        return mongoose.model('todo').find({status: 'active'}).select({__v: 0, _id: 0});

        // 'this' keyword won't work here. since, mongoose.model('todo') returns the Todo class.
        // and .find, .findById etc are static methods. 
    },

    findActiveWithCallback: function(callback){
        return mongoose.model('todo').find({status: 'active'}, callback);
    }
}

// Statics
todoSchema.statics = {
    findJsTodo: function(){
        return this.find({title: /js/i});
    }
}

// query Helpers
todoSchema.query = {
    findByLang: function(lang){
        return this.where({title: new RegExp(lang, 'i')});
    }
}

module.exports = todoSchema;