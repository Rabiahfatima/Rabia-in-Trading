const { required } = require('joi');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
   title: { type: String, required: true },
   content: { type: String, required: true },
   photoPath: { type: String, required: true },
   author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, 
{ timestamps: true });

module.exports = mongoose.model('Blog', blogSchema, 'blogs');
