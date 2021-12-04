const mongoose = require("mongoose");
const Joi = require('@hapi/joi');

const Bill = mongoose.model("bills", new mongoose.Schema({
    id_Stripe: { type: String, required: true },
    date_payment: { type: Date, required: true },
    montant_ht: { type: String, requried: true },
    montant_ttc: {type: String, required: true },
    source: {type:String, default: "Stripe"},
    createdAt: {type: Date, default: new Date()},
    updateAt: Date
}))

function validateBill(bill) {
    const schema = Joi.object({
        id_Stripe: Joi.string().required(),
        date_payment: joi.string().required(),
        montant_ht: Joi.string().required(),
        montant_ttc: Joi.string().required(),
        source: Joi.string().required()
    });

    return Joi.attempt(bill, schema);
}

exports.Bill = Bill;
exports.validateBill = validateBill;