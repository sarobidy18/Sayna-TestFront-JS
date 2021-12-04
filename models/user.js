const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const User = mongoose.model('users', new mongoose.Schema({
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: String,enum: ["ADMIN","SIMPLE_USER"], default: "ADMIN"},
    typeAbonemment: {type: String, enum: ["SUPER_ABONEMMENT", "SIMPLE_ABONEMMENT"], default: "SUPER_ABONEMMENT"},
    dateNaissance: {type: Date, required: true},
    sexe: {type: String, required: true},
    createdAt: Date,
    updateAt: Date,
    subscription: {type: Number, default: 0}
}))

function validateUser(user) {
    const schema = Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string().allow(''),
        typeAbonemment: Joi.string().allow(''),
        date_naissance: Joi.string().required(),
        sexe: Joi.string().required()
    })

    return Joi.attempt(user,schema);
}

exports.User = User;
exports.validateUser = validateUser;