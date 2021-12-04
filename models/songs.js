const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const Song = mongoose.model("songs", new mongoose.Schema({
    name: {type: String, required: true},
    url: {type: String, required: true},
    cover: {type: String, required: true},
    time: {type: String, required: true},
    type: {type: String, required: true},
    createdAt: {type: Date, Default: new Date()},
    updateAt: Date
}))

function validateSong(song) {
    const schema = Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
        cover: Joi.string().required(),
        time: Joi.string().required(),
        type: Joi.string().required(),
    })

    return Joi.attempt(song, schema);
}

exports.Song = Song;
exports.validateSong = validateSong;