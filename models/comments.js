const { Schema, model } = require("mongoose");

const commentsSchema = new Schema({  
    authorId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
    recipientId: {
        type: Schema.Types.ObjectId,
        ref: "User",
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

const Comment = model("Comment", commentsSchema, "comments");

module.exports = Comment;