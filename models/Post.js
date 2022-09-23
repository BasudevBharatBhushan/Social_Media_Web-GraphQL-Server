const {model , Schema} = require('mongoose');

const postSchema = new Schema({
    body:String,
    username:String,
    createdAt:String,
    comments:[
        {
            body: String,
            username:String,
            createdAt:String
        }
    ],
    likes:[
        {
            username:String,
            createdAt:String
        }
    ],
    user: {
        type:Schema.Types.ObjectId,   //refered to userschema
        ref:'users'
    }
});

module.exports = model('Post' , postSchema);