
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.by2cb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();


        const database = client.db('moviesDB');
        const movieCollection = database.collection('movies')

        app.post('/movies', async (req, res) => {
            const movie = req.body;
            const result = await movieCollection.insertOne(movie);
            res.send(result)

        })

        app.get('/movies', async (req, res) => {
            const limit = parseInt(req.query.limit) || 0;
            const cursor = movieCollection.find().sort({ rating: -1 }).limit(limit);
            const result = await cursor.toArray();
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Movie server is running')
})

app.listen(port, () => {
    console.log(`Movie server is running on port: ${port}`)
})