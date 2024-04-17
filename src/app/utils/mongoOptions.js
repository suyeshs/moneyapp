const { MongoClient } = require('mongodb');
const { paytmSocketStore } = require('../../stores/PaytmSocketStore');

// Function to dump data into MongoDB time series collection
async function dumpDataToMongoDB() {
  const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB server');

    // Specify the database and collection
    const database = client.db('tradepod');
    const collection = database.collection('optionChainDaily');

    // Retrieve data from the PaytmSocketStore
    const data = paytmSocketStore.data;

    // Insert the data into the collection
    const result = await collection.insertMany(data);
    console.log(`${result.insertedCount} documents inserted into MongoDB`);

  } catch (error) {
    console.error('Error dumping data to MongoDB:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('Disconnected from MongoDB server');
  }
}

// Call the function to dump data into MongoDB
dumpDataToMongoDB();