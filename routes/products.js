// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");

//Cargar Router
const router = express.Router();


//Importar controlador
const ProductController = require("../controllers/products");

//Configuracion de subida
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"./upload/products/");
    },
    filename: (req,file,cb)=>{
        cb(null,"product-"+Date.now()+"-"+file.originalname);
    }
})

const uploads = multer({storage});


//Definir rutas
router.get("/prueba", ProductController.prueba);
router.post("/createProduct", [check.auth, uploads.array("file0")], ProductController.createProduct);
router.put("/updateProduct/:id", [check.auth, uploads.array("file0")], ProductController.updateProduct);
router.put("/lockProduct/:id", check.auth, ProductController.lockProduct);
router.put("/unlockProduct/:id", check.auth, ProductController.unlockProduct);
router.get("/getProducts/", ProductController.getProducts);
router.get("/getProductsById/:id", ProductController.getProductById);
router.get("/getProductsBycategories", ProductController.getProductsByCategories);
router.get("/imagenProducts/:file", ProductController.imagen);


//Exportar routes
module.exports = router;