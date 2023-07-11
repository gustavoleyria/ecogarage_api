// Importar dependencias
const express = require("express");

const check = require("../middlewares/auth");
//Cargar Router
const router = express.Router();


//Importar controlador
const ConsultController = require("../controllers/consults");



//Definir rutas
router.get("/prueba", ConsultController.prueba);
router.post("/createConsult/:productId", check.auth, ConsultController.createConsult);
router.put("/consultStatus/:consultId", check.auth, ConsultController.consultStatus);
router.put("/consultReport/:consultId", check.auth, ConsultController.consultReport);
router.put("/consultUnreport/:consultId", check.auth, ConsultController.consultUnreport);
router.get("/listConsult", check.auth, ConsultController.listConsults);
router.get("/listConsultByUser", check.auth, ConsultController.getUserConsults);
router.get("/getProductConsults", ConsultController.getProductConsults);
router.get("/listReportConsults", check.auth, ConsultController.listReportConsults);
router.get("/listBloquedConsults", check.auth, ConsultController.listBloquedConsults);
router.get("/listConsultById/:consultId", check.auth, ConsultController.listBloquedConsults);

//Exportar routes
module.exports = router;