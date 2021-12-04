const router = require('express').Router();
const path = require('path');
const {Exception} = require('../error/exception');

router.get("/", (req, res, next) => {
    Promise.resolve().then(() => {
        res.render("index")
    }).catch((err) => next(new Exception(500, err)))
})

router.get("*", (req,res, next) => {
    Promise.resolve().then(() => {
        res.sendFile(path.join(__dirname,"../public/notfound.html"));
    }).catch((err) => next(new Exception(500, err)))
})


module.exports = router;