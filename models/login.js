const Joi = require('@hapi/joi');

function validateLogin(login) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })

    return Joi.attempt(login, schema);
}

exports.validateLogin = validateLogin;