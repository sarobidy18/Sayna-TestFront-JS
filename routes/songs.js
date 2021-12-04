const router = require('express').Router();
const {Song, validateSong} = require('../models/songs');
const {verifyToken} = require('../middlewares/verifyToken');
const { Exception } = require('../error/exception');

// 403 "Votre abonnement ne permet pas d'accéder à la ressource"
router.get("/songs",[verifyToken], (req, res, next) => {
    Promise.resolve().then(() => {
        console.log("credential : ",req.app.get("credential"));
        let credential = req.app.get("credential");

        if (credential.typeAbonemment && credential.typeAbonemment == "SUPER_ABONEMMENT") {
            Song.find().exec()
            .then(response => {
                return res.status(200).send({
                    error: false,
                    songs: response
                })
            })
        } else {
            next(new Exception(403, "Votre abonnement ne permet pas d'acceder à la resource"));
        }
    }).catch(() => next(new Exception(500, "Internal Server Error")))
});


//409 "L'audio n'est pas accessible"
//403 "Votre abonnement ne permet pas d'accéder à la ressource"
router.get("/songs/:id",[verifyToken], (req, res, next) => {
    Promise.resolve().then(() => {
        if (!req.params.id) {
            next(new Exception(400, "ID song manquant"))
        } else {
            Song.findOne({_id: req.params.id}).exec()
            .then(response => {
                return res.status(201).send({
                    error: false,
                    song: response
                })
    
            })
            .catch(() => next(new Exception(409, "L'audio n'est pas accessible")))
        }
    }).catch(() => next(new Exception(500, "Internal Server Error")))
})

router.post('/song/new', [verifyToken], (req, res, next) => {
    Promise.resolve().then(async () => {
        await validateSong(req.body);
        
        await Song.create([{
            name: req.body.name,
            url: req.body.url,
            cover: req.body.cover,
            time: req.body.time,
            type: req.body.type
        }]).then(response => {
            if (response.length >= 1) {
                return res.status(201).send({
                    error: false,
                    message: "Song créé avec succès",
                    song: response[0]
                })
            }
        }).catch(() =>{
            next(new Exception(500, "Erreur d'enregistrement du nouveau song"));
        })

    }).catch((err)=> {
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
    })
})

module.exports = router;