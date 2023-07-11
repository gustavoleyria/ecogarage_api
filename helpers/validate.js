const validator = require("validator");

const validate = (params) => {
    let resultado = false;

    let email = !validator.isEmpty(params.email) &&
        validator.isEmail(params.email);
    
    let cellphone = !validator.isEmpty(params.cellphone)

    let password = !validator.isEmpty(params.password) &&
    validator.isLength(params.password, { min: 5, max: 10 }) &&
    /[0-9]/.test(params.password) &&
    /[a-z]/.test(params.password) &&
    /[A-Z]/.test(params.password);


    if(!cellphone || !email || !password){
        throw new Error("Cellphone, Email o Password no es valido");
    }else{
        console.log("Validacion correcta");
        resultado = true;
    }

    return resultado;
}

module.exports = validate;