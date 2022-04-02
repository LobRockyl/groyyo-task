const boom = require('boom')

const User = require('../models/User')
const Transaction = require('../models/Transaction')
exports.addTransaction = async (req) => {
  try {
    const {sender, reciever, amount} = req
    //add checks
    const tran = new Transaction(req)
    return tran.save()
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.getBalancesUser = async (req, reply) => {
  try {
    const user = req.params.user
    const owes_to = req.params.owes
    //whatever he is paid - paid by this user
    const res = await Transaction.aggregate([
      { "$match" : { "$or" : [{ "sender" : user , "reciever": owes_to}, {"sender": owes_to, "reciever" : user }] } },
      { "$project" : { 
          "user" : { "$cond" : [{ "$eq" : ["$sender", user] }, "$sender", "$reciever" ] },
          "amount" : { "$cond" : [{ "$eq" : ["$sender", user] }, { "$multiply" : [-1, "$amount"] }, "$amount" ] }
      } },
      { "$group" : { "_id" : "$user" ,"balance" : { "$sum" : "$amount" } } }
    ])
    if(res.length>0){
      reply.send({owes: res[0].balance})
    }else{
      reply.send({owes: 0})
    }
    
  } catch (err) {
    throw boom.boomify(err)
  }
}

// exports.getBalancesUser = async (req, reply) => {
//   try {
//     const user = req.params.user
//     //whatever he is paid - paid by this user
//     const res = await Transaction.aggregate([
//       { "$match" : { "$or" : [{ "sender" : user }, { "receiver" : user }] } },
//       { "$project" : { 
//           "user" : { "$cond" : [{ "$eq" : ["$sender", user] }, "$sender", "$receiver" ] },
//           "amount" : { "$cond" : [{ "$eq" : ["$sender", user] }, { "$multiply" : [-1, "$amount"] }, "$amount" ] }
//       } },
//       { "$group" : { "_id" : "$user", "balance" : { "$sum" : "$amount" } } }
//     ])
//     reply.send(res)
//   } catch (err) {
//     throw boom.boomify(err)
//   }
// }
// Add a new car
exports.addExpense = async (req, reply) => {
  try {
    let users = req.body.users
    let amount = parseFloat(req.body.amount)
    let paid_by = req.body.paid_by

    let n=users.length
    let avg = amount/n
    //all other users owe to the payer
    //addTransactions for other users
    const idx = await users.indexOf(paid_by);
    if (idx > -1) {
      await users.splice(idx, 1); // 2nd parameter means remove one item only
    }
    
    await users.forEach(element => {
      request = {sender:paid_by,reciever:element,amount:avg}
      this.addTransaction(request)
    });
    //subtract from balance of user
    await User.findOneAndUpdate({name: paid_by},{ $inc: { balance: -amount } })
    reply.send({success:true, msg: "added exp"})
  } catch (err) {
    console.log(err)
    reply.send({success:false, msg:err})
  }
}

// Update an existing car
exports.addUser = async (req, reply) => {
  try {
    const name = req.body.name
    const balance = req.body.balance
    const user = new User({name,balance})
    user.save()
    reply.send({success:true, msg: "added user"})
  } catch (err) {
    reply.send({success:true, msg:err})
  }
}

exports.settle = async(req,res) =>{
  try {
    const A = req.body.A
    const B = req.body.B
    const res = await Transaction.aggregate([
      { "$match" : { "$or" : [{ "sender" : A , "reciever": B}, {"sender": B, "reciever" : A }] } },
      { "$project" : { 
          "user" : { "$cond" : [{ "$eq" : ["$sender", A] }, "$sender", "$reciever" ] },
          "amount" : { "$cond" : [{ "$eq" : ["$sender", A] }, { "$multiply" : [-1, "$amount"] }, "$amount" ] }
      } },
      { "$group" : { "_id" : "$user" ,"balance" : { "$sum" : "$amount" } } }
    ])
    if (res.length){
      var aowesb = parseFloat(res[0].balance)
      if(aowesb<0){
        //actually b owes a
        console.log(aowesb)
        await User.findOneAndUpdate({ name: A}, { $inc: { balance: -aowesb } });
        await User.findOneAndUpdate({ name: B}, { $inc: { balance: aowesb } });
        request = {sender:A,reciever:B,amount:aowesb}
        await this.addTransaction(request)
      }else{
        //a owes b
        console.log(aowesb)
        await User.findOneAndUpdate({ name: A}, { $inc: { balance: -aowesb } });
        await User.findOneAndUpdate({ name: B}, { $inc: { balance: aowesb } });
        request = {sender:A,reciever:B,amount:aowesb}
        await this.addTransaction(request)
      }
    }
    
    res.send({success:true, msg: "balance update user"})
  } catch (err) {
    res.send({success:true, msg:err})
  }
}
