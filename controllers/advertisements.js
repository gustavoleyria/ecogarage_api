//Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const fs = require("fs");
const path = require("path");
const User = require('../models/users');
const Advertisement  = require('../models/advertisement');
const jwt = require("../helpers/jwt");
const { isValidObjectId } = require('mongoose');
const nodemailer = require("nodemailer");
require('dotenv').config();
const mail = process.env.MAIL;
const mailpass = process.env.MAILPASS;


//Accion de prueba
const prueba = (req,res)=>{

    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde ./controllers/advertisements.js"
    });
}

// Registro de usuario
const registerSponsor = async (req, res) => {
    try {  
      const { title, link, sponsor, email, cellphone, password } = req.body;
  
      // Verificar que los campos title, link y sponsor estén presentes
      if (!title || !link || !sponsor || !email || !cellphone || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validar parámetros de entrada
      validate({ email, cellphone, password });
  
      // Verificar que los campos title, link y sponsor sean únicos
      const existingAdvertisement = await Advertisement.findOne({
        $or: [{ title }, { link }, { sponsor }, { email }, { cellphone }],
      });
  
      if (existingAdvertisement) {
        return res.status(400).json({ error: "Advertisement already exists" });
      }

      // Generar hash de la contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Crear el nuevo anuncio
      const advertisement = new Advertisement({
        title,
        link,
        sponsor,
        email,
        cellphone,
        password: hashedPassword
      });
  
      // Guardar el anuncio en la base de datos
      await advertisement.save();

      // Enviar correo electrónico de verificación
      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por tu registro como Publicista en Eco-Garage",
        html: `
            <h1>Muchas gracias ${sponsor} por registrate como Publicista</h1>
            <p>Tu email es: ${email} y tu cel es: ${cellphone}</p>
            <p>Tu link es: ${link} y tu video se llama: ${title}</p>
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
  
      // Enviar una respuesta exitosa
      res.status(200).json({ message: "Advertisement registered successfully" });
    } catch (error) {
      // Manejar cualquier error ocurrido durante el proceso
      console.error("Error registering advertisement:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  };


// Actualizar el número de celular del usuario
const updateSponsor = async (req, res) => {
    try {
      const { title, link, sponsor, email, emailupdate, cellphone, password, passwordupdate } = req.body;
      const id = req.params.id;
  
      // Verificar que email y password estén presentes en el cuerpo de la solicitud
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
  
      // Buscar el anuncio por ID
      const advertisement = await Advertisement.findById(id);
  
      if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
      }
  
      // Verificar que el email y la contraseña coincidan
      const passwordMatch = await bcrypt.compare(password, advertisement.password);
  
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
  
      // Actualizar los campos si están presentes en el cuerpo de la solicitud
      if (title) {
        advertisement.title = title;
      }
  
      if (link) {
        advertisement.link = link;
      }
  
      if (sponsor) {
        advertisement.sponsor = sponsor;
      }
  
      if (emailupdate) {
        advertisement.email = emailupdate;
      }
  
      if (cellphone) {
        advertisement.cellphone = cellphone;
      }
  
      if (passwordupdate) {
        // Generar hash de la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(passwordupdate, saltRounds);
        advertisement.password = hashedPassword;
      }

      // Enviar correo electrónico de verificación
      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: advertisement.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por actualizar tu registro en Eco-Garage",
        html: `
            <h1>Muchas gracias ${advertisement.sponsor} por registrate como Publicista</h1>
            <p>Tu email es: ${advertisement.email} y tu cel es: ${advertisement.cellphone}</p>
            <p>Tu link es: ${advertisement.link} y tu video se llama: ${advertisement.title}</p>
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
  
      // Guardar los cambios en la base de datos
      await advertisement.save();
  
      // Devolver el anuncio actualizado y un mensaje de éxito
      res.status(200).json({ message: "Advertisement updated successfully" });
    } catch (error) {
      console.error("Error updating advertisement:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  };

//Bloquear anuncio
const blockAdvertisement = async (req, res) => {
try {
    const id = req.params.id;

    // Buscar el anuncio por ID
    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
    return res.status(404).json({ error: "Advertisement not found" });
    }

    // Actualizar el estado a "locked"
    advertisement.state = "locked";

    // Guardar los cambios en la base de datos
    await advertisement.save();

    // Enviar correo electrónico de verificación
    const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: advertisement.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Bloqueo de anuncio en Eco-Garage",
        html: `
            <h1>Estimado Sponsor ${advertisement.sponsor}</h1>
            <p>Tu link: ${advertisement.link} y con título: ${advertisement.title} fue temporalmente bloqueado</p>
            <p>Por cualquier comentario puedes comunicarte al +5493885063909</p>
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

    // Devolver el anuncio actualizado y un mensaje de éxito
    res.status(200).json({ message: "Advertisement locked successfully" });
} catch (error) {
    console.error("Error blocking advertisement:", error);
    res.status(500).json({ error: "An error occurred" });
}
};

//Desbloquear anuncio
const unblockAdvertisement = async (req, res) => {
    try {
        const id = req.params.id;
    
        // Buscar el anuncio por ID
        const advertisement = await Advertisement.findById(id);
    
        if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
        }
    
        // Actualizar el estado a "locked"
        advertisement.state = "unlocked";
    
        // Guardar los cambios en la base de datos
        await advertisement.save();

         // Enviar correo electrónico de verificación
        const mailOptions = {
            from: `${mail}`, // Dirección de correo electrónico del remitente
            to: advertisement.email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
            subject: "Desbloqueo de anuncio en Eco-Garage",
            html: `
                <h1>Estimado Sponsor ${advertisement.sponsor}</h1>
                <p>Tu link: ${advertisement.link} y con título: ${advertisement.title} fue desbloqueado</p>
                <p>Por cualquier comentario puedes comunicarte al +5493885063909</p>
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
    
        // Devolver el anuncio actualizado y un mensaje de éxito
        res.status(200).json({ message: "Advertisement unlocked successfully" });
    } catch (error) {
        console.error("Error blocking advertisement:", error);
        res.status(500).json({ error: "An error occurred" });
    }
    };
      
//Mostar anunciones  
const showAdvertisement = async (req, res) => {
    try {
        // Obtener todos los anuncios
        const advertisements = await Advertisement.find();
    
        // Devolver la lista de anuncios
        res.status(200).json(advertisements);
      } catch (error) {
        console.error("Error getting advertisements:", error);
        res.status(500).json({ error: "An error occurred" });
      }
    };

//Mostrar un anuncio por id
const showAdvertisementById = async (req, res) => {
    try {
        const { id } = req.params;
    
        // Verificar que el ID sea válido
        if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid advertisement ID" });
        }
    
        // Buscar el anuncio por su ID
        const advertisement = await Advertisement.findById(id);
    
        // Verificar si se encontró el anuncio
        if (!advertisement) {
        return res.status(404).json({ error: "Advertisement not found" });
        }
    
        // Devolver el anuncio encontrado
        res.status(200).json(advertisement);
    } catch (error) {
        console.error("Error getting advertisement by ID:", error);
        res.status(500).json({ error: "An error occurred" });
    }
    };



//Exportar acciones
module.exports = {
    prueba,
    registerSponsor,
    updateSponsor,
    blockAdvertisement,
    unblockAdvertisement,
    showAdvertisement,
    showAdvertisementById
}