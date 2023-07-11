//Importaciones
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
        message: "Mensaje enviado desde ./controllers/consults.js"
    });
}

//Crear comentario
const createConsult = async (req, res) => {
    try {
      const authorId = req.user.id;
      const productId = req.params.productId;
      const content = req.body.content;
      console.log(authorId)
      console.log(productId)
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
      const consult = new Consult({
        authorId,
        productId,
        content
      });

      const user = await User.findById(authorId);
      const product = await Product.findById(productId);
      const idUser = product.userId;
      const userEmailDestino = await User.findById(idUser);
      
  
      // Guardar el comentario en la base de datos
      await consult.save();

      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: user.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por tu consulta - Eco-Garage-Web",
        html: `
            <h1>Muchas gracias por haber realizado tu consulta </h1>
            <p>Tu consulta fué: ${content} por el producto: ${product.name}</p>
            <p>Descripción: ${product.description}</p>
            <p>Precio: $${product.price}</p>
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
      to: userEmailDestino.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
      subject: "Hicieron una consulta por tu producto - Eco-Garage-Web",
      html: `
          <h1>Muchas gracias por atender esta consulta</h1>
          <p>La consulta fué: ${content} por el producto: ${product.name}</p>
          <p>Descripción: ${product.description}</p>
          <p>Precio: $${product.price}</p>
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
  
      return res.status(200).json({ message: "Comentario creado exitosamente", consult });
    } catch (error) {
        console.log(error)
      return res.status(500).json({ error: "Error al crear el comentario"});
    }
  };


//Bloquear y desbloquear comentario
const consultStatus = async (req, res) => {
try {
    const consultId = req.params.consultId;
    const userId  = req.user.id;

    console.log(consultId)
    console.log(userId)

    // Verificar si el usuario está autorizado
    if (!userId) {
    return res.status(401).json({ error: "Usuario no autorizado" });
    }

    // Buscar el comentario en la base de datos
    const consult = await Consult.findById(consultId);
    console.log(consult)

    if (!consult) {
    return res.status(404).json({ error: "Comentario no encontrado" });
    }


    // Cambiar el estado de 'post'
    consult.post = !consult.post;
    if(consult.post){
        consult.report = false
    }

    // Guardar el comentario actualizado en la base de datos
    await consult.save();

    return res.status(200).json({ message: "Estado del comentario modificado exitosamente", consult });
} catch (error) {
    return res.status(500).json({ error: "Error al modificar el estado del comentario" });
}
};
  
//Reportar  comentario
const consultReport = async (req, res) => {
    try {
      const consultId = req.params.consultId;
      const userId  = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Buscar el comentario en la base de datos
      const consult = await Consult.findById(consultId);
  
      if (!consult) {
        return res.status(404).json({ error: "Comentario no encontrado" });
      }
  
      // Cambiar el estado de 'report'
      consult.report = true;
  
      // Guardar el comentario actualizado en la base de datos
      await consult.save();

      const user = await User.findById(userId);
      const product = await Product.findById(consult.productId);

      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: user.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por tu sugerencia - Eco-Garage-Web",
        html: `
            <h1>Muchas gracias por haber reportado una consulta</h1>
            <p>La consulta reportada es: ${consult.content} por el producto: ${product.name}</p>
            <p>Descripción: ${product.description}</p>
            <p>Precio: $${product.price}</p>
            <p>A la brevedad posible analizaremos tu petición</p>
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
  
      return res.status(200).json({ message: "Estado del bloqueo del reporte del comentario modificado exitosamente", consult });
    } catch (error) {
      return res.status(500).json({ error: "Error al modificar el estado del reporte del comentario" });
    }
  };

//Desrepotear comentario
const consultUnreport = async (req, res) => {
  try {
    const consultId = req.params.consultId;
    const userId  = req.user.id;

    // Verificar si el usuario está autorizado
    if (!userId) {
      return res.status(401).json({ error: "Usuario no autorizado" });
    }

    // Buscar el comentario en la base de datos
    const consult = await Consult.findById(consultId);

    if (!consult) {
      return res.status(404).json({ error: "Comentario no encontrado" });
    }

    // Cambiar el estado de 'report'
    consult.report = false;

    // Guardar el comentario actualizado en la base de datos
    await consult.save();

    return res.status(200).json({ message: "Estado del desbloqueo del reporte del comentario modificado exitosamente", consult });
  } catch (error) {
    return res.status(500).json({ error: "Error al modificar el estado del reporte del comentario" });
  }
};
  

//Listar todos los comentarios
const listConsults = async (req, res) => {
try {
    const userId = req.user.id;

    // Verificar si el usuario está autorizado
    if (!userId) {
    return res.status(401).json({ error: "Usuario no autorizado" });
    }

    // Obtener todos los comentarios del usuario
    const consults = await Consult.find();

    return res.status(200).json({ consults });
} catch (error) {
    return res.status(500).json({ error: "Error al obtener los comentarios" });
}
};

//Listar consultas por id
const listConsultById = async (req, res) => {
  try {
      const userId = req.user.id;
      const consultId = req.params.consultId;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
      return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios del usuario
      const consults = await Consult.find({consultId});
  
      return res.status(200).json({ consults });
  } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios" });
  }
  };

//Listar los comentarios que yo tengo
const getUserConsults = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios del usuario
      const consults = await Consult.find({ authorId: userId });
  
      return res.status(200).json({ consults });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };


//Listar los comentarios que yo recibo
const getProductConsults = async (req, res) => {
  try {
    // const userId = req.user.id;

    // Verificar si el usuario está autorizado
    // if (!userId) {
    //   return res.status(401).json({ error: "Usuario no autorizado" });
    // }

    // Obtener todos los comentarios del usuario
    const consults = await Consult.find();

    // Obtener el ID y nombre del producto
    const productConsults = await Promise.all(
      consults.map(async (consult) => {
        const productId = consult.productId;
        const product = await Product.findById(productId, "id name");
        return { ...consult.toObject(), productId: product.id, productName: product.name, userId: product.userId };
      })
    );

    return res.status(200).json({ productConsults });
  } catch (error) {
    return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
  }
};


//Listar los comentarios que se reportaron
const listReportConsults = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios reportados del usuario
      const consults = await Consult.find({ report: true });
  
      return res.status(200).json({ consults });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };

//Listar los comentarios que se bloquearon
const listBloquedConsults = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Verificar si el usuario está autorizado
      if (!userId) {
        return res.status(401).json({ error: "Usuario no autorizado" });
      }
  
      // Obtener todos los comentarios reportados del usuario
      const consults = await Consult.find({ post: false });
  
      return res.status(200).json({ consults });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios del usuario" });
    }
  };
  
  
  


//Exportar acciones
module.exports = {
    prueba,
    createConsult,
    consultStatus,
    consultReport,
    consultUnreport,
    listConsults,
    getUserConsults,
    getProductConsults,
    listReportConsults,
    listBloquedConsults,
    listConsultById
}