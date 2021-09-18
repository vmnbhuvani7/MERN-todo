import mongoose from 'mongoose';
import User from './user';

const connectDb = () => {
  if (process.env.DATABASE_URL) {
    return mongoose.connect(
      process.env.DATABASE_URL,
      { useNewUrlParser: true },
    );
  }
};

const models = {
  User,
}

export { connectDb };
export default models;
