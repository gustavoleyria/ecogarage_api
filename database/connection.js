//Importar mongoose
const mongoose = require("mongoose");
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;


//Metodo de conexion
const connection = async()=>{
    try{
        console.log(MONGODB_URI)
        await mongoose.connect(`${MONGODB_URI}`);
        console.log("Conectado exitosamente a la BD app_ecogarage");
    }catch(error){
        console.log(error);
        throw new Error("No se ha podido conectar a la BD");
    }
}

//Exportar conexion
module.exports = connection;