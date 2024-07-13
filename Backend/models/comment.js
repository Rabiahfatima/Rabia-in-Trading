const mongoose = require('mongoose')
const {Schema} = mongoose;

const commentScheme = new Schema({
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    blog: {type: mongoose.Schema.Types.ObjectId, ref: 'Blog'},
    text: {type: String, required: true},
}, {timestamps: true})

module.exports = mongoose.model('Comment', commentScheme, 'comments');