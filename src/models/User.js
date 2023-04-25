const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    phone_number: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    credentials: {
        amazon: {
            refresh_token: {
                type: String,
                default: ''
            },
            access_token: {
                type: String,
                default: ''
            },
        },
        google: {
            refresh_token: {
                type: String,
                default: ''
            },
            access_token: {
                type: String,
                default: ''
            },
        },
        facebook: {
            refresh_token: {
                type: String,
                default: ''
            },
            access_token: {
                type: String,
                default: ''
            },
        }
    }
})

module.exports = User = mongoose.model('User', UserSchema)