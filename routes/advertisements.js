// Importar dependencias
const express = require("express");

const check = require("../middlewares/auth");
//Cargar Router
const router = express.Router();


//Importar controlador
const AdvertisementController = require("../controllers/advertisements");



//Definir rutas
router.get("/prueba", AdvertisementController.prueba);
router.post("/createSponsor", AdvertisementController.registerSponsor);
router.put("/updateSponsor/:id", AdvertisementController.updateSponsor);
router.put("/blockSponsor/:id", AdvertisementController.blockAdvertisement);
router.put("/unblockSponsor/:id", AdvertisementController.unblockAdvertisement);
router.get("/showSponsor", AdvertisementController.showAdvertisement);
router.get("/showSponsor/:id", AdvertisementController.showAdvertisementById);


//Exportar routes
module.exports = router;