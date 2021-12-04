const mongoose = require('mongoose');

const Tentative = mongoose.model("tentatives", new mongoose.Schema({
    email: {type: String, required: true},
    count: {type: Number, required: true},
    nextAccessTime: Date,
}));

exports.Tentative = Tentative;
