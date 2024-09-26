const mongoose=require('mongoose')

const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    Id:{
        type:String,
        required:true,
    },
    pts:{
        type:Number,
    }
})

const user=mongoose.model('discord',UserSchema)

module.exports=user