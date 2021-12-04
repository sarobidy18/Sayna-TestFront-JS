const router = require('express').Router();
const {User, validateUser} = require('../models/user');
const {validateLogin} = require('../models/login');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Exception } = require('../error/exception');

const base64Key = "rR42zWodSgmwh6xdcGKLGv/sySq/qelw/KZluZvIaSM5wiXMPwqm9BqZ+UFw1v9Uh2FXEo2aCVSIDdw6xOCcjw=="

// reste: Erreur 429 "message : Trop de tentative sur l'email xxxxx (5 max) --veuillez patienter (2min)"
router.post("/login", (req, res, next) => {
    Promise.resolve().then(() => {
        const {error} = validateLogin(req.body);
        if (!req.body.email || !req.body.password) {
            next(new Exception(400, "Email/password manquant"))
        }
        if (error) {
            next(new Exception(400, "Email/password invalide"))
        }

        User.findOne({email: req.body.email}).exec()
        .then(async (response) => {
            if (!response) {
                next(new Exception(404,"Pas d'utilisateur trouvé"))
            } 
            else {
                await bcrypt.compare(req.body.password, response.password).then((result) => {
                    console.log("result : ", result)
                    if (result) {
                        let token = jwt.sign({...response._doc}, base64Key)
                        return res.status(200).send({
                            error: false,
                            message: "L'utilisateur à été authentifié avec succès",
                            user: response,
                            token: token
                        })
                    } else {
                        next(new Exception(400,"Email/password incorrect"));
                    }
                }).catch((err) => next(new Exception(500,"Erreur de cryptage du password")))
            }
        })
        .catch((err) => next(new Exception(500, err)))

    }).catch((err) => next(new Exception(500, err.message)))
})

router.post("/register", (req, res, next) => {
    Promise.resolve().then(async () => {
        console.log("user : ",req.body);
        await validateUser(req.body);

        let emailCount = await User.count({email: {$eq: req.body.email}}).exec()
        console.log("Email count : ", emailCount);

        if (emailCount >= 1) {
            next(new Exception(409,"Un compte utilisant cette adresse email est déjà enregistré"))
        } else {
            let passwordHashed = ""

            await bcrypt.hash(req.body.password,10).then(function(hash) {
                passwordHashed = hash;
            });

            await User.create([{
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: passwordHashed,
                role: req.body.role,
                dateNaissance: req.body.date_naissance,
                sexe: req.body.sexe
            }])
            .then(response =>  {
                if (response.length >= 1) {
                    res.status(201).send({
                        error: false,
                        message: "l'utilisateur a bien été créé avec succès",
                        user: response[0],
                    })
                }
            })
            .catch(err => next(new Exception(400, err)))
        }


    }).catch((err) =>{
        if (err.name == "ValidationError") {
            if (err.details[0].type == "string.empty") {
                next(new Exception(400, "Une ou plusieurs données obligatoire sont manquantes"));
            } else if (err.details[0].type == "string.base" || err.details[0].type ==  "object.unknown") {
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
})

module.exports = router;