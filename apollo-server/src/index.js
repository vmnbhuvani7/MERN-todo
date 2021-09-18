import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import mongoose from 'mongoose';
import formData from 'express-form-data'
import os from 'os'
import schema from './schema';
import resolvers from './resolvers';
import schemaDirectives from './directives';
import models, { connectDb } from './models';
import insertPredefinedData from './fixture';

let app = express();
app.use(cors());

app.use(express.json({ limit: '5024mb', extended: true }))
app.use(express.urlencoded({ limit: '5024mb', extended: true }))

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true
};

// parse data with connect-multiparty. 
app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream 
app.use(formData.stream());
// union the body and the files
app.use(formData.union());

app.get('/assets/:imgName', function (req, res) {
  res.sendFile(`${process.env.ASSETS_STORAGE}/${req.params.imgName}`);
});

let ObjectId = mongoose.Types.ObjectId

ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const getMe = async req => {
  const token = req.headers['token'];
  if (token) {
    try {
      const me = await jwt.verify(token, process.env.SECRET);
      return await models.User.findById(me.id).exec()
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

const server = new ApolloServer({
  introspection: true,
  typeDefs: schema,
  resolvers,
  schemaDirectives,
  formatError: error => {
    const message = error.message
      .replace('GraphQL error: ', '')
      .replace('Unexpected error value: ', '')
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return { ...error, message };
  },
  formatResponse: response => {
    return response;
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models
      };
    }

    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 8000;

connectDb().then(async () => {
  await insertPredefinedData(models);

  httpServer.listen({ port }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`);
  });
});
