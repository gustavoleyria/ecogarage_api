//Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");
require('dotenv').config();

//Clave secreta
const secret = process.env.CLAVE_SECRETA;

//Crear fx para generar tokens
const createToken = (user)=>{

    const payload = {
        id: user._id,
        email: user.email,
        cellphone: user.cellphone,
        role: user.role,
        avatar: user.avatar,
        valoration: user.valoration,
        verified: user.verified,
        iat: moment().unix(),
        exp: moment().add(1,"days").unix()
    }

    //devolver token
    return jwt.encode(payload, secret);

}

//Exportar modulos
module.exports = {
    createToken
}