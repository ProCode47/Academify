const xlsx = require('xlsx');
const { MongoClient } = require('mongodb');
const config = require("./config/config");

// MongoDB connection setup
const uri = config.URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

client.connect(err => {
  if (err) {
    console.error('Failed to connect to MongoDB:', err);
    return;
  }
  console.log('Connected to MongoDB');
  db = client.db();
});

// Function to handle file upload and insertion into MongoDB
exports.uploadResult = (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Parse Excel file
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);

  // Insert data into MongoDB
  const collection = db.collection('results'); 
  collection.insertMany(data, (err, result) => {
    if (err) {
      console.error('Error inserting data into MongoDB:', err);
      return res.status(500).send('Error inserting data into MongoDB.');
    }
    console.log('Data inserted successfully:', result.insertedCount, 'records inserted.');
    res.status(200).send('Data inserted successfully.');
  });
};




