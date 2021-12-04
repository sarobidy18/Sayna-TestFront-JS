const mongoose = require('mongoose');
const config = require('config');

// const var_mongo = process.env.MONGODB_URI;
const var_mongo = config.database;

module.exports = function() {
    mongoose.connect(var_mongo, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log(`Connected to DB : ${var_mongo}`))
    .catch((err => {
        console.log("DB Error :",err)
        if (err.code == 'EHOSTUNREACH') {
            console.log("DB ERROR: can't reach mongoDB")
        }
    }))
}