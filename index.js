const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()

const port = process.env.PORT || 9000
const app = express()




app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.SOLO_USER}:${process.env.SOLO_PASS}@cluster0.4lxln.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    const db = client.db('solo-db')
    const jobsCollection = db.collection('jobs')
    const bidsCollection = db.collection('bids')



    // ------------ job data ----------------
    // save a jobData in bd
app.post('/add-job', async(req,res)=>{
  const jobData = req.body;
  const result = await jobsCollection.insertOne(jobData)
  res.send(jobData)
})

//get all jobs data form db

app.get('/jobs', async(req, res)=>{
  const result = await jobsCollection.find().toArray()
  res.send(result)
})

// load data of specific user
app.get('/jobs/:email', async(req,res)=>{
  const email = req.params.email;
  const query = {'buyer.email': email}
  const result = await jobsCollection.find(query).toArray()
  res.send(result)

})


// delete job
app.delete('/job/:id', async(req, res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await jobsCollection.deleteOne(query)
  res.send(result)
})


//
app.get('/job/:id', async(req, res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await jobsCollection.findOne(query)
  res.send(result)
})


//update job
app.put('/update-job/:id', async(req,res)=>{
  const id = req.params.id;
  const jobData = req.body;
  const updated = {
    $set:jobData,
  }
const query = {_id: new ObjectId(id)}
  const options = {upsert: true}
  const result = await jobsCollection.updateOne(query, updated, options)
  res.send(jobData)
})
// ------------ bids data ----------------
// save a bid data in db
app.post('/add-bid', async(req,res)=>{
 //0. check if the job is already bid by the user
 const bidData = req.body;
 const query = {
  email : bidData.email, 
  jobId : bidData.jobId
 }
 const alreadyExist = await bidsCollection.findOne(query)
 if(alreadyExist){
  return res
  .status(400)
  .send({message: 'You have already bid for this job'})
 }

  //1. save data in bids collection
  
  const result = await bidsCollection.insertOne(bidData)
  //2. update the job collection
  const filter = {_id: new ObjectId(bidData.jobId)}
  const update = {
   $inc:{
    bid_count:1
   },
  }
  const updateBidCount = await jobsCollection.updateOne(filter, update)

  res.send(bidData)
})

    // get all bids data for a specific user
    app.get('/bids/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {email:email}
      const result = await bidsCollection.find(query).toArray()
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from SoloSphere Server....')
})

app.listen(port, () => console.log(`Server running on port ${port}`))
