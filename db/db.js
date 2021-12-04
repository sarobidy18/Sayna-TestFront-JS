const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    console.log(config.database);
    mongoose.connect(config.database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => console.log(`Connected to DB : ${config.database}`))
    .catch((err => {
        console.log("DB Error :",err)
        if (err.code == 'EHOSTUNREACH') {
            console.log("DB ERROR: can't reach mongoDB")
        }
    }))
}