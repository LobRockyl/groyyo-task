// External Dependancies
const mongoose = require('mongoose')

const tranSchema = new mongoose.Schema({
  sender: String,
  reciever: String,
  amount: Number,
})

module.exports = mongoose.model('Transactions', tranSchema)
