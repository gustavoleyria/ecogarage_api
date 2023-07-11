const { Schema, model } = require("mongoose");
const categories = require('../helpers/categories');

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
    maxlength: 20
  },
  description: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  picture: {
    type: [String],
    default: ["default.png"],
    required: true,
    validate: {
      validator: function (value) {
        return value.length >= 1 && value.length <= 2;
      },
      message: "Picture array must contain 1 to 6 images."
    }
  },
  category: {
    type: [String],
    required: true,
    enum: categories,
    validate: {
      validator: function (value) {
        return value.length <= 3;
      },
      message: "Select up to three categories."
    }
  },
  locked:{
    type: Boolean,
    default: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Product = model("Product", productSchema, "products");

module.exports = Product;
