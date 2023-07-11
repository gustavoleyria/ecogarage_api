//Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const fs = require("fs");
const path = require("path");
const User = require('../models/users');
const jwt = require("../helpers/jwt");
const { isValidObjectId } = require('mongoose');
const nodemailer = require("nodemailer");
require('dotenv').config();
const mail = process.env.MAIL;
const mailpass = process.env.MAILPASS;
const decifrar = process.env.ENCRITANDO;


//Accion de prueba
const prueba = (req,res)=>{

    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde ./controllers/users.js"
    });
}

// Registro de usuario
const registerUser = async (req, res) => {
    try {
      const { email, cellphone, password } = req.body;
  
      // Validar parámetros de entrada
      validate({ email, cellphone, password });
  
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).send({
          status: "error",
          message: "El usuario ya está registrado",
        });
      }

      const existingCell = await User.findOne({ cellphone });

      if (existingCell) {
        return res.status(400).send({
          status: "error",
          message: "El numero de celular ya está registrado",
        });
      }
  
      // Generar hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, parseInt(decifrar));
  
      // Crear nuevo usuario
      const newUser = new User({
        email,
        cellphone,
        password: hashedPassword,
      });
  
      // Guardar usuario en la base de datos
      await newUser.save();

      // Enviar correo electrónico de verificación
      //const verificationLink = `https://tuaplicacion.com/verify?userId=${newUser._id}`;//cambiar ruta
      //const verificationLink = `http://localhost:3002/api/user/verify/${newUser._id}`;//cambiar ruta

      const mailOptions = {
        from: `${mail}`, // Dirección de correo electrónico del remitente
        to: email, // Dirección de correo electrónico del destinatario (puede ser newUser.email)
        subject: "Gracias por tu registro en Eco-Garage-Web",
        html: `
            <h1>Muchas gracias por registrate</h1>
            <p>Tu email es: ${email} y tu cel es: ${cellphone}</p>
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

    // Buscar el usuario en la base de datos por su email
    const user = await User.findOne({ email });

    // Generar token de autenticación
    const token = jwt.createToken(user);


    return res.status(200).send({
      status: "success",
      message: "Usuario registrado correctamente. Se ha enviado un correo de verificación.",
      user: user.email,
      id: user._id,
      token
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Email: tu correo - Cell: formato WhastApp preferentemente +5493885063xxx - La contraseña debe tener de 5 a 10 caracteres con números, minúsculas y mayúsculas",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Buscar el usuario en la base de datos por su email
      const user = await User.findOne({ email });

  
      // Verificar si el usuario existe
      if (!user) {
        return res.status(400).send({
          status: "error",
          message: "El usuario no existe",
        });
      }
  
      // Verificar la contraseña
      const passwordMatch = await bcrypt.compare(password, user.password);
  
      if (!passwordMatch) {
        return res.status(400).send({
          status: "error",
          message: "La contraseña es incorrecta",
        });
      }
  
      // Generar token de autenticación
      const token = jwt.createToken(user);
  
      // Enviar respuesta exitosa con el token
      return res.status(200).send({
        status: "success",
        message: "Inicio de sesión exitoso",
        user: user.email,
        id: user._id,
        token,
      });
    } catch (error) {
      setError(error.response.data.message);
      return res.status(500).send({
        status: "error",
        message: "Error al iniciar sesión",
        error: error.message,
      });
    }
  };


// Actualizar el avatar del usuario
const updateAvatar = async (req,res)=>{
    //Configuracion de subida (multer)
    console.log(req.file)

    //Recoger fichero de imagen y comprobar que existe
    if(!req.file){
        return res.status(404).send({
            status: "error",
            message: "La peticion no tiene el  archivo"
        })
    }

    //Conseguir el nombre del archivo
    let image = req.file.mimetype;
    console.log(image)

    //Sacar info de la imagen
    const imageSplit = image.split("\/");
    const extension = imageSplit[1];
    console.log(extension)

    //Conformar si la extension es valida
    if(extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif"){
        //borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        //Devolver error
        return res.status(404).send({
            status: "error",
            message: "Extension incorrecta"
        })
    }

    //Si es correcto , guardar la imagen en bd
    User.findOneAndUpdate({_id: req.user.id}, {avatar: req.file.filename}, {new: true})
    .then( async (userUpdated)=>{
        if(!userUpdated){
            return res.status(404).send({
                status: "error",
                message: "Error en la subida de archivo en  then"
            })
        }

      // Enviar correo electrónico de notificación de actualización de contraseña
      const user = await User.findById(req.user.id);
      const mailOptions = {
        from: `${mail}`,
        to: user.email,
        subject: "Actualización de avatar exitosa",
        html: `
          <h1>Actualización de avatar</h1>
          <p>Hola ${user.email}, tu avatar se ha actualizado exitosamente.</p>
          <p>Si no realizaste esta acción, por favor contáctanos de inmediato.</p>
        `,
      };
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mail,
          pass: mailpass,
        },
      });
  
      await transporter.sendMail(mailOptions);
        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Metodo  upload subir imagen",
            user: userUpdated,
            file: req.file
        })

    })
    .catch((error)=>{
        return res.status(404).send({
            status: "error",
            message: "Error en la subida de archivo en catch"
        })
    })

    
}

// Actualizar el número de celular del usuario
const updateCellphone = async (req, res) => {
    const userId = req.user.id; // Obtener el ID del usuario desde los parámetros de la URL
    const { cellphone } = req.body; // Obtener el nuevo número de celular desde el cuerpo de la solicitud
  
    // Verificar si el ID del usuario es válido
    if (!userId) {
      return res.status(400).send({
        status: 'error',
        message: 'ID de usuario inválido',
      });
    }
  
    // Actualizar el número de celular del usuario en la base de datos
    User.findByIdAndUpdate(userId, { cellphone }, { new: true })
      .then(async(userUpdated) => {
        if (!userUpdated) {
          return res.status(404).send({
            status: 'error',
            message: 'No se encontró el usuario',
          });
        }

      // Enviar correo electrónico de notificación de actualización de contraseña
      const user = await User.findById(userId);
      const mailOptions = {
        from: `${mail}`,
        to: user.email,
        subject: "Actualización de número de celular exitosa",
        html: `
          <h1>Actualización de número de celular</h1>
          <p>Hola ${user.email}, tu número de celular se ha actualizado exitosamente.</p>
          <p>Si no realizaste esta acción, por favor contáctanos de inmediato.</p>
        `,
      };
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mail,
          pass: mailpass,
        },
      });
  
      await transporter.sendMail(mailOptions);

  
        // Devolver respuesta con el usuario actualizado
        return res.status(200).send({
          status: 'success',
          message: 'Número de celular actualizado exitosamente',
          user: userUpdated,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: 'error',
          message: 'Error al actualizar el número de celular del usuario',
          error: error.message,
        });
      });
  };

  
// Bloquear a un usuario por su ID
const blockUser = (req, res) => {
    const userId = req.params.id;
  
    // Verificar si el ID del usuario es válido
    if (!userId) {
      return res.status(400).send({
        status: "error",
        message: "ID de usuario inválido",
      });
    }
  
    // Actualizar el role del usuario a "BLOCKED"
    User.findByIdAndUpdate(
      userId,
      { role: "BLOCKED" },
      { new: true }
    )
      .then((userUpdated) => {
        if (!userUpdated) {
          return res.status(404).send({
            status: "error",
            message: "No se encontró el usuario",
          });
        }
  
        // Devolver respuesta con el usuario actualizado
        return res.status(200).send({
          status: "success",
          message: "Usuario bloqueado exitosamente",
          user: userUpdated,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: "error",
          message: "Error al bloquear el usuario",
          error: error.message,
        });
      });
  };
  

// Desbloquear a un usuario por su ID
const unlockedUser = (req, res) => {
    const userId = req.params.id;
  
    // Verificar si el ID del usuario es válido
    if (!userId) {
      return res.status(400).send({
        status: "error",
        message: "ID de usuario inválido",
      });
    }
  
    // Actualizar el role del usuario a "UNLOCKED"
    User.findByIdAndUpdate(
      userId,
      { role: "OPERATOR" },
      { new: true }
    )
      .then((userUpdated) => {
        if (!userUpdated) {
          return res.status(404).send({
            status: "error",
            message: "No se encontró el usuario",
          });
        }
  
        // Devolver respuesta con el usuario actualizado
        return res.status(200).send({
          status: "success",
          message: "Usuario bloqueado exitosamente",
          user: userUpdated,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: "error",
          message: "Error al desbloquear el usuario",
          error: error.message,
        });
      });
  };

  
// Obtener la lista completa de usuarios
const getUsers = (req, res) => {
    User.find({})
      .then((users) => {
        if (!users || users.length === 0) {
          return res.status(404).send({
            status: "error",
            message: "No se encontraron usuarios",
          });
        }
  
        // Devolver respuesta con la lista de usuarios
        return res.status(200).send({
          status: "success",
          message: "Lista de usuarios obtenida exitosamente",
          users: users,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: "error",
          message: "Error al obtener la lista de usuarios",
          error: error.message,
        });
      });
  };

// Obtener un usuario por su ID
const getUserById = (req, res) => {
    const userId = req.params.id; // Obtener el ID del parámetro de la URL
  
    User.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            status: "error",
            message: "No se encontró el usuario",
          });
        }
  
        // Devolver respuesta con el usuario encontrado
        return res.status(200).send({
          status: "success",
          message: "Usuario encontrado exitosamente",
          user: user,
        });
      })
      .catch((error) => {
        return res.status(500).send({
          status: "error",
          message: "Error al obtener el usuario",
          error: error.message,
        });
      });
  };

// Enviar correo de actualización de contraseña
const sendPasswordUpdateEmail = async (req, res) => {
    try {
      // Obtener el ID del usuario desde req.user.id
      const userId = req.user.id;
  
      // Buscar al usuario en la base de datos por su ID
      const user = await User.findById(userId);

      const { password } = req.body;
  
      if (!user) {
        return res.status(404).send({
          status: "error",
          message: "No se encontró el usuario",
        });
      }

      // Generar hash de la nueva contraseña
      const saltRounds = parseInt(decifrar);
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Actualizar la contraseña del usuario en la base de datos
      user.password = hashedPassword;
      await user.save();
  
      // Enviar correo electrónico de notificación de actualización de contraseña
      const mailOptions = {
        from: `${mail}`,
        to: user.email,
        subject: "Actualización de contraseña exitosa",
        html: `
          <h1>Actualización de contraseña</h1>
          <p>Hola ${user.email}, tu contraseña se ha actualizado exitosamente.</p>
          <p>Si no realizaste esta acción, por favor contáctanos de inmediato.</p>
        `,
      };
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mail,
          pass: mailpass,
        },
      });
  
      await transporter.sendMail(mailOptions);

      
  
      return res.status(200).send({
        status: "success",
        message: "Correo de actualización de contraseña enviado correctamente",
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al enviar el correo de actualización de contraseña",
        error: error.message,
      });
    }
  };

// Enviar correo de actualización de contraseña
const randomElement = (array) => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

const generateRandomPassword = () => {
  const consonants = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  let password = '';

  // Generar una consonante mayúscula
  password += randomElement(consonants);

  // Generar una consonante minúscula
  password += randomElement(consonants.toLowerCase());

  // Generar 4 números aleatorios
  for (let i = 0; i < 4; i++) {
    password += randomElement(numbers);
  }

  return password;
};


const loginUpdatePassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar una contraseña aleatoria
    const password = generateRandomPassword();

    // Actualizar la contraseña del usuario
    // Generar hash de la nueva contraseña
    const saltRounds = parseInt(decifrar);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Actualizar la contraseña del usuario en la base de datos
    user.password = hashedPassword;
    await user.save();

    // Enviar correo electrónico de notificación de actualización de contraseña
    const mailOptions = {
      from: `${mail}`,
      to: user.email,
      subject: "Actualización de contraseña exitosa",
      html: `
        <h1>Actualización de contraseña</h1>
        <p>Hola ${user.email}, tu contraseña se ha actualizado exitosamente.</p>
        <p>Tu nueva contraseña es ${password}</p>
        <p>Si no realizaste esta acción, por favor contáctanos de inmediato.</p>
      `,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: mail,
        pass: mailpass,
      },
    });

    await transporter.sendMail(mailOptions);


    return res.status(200).json({
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};




  
// Actualizar contraseña por ID
const updatePasswordById = async (req, res) => {
    try {
      const { password } = req.body;
      console.log(password)
  
  
      // Obtener el ID del usuario desde req.user.id
      const userId = req.params.id;
      console.log(userId)
  
      // Buscar al usuario en la base de datos por su ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).send({
          status: "error",
          message: "No se encontró el usuario",
        });
      }
  
      // Generar hash de la nueva contraseña
      const saltRounds = parseInt(decifrar);
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Actualizar la contraseña del usuario en la base de datos
      user.password = hashedPassword;
      await user.save();

      // Enviar correo electrónico de notificación de actualización de contraseña
      const mailOptions = {
        from: `${mail}`,
        to: user.email,
        subject: "Actualización de contraseña exitosa",
        html: `
          <h1>Actualización de contraseña</h1>
          <p>Hola ${user.email}, tu contraseña se ha actualizado exitosamente.</p>
          <p>Si no realizaste esta acción, por favor contáctanos de inmediato.</p>
        `,
      };
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: mail,
          pass: mailpass,
        },
      });
  
      await transporter.sendMail(mailOptions);
  
      return res.status(200).send({
        status: "success",
        message: "Contraseña actualizada correctamente",
      });
    } catch (error) {
      return res.status(500).send({
        status: "error",
        message: "Error al actualizar la contraseña",
        error: error.message,
      });
    }
  };
  
// Obtener imagen de usuario
//router.get("/getUserImage/:userId", 
const getUserImage = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Obtener el usuario de la base de datos
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario tiene una imagen guardada
    if (!user.avatar) {
      return res.status(404).json({ message: "Imagen no encontrada para este usuario" });
    }

    // Leer el archivo de imagen desde la ruta y enviarlo como respuesta
    const imagePath = path.join(__dirname, "../upload/avatars", user.avatar);
    res.sendFile(imagePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener la imagen del usuario" });
  }
};

  
  
  
    



//Exportar acciones
module.exports = {
    prueba,
    registerUser,
    loginUser,
    updateAvatar,
    updateCellphone,
    blockUser,
    unlockedUser,
    getUsers,
    getUserById,
    sendPasswordUpdateEmail,
    updatePasswordById,
    getUserImage,
    loginUpdatePassword
}