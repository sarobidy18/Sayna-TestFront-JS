const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const UserCart = mongoose.model("user_cart", new mongoose.Schema({
    cartNumber: Number,
    month: Number,
    year: Number,
    default: String
}))

function validateUserCart(cart) {
    const schema = Joi.object({
        cartNumber: Joi.number().required(),
        month: Joi.number().required(),
        year: Joi.number().required(),
        default: Joi.string().required()
    })

    return Joi.attempt(cart, schema);
}

exports.UserCart = UserCart;
exports.validateUserCart = validateUserCart;