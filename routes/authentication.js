const router = require('express').Router();
const {User, validateUser} = require('../models/user');
const {validateLogin} = require('../models/login');
const {Tentative} = require('../models/tentative');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Exception } = require('../error/exception');
const moment = require('moment');

const base64Key = "rR42zWodSgmwh6xdcGKLGv/sySq/qelw/KZluZvIaSM5wiXMPwqm9BqZ+UFw1v9Uh2FXEo2aCVSIDdw6xOCcjw=="


router.post("/login", (req, res, next) => {
    Promise.resolve().then(async() => {
        await validateLogin(req.body);

        await User.findOne({email: req.body.email}).exec()
        .then(async (response) => {

            let currentEmail = await Tentative.findOne({email: {$eq: req.body.email}}).exec();

            let currentTime = new moment();

            if (!response) {
                next(new Exception(404,"Pas d'utilisateur trouvé"))
            } 
            else {

                if (currentEmail && currentEmail.nextAccessTime && currentTime.isBefore(moment.utc(currentEmail.nextAccessTime).format("YYYY-MM-DDTHH:mm:ss"))) {
                    next(new Exception(429,`Trop de tentative sur l'email "${req.body.email}" (5 max) --veuillez patienter (2min)`));
                } else {
                    if (currentEmail && currentEmail.count >= 5 && currentTime.isAfter(moment.utc(currentEmail.nextAccessTime).format("YYYY-MM-DDTHH:mm:ss"))) {
                        await Tentative.findOneAndUpdate(
                            {email: {$eq: currentEmail.email}},
                            {   
                                count:0,
                                nextAccessTime: ""
                            },
                            {new: true}
                        ).exec().then(response => {
                            currentEmail = response;
                        });
                    }


                    await bcrypt.compare(req.body.password, response.password).then(async (result) => {
                        if (result) {
                            // tentativeLogin[index].nbrTentive = 0;
                            // console.log("Tentative : ", tentativeLogin);

                            await Tentative.updateOne(
                                {   email: {$eq: req.body.email}},
                                {   
                                    count: 0,
                                    nextAccessTime: ""
                                }
                            ).exec();

                            let token = await jwt.sign({...response._doc}, base64Key)
                            return res.status(200).send({
                                error: false,
                                message: "L'utilisateur à été authentifié avec succès",
                                user: response,
                                token: token
                            })
                        } else {

                            if (currentEmail) {
                                if (currentEmail.count >= 5) {
                                    if (!currentEmail.nextAccessTime) {
                                        let nextTime = moment().add(2, "minutes");
                                        await Tentative.findOneAndUpdate(
                                            {email: {$eq: currentEmail.email}},
                                            {nextAccessTime: new Date(Date.UTC(nextTime.year(), nextTime.month(), nextTime.date(), nextTime.hours(), nextTime.minutes(), nextTime.seconds()))},
                                            {new: true}
                                        ).exec().then(response => {
                                            console.log(response)
                                        });
                                    }
    
    
                                    next(new Exception(429,`Trop de tentative sur l'email "${req.body.email}" (5 max) --veuillez patienter (2min) ${currentEmail.nextAccessTime}`));
                                } else {
                                    await Tentative.findOneAndUpdate(
                                        {email: {$eq: req.body.email}},
                                        {count: currentEmail.count + 1},
                                        {new: true}
                                    ).exec()
                                    next(new Exception(400,"Email/password incorrect"));
                                }
                                
                            } else {await Tentative.create([{
                                    email: req.body.email,
                                    count: 1,
                                }])
                                next(new Exception(400,"Email/password incorrect"));
                            }

                            
                        }
                    }).catch((err) => {console.log(err); next(new Exception(500, err))})
                } 
            }
        })
        .catch((err) => {console.log(err); next(new Exception(500, err))})

    }).catch((err) => {
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
            console.log(err)
            next(new Exception(500, err))
        }
    })
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
                typeAbonemment: req.body.typeAbonemment,
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