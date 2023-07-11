// Importar dependencias
const express = require("express");
const check = require("../middlewares/auth");
const limiter = require("../middlewares/limitRate");

//Cargar Router
const router = express.Router();

//const check = require('../middlewares/auth');

//Importar controlador
const UserController = require("../controllers/users");

//Configuracion de subida
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,"./upload/avatars/");
    },
    filename: (req,file,cb)=>{
        cb(null,"avatar-"+Date.now()+"-"+file.originalname);
    }
})

const uploads = multer({storage});


//Definir rutas
router.get("/prueba", UserController.prueba);
router.post("/register", UserController.registerUser);
router.post("/loginUser", limiter , UserController.loginUser);
router.put("/recoverPassword", UserController.loginUpdatePassword);
router.put("/updateAvatar", [check.auth,uploads.single("file0")], UserController.updateAvatar);
router.put("/updatecellphone", check.auth, UserController.updateCellphone);
router.put("/blockUser/:id", check.auth, UserController.blockUser);
router.put("/unlockUser/:id", check.auth, UserController.unlockedUser);
router.get("/getUsers", UserController.getUsers);
router.get("/getUser/:id"/*, check.auth*/, UserController.getUserById);
router.put("/resetPasswordByUser", check.auth, UserController.sendPasswordUpdateEmail);
router.put("/resetPasswordByAdmin/:id", check.auth, UserController.updatePasswordById);
router.get("/getUserImage/:userId", UserController.getUserImage);

//Exportar routes
module.exports = router;