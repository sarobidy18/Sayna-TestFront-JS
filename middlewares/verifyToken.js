const jwt = require('jsonwebtoken');
const { Exception } = require('../error/exception');
const base64Key = "rR42zWodSgmwh6xdcGKLGv/sySq/qelw/KZluZvIaSM5wiXMPwqm9BqZ+UFw1v9Uh2FXEo2aCVSIDdw6xOCcjw=="


exports.verifyToken =  (req,res, next) => {
    let auth = req.get("Authorization");
    if (auth) {
        auth = auth.replace("Bearer ","");
        jwt.verify(auth, base64Key, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    error: true,
                    message: "Votre token n'est pas correct"
                })
            }
            // console.log("decoded : ",decoded);
            req.app.set("credential", decoded)
            next();
        })
    } else {
        return res.status(401).send({
            error: true,
            message: "Votre token n'est pas correct"
        })
    }
}