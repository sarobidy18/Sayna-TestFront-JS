const router = require('express').Router();
const {Bill, validateBill} = require('../models/bills');
const {verifyToken} = require('../middlewares/verifyToken');
const { Exception } = require('../error/exception');

//403 "Vos droits d'accès ne permettent pas d'accéder à la ressource"
router.get("/bills",[verifyToken], (req, res, next) => {
    Promise.resolve().then(() => {
        let credential = req.app.get("credential");

        if (credential.role && credential.role == "ADMIN") {
            Bill.find().exec()
                .then(response => {
                    return res.status(200).send({
                        error: false,
                        bill: response
                    })
                }).catch(() =>  next(new Exception(500,"Erreur lors du récupérations des bills")))
        } else {
            next(new Exception(403, "Vots droits d'accès ne permettent pas d'accéder à la ressource"))
        }

    }).catch(() => next(new Exception(500, "Internal Server Error")))
})

router.post("/bills/new", [verifyToken], (req, res,next) => {
    Promise.resolve().then(async () => {
        await validateBill(req.body);
        
        Bill.create([{
            id_Stripe: req.body.id_Stripe,
            date_payment: req.body.date_payment,
            montant_ht: req.body.montant_ht,
            montant_ttc: req.body.montant_ttc,
            source: req.body.source,
        }]).then(response => {
            return res.status(201).send({
                error: false,
                message: "bill créé avec succès"
            })
        }).catch(() => next(new Exception(500, "Internal Server Error")))
    }).catch(() => {
        if (err.name == "ValidationError") {
            if (err.details[0].type == "string.empty") {
                next(new Exception(400, "Une ou plusieurs données obligatoire sont manquantes"));
            } else if (err.details[0].type == "string.base" || err.details[0].type ==  "object.unknown" || err.details[0].type == "number.base" || err.details[0].type == "string.uri") {
                next(new Exception(409, "Une ou plusieurs données obligatoire sont erronées"));
            } else if (err.details[0].type == "string.email") {
                next(new Exception(400, "Email/password incorrect"));
            } else {
                console.log("Error type : ", err.details[0].type)
                next(new Exception(409, "Erreur de données"));
            }
        } else {
            next(new Exception(500, err))
        }
    });
});

module.exports = router;