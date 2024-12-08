
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


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
        const subscriberCollection = database.collection('subscribers')
        const favoriteMovieCollection = database.collection('favoriteMovie')

        app.post('/movies', async (req, res) => {
            const movie = req.body;
            const result = await movieCollection.insertOne(movie);
            res.send(result)

        })
        app.post('/subscribers', async (req, res) => {
            const subscriber = req.body;
            const result = await subscriberCollection.insertOne(subscriber);
            res.send(result)
        })

        app.post('/favoriteMovies', async (req, res) => {
            const { email, movie } = req.body;
            const existingMovie = await favoriteMovieCollection.findOne({ email, movie });

            if (existingMovie) {
                return res.status(409).send({ message: 'Movie already added as favorite' });
            }
            const result = await favoriteMovieCollection.insertOne({ email, movie });
            res.send(result);
        });


        app.get('/favoriteMovies', async (req, res) => {
            const cursor = favoriteMovieCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/favoriteMovies/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const favMovies = await favoriteMovieCollection.find(query).toArray();
            res.send(favMovies)
        })

        app.delete('/favoriteMovies/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId (id) }
            const result = await favoriteMovieCollection.deleteOne(query);
            res.send(result)
          })
      
          app.put('/updateMovie/:id',async(req,res)=>{
            const id = req.params.id;
            const movies= req.body;
            const filter = {_id: new ObjectId(id)}
            const options= {upsert:true}
            const updatedMovie={
                $set:{
                    poster:movies.poster,
                    title:movies.title,
                    genre:movies.genre,
                    duration:movies.duration,
                    releaseYear:movies.duration,
                    rating:movies.rating,
                    summary:movies.summary
                }
            }
            const result = await movieCollection.updateOne(filter, updatedMovie, options);
            res.send(result)
          })

        app.get('/subscribers', async (req, res) => {
            const cursor = subscriberCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/movies', async (req, res) => {
            const limit = parseInt(req.query.limit) || 0;
            const cursor = movieCollection.find().sort({ rating: -1 }).limit(limit);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/movies/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const movie = await movieCollection.findOne(query);
            res.send(movie)
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