import pkg from '../package.json'
//
// External imports
//

import { log, print } from 'io.maana.shared'

// middleware to support GraphQL
import { ApolloServer } from 'apollo-server-express'
// middleware to allow cross-origin requests
import cors from 'cors'
// routing engine
import express from 'express'
// Keep GraphQL stuff nicely factored
import glue from 'schemaglue'
import http from 'http'
// GraphQL schema compilation
import { makeExecutableSchema } from 'graphql-tools'
import path from 'path'

// load .env into process.env.*
require('dotenv').config()

const options = {
  mode: 'js', // default
  // ignore: '**/somefileyoudonotwant.js'
}
const schemaPath = path.join(
  '.',
  `${__dirname}`.replace(process.cwd(), ''),
  'graphql/'
)
const glueRes = glue(schemaPath, options)

// Compile schema
export const schema = makeExecutableSchema({
  typeDefs: glueRes.schema,
  resolvers: glueRes.resolver,
})

//
// Server setup
//
// Our service identity
const SELF = pkg.name

// HTTP port
const PORT = process.env.PORT | 8050

// HOSTNAME for subscriptions etc.
const HOSTNAME = process.env.HOSTNAME || 'localhost'

// External DNS name for service
const PUBLICNAME = process.env.PUBLICNAME || 'localhost'

const app = express()

//
// CORS
//
const corsOptions = {
  origin: `http://${PUBLICNAME}:${PORT}`,
  credentials: true, // <-- REQUIRED backend setting
}

app.use(cors(corsOptions)) // enable all CORS requests
app.options('*', cors()) // enable pre-flight for all routes

app.get('/', (req, res) => {
  res.send(`${SELF}\n`)
})

const initServer = async (options) => {
  const server = new ApolloServer({
    schema,
  })

  server.applyMiddleware({
    app,
  })

  const httpServer = http.createServer(app)

  httpServer.listen({ port: PORT }, async () => {
    log(SELF).info(
      `listening on ${print.external(`http://${HOSTNAME}:${PORT}/graphql`)}`
    )
  })
}

export default initServer
