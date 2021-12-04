const router = require('express').Router();
const { Exception } = require('../error/exception');
const {User} = require('../models/user');
const {UserCart, validateUserCart} = require('../models/userCart');
const {verifyToken} = require('../middlewares/verifyToken');

router.get("/user",[verifyToken], (req, res, next) => {
    Promise.resolve().then(() => {
        
        User.find().exec()
        .then(response => {
            return res.status(200).send({
                error: false,
                message: "Tous les utilisateurs",
                users: response
            })
        })
    }).catch(() => next(new Error))
});

router.get("/user/:id",[verifyToken], (req, res, next) => {
    Promise.resolve().then(() => {
        if (!req.params.id) {
            next(new Exception(400, "ID utilisateurn manquant"))
        }

        User.findOne({_id: req.params._id}).exec()
        .then(response => {
            return res.status(200).send({
                error: false,
                message: "utilisateurn trouvé",
                users: response
            })
        })
        .catch(error => {
            next(new Exception(400, "Erreur lors de la recherche de l'utilisateur"))
        })
    }).catch(() => next(new Error))
});


// 402 "informations bancaire incorrectes"
// 403 "vos droits d'accès ne permet pas d'accéder à la ressource"
router.put("/user/cart",[verifyToken], (req, res, next) => {
    Promise.resolve().then(async () => {
        await validateUserCart(req.body);

        let UserCartCount = await UserCart.count({cartNumber: {$eq: req.body.cartNumber}}).exec()

        if (UserCartCount >= 1) {
            next(new Exception(409, "La carte existe déja"));
        } else {
            UserCart.create([{
                cartNumber: req.body.cartNumber,
                month: req.body.month,
                year: req.body.year,
                default: req.body.default
            }]).then(response => {
                if (response.length >= 1) {
                    return res.status(200).send({
                        error: false,
                        message: "Vos données ont été mises à jour"
                    })
                }
            })
        }

    }).catch((err) => {
        if (err.name == "ValidationError") {
            if (err.details[0].type == "string.empty") {
                next(new Exception(400, "Une ou plusieurs données obligatoire sont manquantes"));
            } else if (err.details[0].type == "string.base" || err.details[0].type ==  "object.unknown" || err.details[0].type == "number.base") {
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
    })
});

router.delete("/user", [verifyToken], (req, res, next) => {
    let credential = req.app.get("credential");
    
    User.deleteOne({_id: credential._id}).exec()
        .then(response => {
            return res.status(200).send({
                error: false,
                message: "Votre compte a été supprimée avec succès"
            })
    })
})


module.exports = router;