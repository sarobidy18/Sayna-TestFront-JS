const mongoose = require("mongoose");
const Joi = require('@hapi/joi');

const Bill = mongoose.model("bills", new mongoose.Schema({
    id_Stripe: { type: String, required: true },
    date_payment: { type: Date, required: true },
    montant_ht: { type: Number, requried: true },
    montant_ttc: {type: Number, required: true },
    source: {type:String, default: "Stripe"},
    createdAt: {type: Date, default: new Date()},
    updateAt: Date
}))

function validateBill(bill) {
    const schema = Joi.object({
        id_Stripe: Joi.string().required(),
        date_payment: joi.string().required(),
        montant_ht: Joi.number().required(),
        montant_ttc: Joi.number().required(),
        source: Joi.string().required()
    });

    return Joi.attempt(bill, schema);
}

exports.Bill = Bill;
exports.validateBill = validateBill;