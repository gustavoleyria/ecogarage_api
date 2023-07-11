const { Schema, model } = require("mongoose");

const consultsSchema = new Schema({  
    authorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 140
    },
    report:{
        type: Boolean,
        default: false
    },
    post: {
        type: Boolean,
        required: true,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Consult = model("Consult", consultsSchema, "consults");

module.exports = Consult;