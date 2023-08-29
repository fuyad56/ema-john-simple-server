const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

require("dotenv").config();

app.get("/", (req, res) => {
  res.send("hello world");
});

// Mongo db
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://emaJohn:5ndrms4M2JC6y4i9@cluster0.odt7wqf.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

async function run() {
  await client.connect();
  console.log("Connected to MongoDB");

  const productsCollection = client.db("emaJohnStore").collection("products");

  // DB Post
  app.post("/addProducts", async (req, res) => {
    const productsToAdd = req.body;

    await productsCollection.insertOne(productsToAdd).then(result => {
      console.log(result.insertedCount);
    });
  });

  // DB Get
  app.get("/products", async (req, res) => {
    const documents = await productsCollection.find({}).toArray();
    res.send(documents);
  });

  app.get("/product/:key", async (req, res) => {
    const documents = await productsCollection
      .find({ key: req.params.key })
      .toArray();
    res.send(documents[0]);
  });

  app.post("/productsByKeys", async (req, res) => {
    const productKeys = req.body;
    console.log("Received product keys:", productKeys); // Debugging log

    await productsCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        if (err) {
          console.error("Error fetching products:", err);
          res.status(500).json({ error: "Internal server error" });
        } else {
          console.log("Fetched products:", documents); // Debugging log
          res.send(documents);
        }
      });
  });
}

run().catch(console.dir);

app.listen(5000);
