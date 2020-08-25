// import statements
const sls = require('serverless-http')
const express = require('express')
const app = express()
const AWS = require('aws-sdk')
const bodyparser = require('body-parser')
const asyncHandler = require('express-async-handler')
const createError = require('http-errors')
const mongoose = require('mongoose')

// Middleware

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))

//Connecting to DB
const MongoDBURL = 'mongodb+srv://LitoPapi:Dtgfu1314@cluster0.9pdz4.mongodb.net/customers?retryWrites=true&w=majority'
mongoose.connect(MongoDBURL)

//Schemas

const MessageSchema = new mongoose.Schema({
    message: { 
        type: String,
        required:true
    }
})

const CustomerSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: true
    },
    lastName : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    messages: [MessageSchema]
})

//Models
const Custumer = mongoose.model('Customer', CustomerSchema)
const message = mongoose.model('Message', MessageSchema)

//Routes
const router = express.Router()

// Create a document
router.post('/', asyncHandler(async(req,res,next) => {
    const NewCustomers = await Custumer.create(req.body)
    res.send(NewCustomers)
}))

// Get Collection
router.get('/', asyncHandler(async(req,res,next) => {
    const Customers = await Custumer.find()
    res.status(200).send(Customers)
}))

// Get a Single Document
router.get('/:id', asyncHandler(async(req,res,next) => {
    const { id } = req.params
    const Single_Customer = await Custumer.findById(id)

    if(!Single_Customer || Object.keys(Single_Customer).length === 0){
        throw createError(404, `A customer with the id of id = ${id} does not exist`)
    } else {
        res.status(200).send(Single_Customer)
    }
    
}))

// Update a Document
router.put('/', asyncHandler(async(req,res,next) => {
    const {_id} = req.body
    const customer = await Custumer.findByIdAndUpdate(
        {_id:_id},
        {$set: req.body},
        {new : true}
    )

    res.status(200).send(customer)
}))

// Delete a Document
router.delete('/:id', asyncHandler(async(req,res,next) => {
    const {id}  = req.params
    await Custumer.remove({id:id})
    res.status(200).send("Deleted Customer " + id)
}))

//send SMS
router.post('/send/:id', async(req,res,next) => {
    
})


app.use('/customers', router)


// Errors

app.use((req,res,next) => {
    next(createError(404))
})

app.use((error, req,res,next) => {
    res.status(error.status || 500)

    res.json({
        'message': error.message,
        'status': error.status
    })
})

module.exports.run = sls(app)


