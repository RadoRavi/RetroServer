const express = require('express')
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const jsonData = require('./data.json');
const mongoose = require("mongoose");
const Group = require("./Schema");
const { FindCursor } = require('mongodb');


const app = express()

const privateKey = fs.readFileSync('selfsigned.key', 'utf8');
const certificate = fs.readFileSync('selfsigned.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };


app.get('/', (req, res) => {
  res.send('Hello World!')
})

mongoose.connect("mongodb+srv://vidhu:vidhu1999@cluster0.yfohxrx.mongodb.net/?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  httpsserver.listen(8000, () => console.log(`SERVER PORT 8000`))

}).catch((error) => console.log(`${error} this is the error`))

const httpsserver = https.createServer(credentials, app)




const ids = new Map()

const wss = new WebSocket.Server({ server: httpsserver })







wss.on('connection', function connection(ws) {
  console.log("dfdfdfdfd")
  ws.on('error', console.error);

  ws.on('message', async function message(data) {
    const messageData = JSON.parse(data)

wss.broadcast = function (id, message, data) {
  wss.clients.forEach(client => {
    if(client.id===id){
    console.log("client id",client.id)
    client.send(JSON.stringify({ message, data }))
    }
  });
};
    console.log(messageData.message)
    if (messageData.message === "create_group") {
      const groupId = Math.floor(Math.random() * 1000) + 1000
      const pin = Math.floor(Math.random() * 1000) + 1000

      const data = `${groupId}:${pin},`
      fs.appendFile("groups.txt", data, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      });
      ids.set(groupId, pin)
      //
      const GroupInp = new Group({
        groupId,
        pin,
        wentWell: [],
        didntWentWell: [],
        improve: [],
        stop: [],
      })
      const { _id } = await GroupInp.save()
      const res = { groupId, pin, id: _id }
      console.log(res)
      ws.send(JSON.stringify(res))

    } else if (messageData.message === "join_group") {
      console.log("reached here")
      const { id, pin } = messageData
      console.log("pin")
      const groupDAET = await Group.find({ groupId: id })
      console.log("groupDAET",groupDAET)
      groupDAET.forEach(data => {
        console.log("data",data)
        if (data.pin == pin) {
          console.log("hi")
          ws.id = data.groupId
          const resJoin = {
            message: "connection success",
            data
          }
          ws.send(JSON.stringify(resJoin))
          return
        }

      })
    }
    else if (messageData.message === "delete_group") {
      ids.delete(messageData.id)

    }
    else if (messageData.message === "hi") {
      const groupList = await Group.find({ groupId: ws.id })
      const group = groupList[0]
      const section = messageData.id
      // console.log("section",section)
      // console.log("broadcast",group)
      var sec = group[section]
      sec.push({ "text": messageData.typo, "vote": 0, "id": messageData.randomKey })
      const updateRes = await group.save()
      const allFeedback = await Group.find({ groupId: ws.id })

      console.log("broadcast", updateRes)
      wss.broadcast(ws.id, "hi", JSON.stringify(allFeedback))

    } else if (messageData.message === "delete") {
      const groupList = await Group.find({ groupId: ws.id })
      console.log("f", groupList)
      const groupDelete = groupList[0]
      const sectionDelete = messageData.id
      console.log("before", groupDelete[sectionDelete])
      groupDelete[sectionDelete] = groupDelete[sectionDelete].filter(ele => ele.id != messageData.randomKeu)


      const deleteUpdate = await groupDelete.save()
      console.log("after", groupDelete[sectionDelete])
      console.log("dfdfd", deleteUpdate)
      const allFeedbacks = await Group.find({ groupId: ws.id })
      wss.broadcast(ws.id, "hi", JSON.stringify(allFeedbacks))
    }
    else if (messageData.message === "getResponse") {
      const allFeedback = await Group.find({ groupId: ws.id })
      console.log("Ffffffffffff", allFeedback)

    }
    else if (messageData.message === "run") {
      wss.broadcast(ws.id, "run", JSON.stringify({"message":messageData.message,"time":messageData.time}));

    }
    else if (messageData.message === "rerun") {
      wss.broadcast(ws.id, "rerun", JSON.stringify({"message":messageData.message,"time":messageData.time}));

    } else if (messageData.message === "update") {
      try {
        const list = await Group.find({groupId:ws.id})
        const item = list[0]
        const sectionUpdate = messageData.id;
        const commentId = messageData.id2;
        item[sectionUpdate]=item[sectionUpdate].map(ele=>{
          if(ele.id==commentId){
            ele.text=messageData.typo
          }
          return ele
        })
        
        const options = {
          new: true
        };
    
        const updatedDocument = await item.save({ new: true });
        if (updatedDocument) {
          console.log("Updated document:", updatedDocument);
        } else {
          console.log("Document not found or not updated.");
        }
    
        const allFeedbacksAfterUpdate = await Group.find({ groupId: ws.id });
        console.log("Full mongo:", allFeedbacksAfterUpdate);
    
        wss.broadcast(ws.id, "hi", JSON.stringify([allFeedbacksAfterUpdate]));
      } catch (error) {
        console.error("Error:", error);
      }
    }
    
    
  });


  ws.send('something');
});
