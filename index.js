const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');

require("dotenv").config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json())
// db--------YQijA6Vk0oJAEUD9

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jlvlb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{

        await client.connect();
        const productCOllection = client.db("bmoto_parts").collection("products");
        const orderCOllection = client.db("bmoto_parts").collection("orders");
        const userCollection = client.db("bmoto_parts").collection("users");
        const reviewCollection = client.db("bmoto_parts").collection("review");
        app.get('/products',async (req,res)=>{
            const query = {};
            const cursor = productCOllection.find(query)
            const products = await cursor.toArray()
            res.send(products)
        })

        app.get('/reviews',async (req,res)=>{
            const query = {};
            const cursor = reviewCollection.find(query)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        app.get('/product/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCOllection.findOne(query);
            res.send(result)
        })

        app.get('/orders',async(req,res)=>{
            const orderEmail = req.query.orderEmail;
            
            const query = {orderEmail: orderEmail};
            const orders = await orderCOllection.find(query).toArray()
            res.send(orders)
            
        })

        app.get('/users',async(req,res)=>{
            const users = await  userCollection.find().toArray();
            res.send(users)
        })

        app.get('/user',async(req,res)=>{
            const email = req.query.email;
            
            const query = {email:email};
            const user = await userCollection.find(query).toArray()
            res.send(user)
            
        })
        app.put('/user/admin/:email',async (req,res)=>{
            const email = req.params.email;
            const reqEmail=req.body.email;
            console.log(email,reqEmail.email)
         
            const filter = {email: email};
            const reqAccount = await userCollection.findOne({email:reqEmail})
            console.log(reqAccount.role)
            if(reqAccount.role=='admin'){
                console.log('admin')
                const updateDoc={
                    $set: {role:'admin'}
            };
            const result = await userCollection.updateOne(filter,updateDoc);
             
            res.send(result)
           
                    
            }
            else{
                res.send({message:'no access'})
            }
          
          

        })
        //--------update user profile------------------------
        app.put('/user/:email',async (req,res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = { upsert:true};
            const updateDoc={
                $set: user,
                    
            }
            console.log(email)
             const result = await userCollection.updateOne(filter,updateDoc,options);
             
             res.send(result)

        })

        app.get('/admin/:email', async(req,res)=>{
            const email=req.params.email;
            const user = await userCollection.findOne({email:email});
            const isAdmin = user?.role ==='admin';
            res.send({admin: isAdmin})
        })

        app.post('/order', async(req,res)=>{
            const order = req.body;
            console.log(order)
        
            
            const result =await orderCOllection.insertOne(order);
            res.send({success:true,result});
        })

        app.post('/product',async(req,res)=>{
            const product = req.body;
            console.log(product)
            const result = await productCOllection.insertOne(product);
            res.send(result)
        })
        app.post('/review',async(req,res)=>{
            const review = req.body;
            console.log(review)
            const result = await reviewCollection.insertOne(review);
            res.send(result)
        })

        app.delete('/order/:id', async(req,res) =>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)}
            console.log(query)
             const result = await orderCOllection.deleteOne(query);
             res.send(result)
        })
       
    }

    finally{

    }
}

run().catch(console.dir);
app.get('/',(req,res)=>{
    res.send('running my bmoto-parts server')
})
app.listen(port ,()=>{
    console.log('listening to my new port')
})