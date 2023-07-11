//Importaciones
const bcrypt = require("bcrypt");
const validate = require("../helpers/validate");
const fs = require("fs");
const path = require("path");
const User = require('../models/users');
const Product = require('../models/products');
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
        message: "Mensaje enviado desde ./controllers/products.js"
    });
}

// Crear un nuevo producto
const createProduct = async (req, res) => {
    try {
      const { name, description, price, category } = req.body;
      const userId = req.user.id;
      console.log(name)
      console.log(description)
      console.log(price)
      console.log(category)
      console.log(category.length)
      console.log(userId)
  
      // Verificar si hay imágenes adjuntas
      if (!req.files || req.files.length === 0) {
        return res.status(404).send({
          status: "error",
          message: "La petición no tiene archivos adjuntos"
        });
      }
  
      // Procesar los archivos de imagen
      const pictures = req.files.map(file => file.path);
      
  
      // Verificar la validez de la categoría
      if (!Array.isArray(category) || category.length < 1 || category.length > 3) {
        return res.status(400).json({
          status: 'error',
          message: 'La categoría debe ser un array con mínimo 1 y máximo 3 elementos.'
        });
      }
  
      // Buscar el usuario por el userId y seleccionar solo los campos email y cellphone
      const user = await User.findById(userId).select('email cellphone');
  
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
      }
  
      const product = await Product.create({ name, description, price, picture: pictures, category, userId: userId });
      
      res.status(201).json({ status: 'success', message: 'Producto creado exitosamente', data: { product, user } });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Error al crear el producto', error: error.message });
    }
  };

// Actualizar un producto
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const productId = req.params.id; // Obtener el ID del producto de los parámetros de la ruta
    const userId = req.user.id; // Obtener el ID del usuario desde req.user

    // Buscar el producto por su ID y verificar si existe
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado',
        });
      }

    if (product.locked) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto bloqueado',
        });
      }

    

    // Verificar si el usuario tiene permiso para actualizar el producto
    if (product.userId.toString() !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para actualizar este producto',
      });
    }

    // Actualizar los campos del producto con los valores proporcionados
    if (name) {
      product.name = name;
    }
    if (description) {
      product.description = description;
    }
    if (price) {
      product.price = price;
    }
    if (req.files.length <= 2) {
            // Procesar los archivos de imagen
            const pictures = req.files.map(file => file.path);            
            product.picture = pictures;
        }
  
    if (category) {
        // Verificar la validez de la categoría
        if (!Array.isArray(category) || category.length < 1 || category.length > 3) {
            return res.status(400).json({
            status: 'error',
            message: 'La categoría debe ser un array con mínimo 1 y máximo 3 elementos.'
            });
        }
        product.category = category;
    }

    // Guardar los cambios en la base de datos
    const updatedProduct = await product.save();

    res.status(200).json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar el producto',
      error: error.message,
    });
  }
};

const lockProduct = async (req, res) => {
    try {
      const productId = req.params.id; // Obtener el ID del producto de los parámetros de la ruta
      const userId = req.user.id; // Obtener el ID del usuario desde req.user
  
      // Buscar el producto por su ID y verificar si existe
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Producto no encontrado',
        });
      }
  
      // Verificar si el usuario tiene permiso para bloquear el producto
      if (product.userId.toString() !== userId) {
        return res.status(403).json({
          status: 'error',
          message: 'No tienes permiso para bloquear este producto',
        });
      }
  
      // Actualizar el estado de locked del producto a true
      product.locked = true;
  
      // Guardar los cambios en la base de datos
      const updatedProduct = await product.save();
  
      res.status(200).json({
        status: 'success',
        message: 'Producto bloqueado exitosamente',
        data: { product: updatedProduct },
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Error al bloquear el producto',
        error: error.message,
      });
    }
  };

const unlockProduct = async (req, res) => {
try {
    const productId = req.params.id; // Obtener el ID del producto de los parámetros de la ruta
    const userId = req.user.id; // Obtener el ID del usuario desde req.user

    // Buscar el producto por su ID y verificar si existe
    const product = await Product.findById(productId);

    if (!product) {
    return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado',
    });
    }

    // Verificar si el usuario tiene permiso para bloquear el producto
    if (product.userId.toString() !== userId) {
    return res.status(403).json({
        status: 'error',
        message: 'No tienes permiso para desbloquear este producto',
    });
    }

    // Actualizar el estado de locked del producto a true
    product.locked = false;

    // Guardar los cambios en la base de datos
    const updatedProduct = await product.save();

    res.status(200).json({
    status: 'success',
    message: 'Producto desbloqueado exitosamente',
    data: { product: updatedProduct },
    });
} catch (error) {
    res.status(500).json({
    status: 'error',
    message: 'Error al desbloquear el producto',
    error: error.message,
    });
}
};
  

 // Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    // Consultar todos los productos en la base de datos
    const products = await Product.find();


    res.status(200).json({
      status: 'success',
      message: 'Productos obtenidos exitosamente',
      data: { products },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los productos',
      error: error.message,
    });
  }
};

// Obtener un producto por su ID
const getProductById = async (req, res) => {
  try {
    const productId = req.params.id; // Obtener el ID del producto de los parámetros de la ruta

    // Verificar si el ID del producto es válido
    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de producto inválido',
      });
    }

    // Buscar el producto por su ID en la base de datos
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Producto no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Producto obtenido exitosamente',
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

// Obtener productos por categorías
const getProductsByCategories = async (req, res) => {
  try {
    const categories = req.body.categories; // Obtener el array de categorías del cuerpo de la solicitud

    // Verificar si el array de categorías está vacío
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'El array de categorías no puede estar vacío',
      });
    }

    // Buscar productos que contengan al menos una de las categorías proporcionadas
    const products = await Product.find({ category: { $in: categories } });

    if (products.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontraron productos en las categorías especificadas',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Productos obtenidos exitosamente',
      data: { products },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los productos por categorías',
      error: error.message,
    });
  }
};

const imagen = (req, res) => {
  // Obtener el nombre del archivo de la URL
  const file = req.params.file;
  console.log(file)

  // Construir la ruta completa de la imagen
  const filePath = path.join(__dirname, '../upload/products', file);

  // Comprobar si el archivo existe
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      return res.status(404).send({
        status: 'error',
        message: 'No existe la imagen',
      });
    }

    // Enviar el archivo como respuesta
    res.sendFile(filePath);
  });
};


//Exportar acciones
module.exports = {
  prueba,
  createProduct,
  updateProduct,
  lockProduct,
  unlockProduct,
  getProducts,
  getProductById,
  getProductsByCategories,
  imagen
};