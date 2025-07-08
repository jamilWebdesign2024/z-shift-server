// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1gwegko.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const parcelCollection = client.db("zshift").collection("parcels");


    // Get all parcels
    app.get('/parcels', async (req, res) => {
      const parcels = await parcelCollection.find().toArray();
      res.send(parcels);
    });


    // parcels api
    // app.get('/parcels', async (req, res) => {
    //   const email = req.query.email;

    //   // If email is given, filter by 'created_by', else get all
    //   const query = email ? { created_by: email } : {};

    //   // Sort by latest creation_date (descending)
    //   const sort = { creation_date: -1 };

    //   try {
    //     const parcels = await parcelCollection.find(query).sort(sort).toArray();
    //     res.send(parcels);
    //   } catch (error) {
    //     console.error('Error fetching parcels:', error);
    //     res.status(500).send({ success: false, message: 'Failed to fetch parcels' });
    //   }
    // });
    app.get('/parcels', async (req, res) => {
      const userEmail = req.query.email;
      const query = userEmail ? { created_by: userEmail } : {};
      const options = { sort: { creation_date: -1 } };

      try {
        const parcels = await parcelCollection.find(query, options).toArray();
        res.send(parcels);
      } catch (error) {
        console.error('Error fetching parcels:', error);
        res.status(500).send({ success: false, message: 'Failed to fetch parcels' });
      }
    });




    // Sample route to insert parcel
    app.post('/parcels', async (req, res) => {
      const newParcel = req.body;
      const result = await parcelCollection.insertOne(newParcel);
      res.send({ success: true, insertedId: result.insertedId });
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("Parcel Server is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});