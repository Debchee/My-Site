const mongoose = require('mongoose');
const {Schema} = mongoose;

const postSchema = new Schema({
    title : {
        type: String
    },
    content: {
        type: String
    },
    mediaType: {
        type: String
    },
    mediaFile:{
        type:String
    },
    author:{
        type: Schema.Types.ObjectId,
        ref:"user"
    },

    comments:[{
        type: Schema.Types.ObjectId,
        ref:'comment'
    }]
},
    {timeStamps: true});

    const Post= mongoose.model('post', postSchema);
    module.exports = Post;