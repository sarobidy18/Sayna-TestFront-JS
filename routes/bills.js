const router = require('express').Router();
const {Bill, validateBill} = require('../models/bills');
const {verifyToken} = require('../middlewares/verifyToken');
const { Exception } = require('../error/exception');

//403 "Vos droits d'accès ne permettent pas d'accéder à la ressource"
router.get("/bills",[verifyToken], (req, res, next) => {
    Promise.resolve().then(() => {
        Bill.find().exec()
            .then(response => {
                return res.status(200).send({
                    error: false,
                    bill: response
                })
            }).catch(() =>  next(new Exception(500,"Erreur lors du récupérations des bills")))
    }).catch(() => next(new Exception(500, "Internal Server Error")))
})

module.exports = router;