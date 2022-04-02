const carController = require('../controllers/carController')

const routes = [
  {
    method: 'POST',
    url: '/api/settle',
    handler: carController.settle
  },
  {
    method: 'GET',
    url: '/api/balances/:user/:owes',
    handler: carController.getBalancesUser
  },
  {
    method: 'POST',
    url: '/api/add/expense',
    handler: carController.addExpense,
  },
  {
    method: 'POST',
    url: '/api/add/user',
    handler: carController.addUser
  },

]

module.exports = routes
