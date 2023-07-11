// Importar dependencias
const express = require("express");

const check = require("../middlewares/auth");
//Cargar Router
const router = express.Router();


//Importar controlador
const CommentController = require("../controllers/comments");



//Definir rutas
router.get("/prueba", CommentController.prueba);
router.post("/createComment/:id", check.auth, CommentController.createComment);
router.put("/commentStatus/:id", check.auth, CommentController.commentStatus);
router.put("/commentReport/:id", check.auth, CommentController.commentReport);
router.get("/listComments"/*, check.auth*/, CommentController.listComments);
router.get("/listCommentsByUser", check.auth, CommentController.getUserComments);
router.get("/listCommentsByUserRecept"/*, check.auth*/, CommentController.getUserReceptComments);
router.get("/listReportComments", check.auth, CommentController.listReportComments);
router.get("/listBloquedComments", check.auth, CommentController.listBloquedComments);

//Exportar routes
module.exports = router;