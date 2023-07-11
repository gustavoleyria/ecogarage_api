//Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");
require('dotenv').config();

//Importar clave secreta
// const {secret} = require("../helpers/jwt");
const secret = process.env.CLAVE_SECRETA;

//Crear middleware (metodo o funcion)
exports.auth = (req,res,next)=>{
    //Comprobar cabecera de autenticacion
    console.log(req.headers.authorization)
    if(!req.headers.authorization){
        return res.status(403).send({
            status:"error",
            message: "La petición no tiene la cabeza de la autenticacion",
            token: req.headers.authorization
        });
    }

    //Limpiar token
    let token = req.headers.authorization.replace(/['"]+/g, '');
    /*return res.status(403).send({
        status:"error",
        message: "La petición no tiene la cabeza de la autenticacion",
        token1: req.headers.authorization,
        token
    });*/

    try{
         //Decodificar token
        let payload = jwt.decode(token,secret);
        
        
        /*return res.status(403).send({
            status:"error",
            message: "La petición no tiene la cabeza de la autenticacion",
            token1: req.headers.authorization,
            token,
            exp: payload.exp,
            expn: moment().unix()
            
        });*/

        //Comprobar la expiracion del token
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status:"error",
                message: "Token expirado"
            });
        }

        //Agregar datos del usuario dentro de la request
        req.user = payload;
        // Imprimir el valor de req.user.id
        console.log(req.user.id);

    }catch(error){
        console.log(error)
        return res.status(404).send({
            status:"error",
            message: "Token invalido del catch",
            error
        });
    }
   

    //Pasar a la ejecución de la accion
    next();
}

