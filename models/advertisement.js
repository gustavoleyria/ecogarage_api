const { Schema, model } = require("mongoose");

const advertisementSchema = new Schema({  
    title: {
        type: String,
        unique: true,
        required: true,
        maxlength: 40
    },
    email: {
        type: String,
        required: true,
        unique: true,
      },
    cellphone:{
        type: String,
        required: true,
        unique: true,
        maxlength: 15
      },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
        // match: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w.$!@#%&]{5,10}$/,    
      },
    link: {
        type: String,
        unique: true,
        required: true,
        maxlength: 240
    },
    state: {
        type: String,
        enum: ["locked", "unlocked"],
        default: "unlocked"
    },
    plan: {
        type: String,
        enum: ["mensual", "anual", "trimestral","ilimitado"],
        default: "ilimitado"
    },
    start: {
        type: Date,
        required: true,
        default: Date.now
    },
    finish: {
        type: Date,
        required: true,
        default: function() {
            const endDate = new Date(this.start);
            endDate.setDate(endDate.getDate() + 360);
            return endDate;
        }
    },
    sponsor: {
        type: String,
        unique: true,
        required: true,
        maxlength: 20
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Advertisement = model("Advertisement", advertisementSchema, "advertisements");

module.exports = Advertisement;
