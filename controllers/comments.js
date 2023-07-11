//Importaciones

const Comment = require('../models/comments');
const User = require('../models/users');
const Consult = require('../models/consults');
const Product = require('../models/products');
const nodemailer = require("nodemailer");
require('dotenv').config();
const mail = process.env.MAIL;
const mailpass = process.env.MAILPASS;



//Accion de prueba
const prueba = (req,res)=>{

    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde ./controllers/users.js"
    });
}

//Crear comentario
const createComment = async (req, res) => {
    try {
      const authorId = req.user.id;
      const recipientId = req.params.id;
      const content = req.body.content;
      console.log(authorId)
      console.log(recipientId)
      console.log(content)
  
      // Verificar si el usuario está autorizado
      if (!authorId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Verificar si el contenido del comentario está vacío
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "El contenido del comentario no puede estar vacío" });
      }
  
      // Crear el comentario
      const comment = new Comment({
        authorId,
        recipientId,
        content
      });
  
      // Guardar el comentario en la base de datos
      await comment.save();

      const author = await User.findById(authorId);
      const recipient = await User.findById(recipientId);

      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: author.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por tu reseña - Eco-Garage-Web",
        html: `
            <h1>Muchas gracias por haber realizado una reseña</h1>
            <p>Tu comentario fué: ${content} para el usuario: ${recipient.email}</p>
            <h3>Éxitos y buenas Compras y Ventas</h3>
        `,
        };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mail, // Coloca aquí tu dirección de correo electrónico de Gmail
          pass: mailpass, // Coloca aquí tu contraseña de Gmail
        },
      });

    await transporter.sendMail(mailOptions);

    const mailOptionsDestino = {
      from: `${mail}`, // Dirección de correo electrónico del remitente
      to: recipient.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
      subject: "Hicieron una reseña de vos - Eco-Garage-Web",
      html: `
          <h1>Muchas gracias por atender este mensaje</h1>
          <p>La reseña fué: ${content} del usuario: ${author.email}</p>
          <h3>Éxitos y buenas Compras y Ventas</h3>
      `,
      };

    const transporterDestino = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mail, // Coloca aquí tu dirección de correo electrónico de Gmail
        pass: mailpass, // Coloca aquí tu contraseña de Gmail
      },
    });

  await transporterDestino.sendMail(mailOptionsDestino);
  
      return res.status(200).json({ message: "Comentario creado exitosamente", comment });
    } catch (error) {
        console.log(error)
      return res.status(500).json({ error: "Error al crear el comentario"});
    }
  };


//Bloquear y desbloquear comentario
const commentStatus = async (req, res) => {
try {
    const idComment = req.params.id;
    const userId  = req.user.id;

    // Verificar si el usuario está autorizado
    if (!userId) {
    return res.status(401).json({ error: "Usuario no autorizado" });
    }

    // Buscar el comentario en la base de datos
    const comment = await Comment.findById(idComment);

    if (!comment) {
    return res.status(404).json({ error: "Comentario no encontrado" });
    }


    // Cambiar el estado de 'post'
    comment.post = !comment.post;
    if(comment.post){
        comment.report = false
    }

    // Guardar el comentario actualizado en la base de datos
    await comment.save();

    return res.status(200).json({ message: "Estado del comentario modificado exitosamente", comment });
} catch (error) {
    return res.status(500).json({ error: "Error al modificar el estado del comentario" });
}
};
  
//Reportar y desrepotear comentario
const commentReport = async (req, res) => {
    try {
      const commentId = req.params.id;
      const userId  = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Buscar el comentario en la base de datos
      const comment = await Comment.findById(commentId);
  
      if (!comment) {
        return res.status(404).json({ error: "Comentario no encontrado" });
      }
  
      // Cambiar el estado de 'report'
      comment.report = true;
  
      // Guardar el comentario actualizado en la base de datos
      await comment.save();

      const author = await User.findById(userId);
      const recipient = await User.findById(comment.recipientId);

      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: author.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por tu propuesta de revisión - Eco-Garage-Web",
        html: `
            <h1>Muchas gracias por haber reportado una reseña</h1>
            <p>El comentario fué: ${comment.content} del usuario: ${recipient.email}</p>
            <h3>Éxitos y buenas Compras y Ventas</h3>
        `,
        };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mail, // Coloca aquí tu dirección de correo electrónico de Gmail
          pass: mailpass, // Coloca aquí tu contraseña de Gmail
        },
      });

    await transporter.sendMail(mailOptions);
  
      return res.status(200).json({ message: "Estado del reporte del comentario modificado exitosamente", comment });
    } catch (error) {
      return res.status(500).json({ error: "Error al modificar el estado del reporte del comentario" });
    }
  };
  

//Listar todos los comentarios
const listComments = async (req, res) => {
try {
    //const userId = req.user.id;

    // Verificar si el usuario está autorizado
    // if (!userId) {
    // return res.status(401).json({ error: "Usuario no autorizado" });
    // }

    // Obtener todos los comentarios del usuario
    const comments = await Comment.find();

    return res.status(200).json({ comments });
} catch (error) {
    return res.status(500).json({ error: "Error al obtener los comentarios" });
}
};


//Listar los comentarios que yo tengo
const getUserComments = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios del usuario
      const comments = await Comment.find({ authorId: userId });
  
      return res.status(200).json({ comments });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };


//Listar los comentarios que yo recibo
const getUserReceptComments = async (req, res) => {
    try {
      //const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios del usuario
      const comments = await Comment.find({ recipientId: userId });
  
      return res.status(200).json({ comments });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };

//Listar los comentarios que se reportaron
const listReportComments = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios reportados del usuario
      const comments = await Comment.find({ report: true });
  
      return res.status(200).json({ comments });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };

//Listar los comentarios que se bloquearon
const listBloquedComments = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios reportados del usuario
      const comments = await Comment.find({ post: false });
  
      return res.status(200).json({ comments });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };
  
  
  


//Exportar acciones
module.exports = {
    prueba,
    createComment,
    commentStatus,
    commentReport,
    listComments,
    getUserComments,
    getUserReceptComments,
    listReportComments,
    listBloquedComments
}