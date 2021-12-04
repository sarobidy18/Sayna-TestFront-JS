const static = require('./static');
const authentication = require('./authentication');
const user = require("./user");
const songs = require("./songs");
const bills = require('./bills');
const bodyParser = require('body-parser');
const path = require('path');
const { Exception } = require('../error/exception');

module.exports = (app) => {
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(bodyParser.json());
    app.use(authentication);
    app.use(user);
    app.use(songs);
    app.use(bills);
    app.use(static);
    app.use(function(err, req,res, next) {
        if (err) {
            console.log("Error ",err.code," : ", err.message)
            res.status(err.code).send({
                error: true,
                message: err.message
            })
        }
    })
    
}