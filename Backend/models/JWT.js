const mongoose = require('mongoose')
const{Schema} = mongoose

const JWTSchema= Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: ('User')}
}, {timestamps: true}
)

module.exports = mongoose.model('RefreshToken', JWTSchema, 'tokens')