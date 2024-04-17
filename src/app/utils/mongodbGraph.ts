// utils/database.ts
import mongoose, { Connection } from 'mongoose';

// Define custom connection options type
interface CustomConnectionOptions {
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
  // Add any other options you may need
}

// Define the type for the Mongoose connection
interface DatabaseConnection extends Connection {}

// Set up Mongoose connection with custom options
const connectionOptions: CustomConnectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect('mongodb://localhost:27017/mydatabase', connectionOptions as mongoose.ConnectOptions);
const db: DatabaseConnection = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

export default mongoose as typeof mongoose & DatabaseConnection;
