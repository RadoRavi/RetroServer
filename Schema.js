const  mongoose = require("mongoose");

const group = new mongoose.Schema({
      groupId: {
        type: String,
        requied: true,
      },
      pin: {
        type: String,
        requied: true,
      },
      wentwell: {
        type: Array,
        default:[]
      },
      didntwentwell: {
        type: Array,
        default:[]
      },
      improve: {
        type: Array,
        default:[]
      },
      stop: {
        type: Array,
        default:[]
      },

},{timestamps:true})

const Group =  mongoose.model("Group",group)
module.exports = Group;