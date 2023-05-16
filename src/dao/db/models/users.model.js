import mongoose from "mongoose";

const usersCollection = 'users';

const usersSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: {
        type: String,
        unique: true
    },
    role: {
        type: String,
        default: 'user'
    },
    password: String,
    age: Number,
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },
    documents: {
        type:[
            {
                name: String,
                reference: String
            }
            ],
        default: []
    },
    last_connection: Date
});

const usersModel = mongoose.model(usersCollection, usersSchema);

export default usersModel;