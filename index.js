const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;


//midleware
app.use(cors());
app.use(express.json());

// username:online_tutor_db
// password:dqaSlmWxT9ovnwYI



const uri = `mongodb+srv://Online_tutor_db:r85fdfEbv94DF1GV@cluster0.x7jh2zf.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log('successfully connected');

/* const verifytoken = (req, res, next) => {
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
        idToken = req.headers.authorization.split('bearer ')[1];
    }
    next();
} */



async function run() {
    try {
        await client.connect();
        console.log('connected successfully');
        const database = client.db("Online_tutor");
        const eventscollection = database.collection("Bikes-info");
        const bookingcollection = database.collection("Bike-Booking");
        const studentCollection = database.collection("Student");
        const rattingCollection = database.collection("ratting");

        app.get('/events', async (req, res) => {
            console.log('events is hitted');
            const cursor = eventscollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })



        app.get('/manageEvent', async (req, res) => {
            console.log('hello');
            console.log(req.headers.authorization);
            const cursor = bookingcollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/event/:id', async (req, res) => {
            const eventid = req.params.id;
            //console.log('get hit by id = ', eventid);
            const cursor = eventscollection.find({ _id: ObjectId(eventid) });
            const result = await cursor.toArray();
            //console.log('the result is = ', result);
            res.send(result);
        })

        app.post('/booking', async (req, res) => {
            // const booking = req.body;
            const doc = {
                name:"Zillur",
                Dep:database.eventscollection.createIndex( { "Dep": "CSE" }, { unique: true } )
            }
            database.eventscollection.createIndex( { "Dep": 1 }, { unique: true } )
            //console.log('post method is hitted', booking);
            const result = await bookingcollection.insertOne(doc);
            console.log(result);
            res.json(result);
        })

        app.post('/addevent', async (req, res) => {
            const newevent = req.body;
            console.log('post method is hitted', newevent);
            const result = await eventscollection.insertOne(newevent);
            //console.log(result);
            res.json(result);
        })



        app.post('/myevents', async (req, res) => {
            const email = req.body;
            // console.log('post method is hitted email', email);
            const query = { email: { $in: [email.email] } }
            const result = await bookingcollection.find(query).toArray();
            res.json(result);
        })


        app.delete('/deleteevent/:id', async (req, res) => {
            const id = req.params.id;
            console.log('delete is hitted by ', id);
            const query = { _id: ObjectId(id) };
            const result = await bookingcollection.deleteOne(query);
            res.json(result);
        })

        app.delete('/deletebike/:id', async (req, res) => {
            const id = req.params.id;
            console.log('delete is hitted by ', id);
            const query = { _id: ObjectId(id) };
            const result = await eventscollection.deleteOne(query);
            res.json(result);
        })


        app.put('/manageEvent/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            console.log('updating user', user, ' and id = ', id);
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: user.status
                },
            };
            const result = await bookingcollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if (requester) {
                const requesterAccount = await studentCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await studentCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'you do not have access to make admin' })
            }

        })


        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await studentCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.put('/users/makeadmin', async (req, res) => {
            const user = req.body;
            console.log('from server', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await studentCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await studentCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });



        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await studentCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.post('/user/ratting', async (req, res) => {
            const newevent = req.body;
            console.log('post method is hitted', newevent);
            const result = await rattingCollection.insertOne(newevent);
            //console.log(result);
            res.json(result);
        })

        app.get('/user/ratting', async (req, res) => {
            const cursor = rattingCollection.find({});
            const result = await cursor.toArray();
            res.json(result);
        })

        // online tutor code start from here

        app.post('/students', async (req, res) => {
            const student = req.body;
            // const doc = {
            //     name:"Zillur",
            //     Dep:"CSE"
            // }
            // database.eventscollection.createIndex( { "Dep": 1 }, { unique: true } )
            //console.log('post method is hitted', booking);
            const result = await studentCollection.insertOne(student);
            // console.log(result);
            res.json(result);
        })

         app.get('/studentlogin', async (req, res) => {
            const email= req.query.email;
            const password = req.query.password;
            console.log("my emaiol is",email);
            // const email = req.params.email;
            const query = { email: email };
            // const query = { email: "zillury@gmail.com" };
            // const password = student.password;
            const user = await studentCollection.findOne(query);
            // res.json(user)
           
            if (user?.password === password) {
                res.status(200).json({ data: user});
               
            }
            else{
                res.status(200).json({ data: []});
            }
            
        })

    } finally {
        //await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    console.log('Assignment server is runing');
    res.send('assignment server is hitted');

})

app.listen(port, () => {
    console.log('Assignment server is running port = ', port);
})