//Importar mongoose
const mongoose = require("mongoose");
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;


//Metodo de conexion
const connection = async()=>{
    try{
        console.log(process.env.MONGODB_URI)
        console.log(MONGODB_URI)
        // mongoose.set('strictQuery', true)
        // await mongoose.connect(`${MONGODB_URI}`);
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          });
        console.log("Conectado exitosamente a la BD app_ecogarage");
    }catch(error){
        console.log(error);
        throw new Error("No se ha podido conectar a la BD");
    }
}

//Exportar conexion
module.exports = connection;