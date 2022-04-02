const fastify = require('fastify')({
  logger: true
})

const mongoose = require('mongoose')

const routes = require('./routes')

// Connect to DB
mongoose.connect('mongodb+srv://purnashis:purnashis@cluster0.lhecz.mongodb.net/groyyo?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err))

// Loop over each route
routes.forEach((route, index) => {
  fastify.route(route)
})

const start = async () => {
  try {
    await fastify.listen(3000, '0.0.0.0')
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
