// Importar conexion a BD
const connection = require("./database/connection");

// Importar dependencias
require('dotenv').config();
const express = require("express");
const cors = require("cors");

// Mensaje de bienvenida
console.log("API REST con Node para app ecogarage-web arrancada!!!")

//Ejecutar conexion a la BD
connection();

//Crear servicio de Node
const app = express();
const port = process.env.PORT || 3003; // Utiliza el puerto definido en .env o el puerto 3000 como valor predeterminado

//Configurar Cors
app.use(cors());

//Covertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Cargar configuracion de rutas
const UserRoutes = require("./routes/users");
const ProductRoutes = require("./routes/products");
const CommentRoutes = require("./routes/comments");
const ConsultRoutes = require("./routes/consults");
const AdvertisementRoutes = require("./routes/advertisements");

app.use("/api/user", UserRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/comment", CommentRoutes);
app.use("/api/consult", ConsultRoutes);
app.use("/api/advertisement", AdvertisementRoutes);


//Ruta de prueba
app.get("/ruta-prueba", (req,res)=>{
    return res.status(200).send({
        status:"success",
        message:"Ruta de prueba contabilidad exitosa"
    })
})

//Poner al servidor a escuchar peticiones https
app.listen(port, ()=>{
    console.log("Escuchando en el puerto ",port);
})
