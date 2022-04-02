// External Dependancies
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  balance: Number,
})

module.exports = mongoose.model('EUser', userSchema)
