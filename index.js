const express = require('express')
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const jsonData = require('./data.json');

const app = express()

const privateKey = fs.readFileSync('selfsigned.key', 'utf8');
const certificate = fs.readFileSync('selfsigned.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const httpsserver = https.createServer(credentials,app)


httpsserver.listen(8000,()=>{
  console.log("listening to port 8000")
})

const ids = new Map()

const wss = new WebSocket.Server({server:httpsserver})

function authGroup(data,id,pin){
  const groupList = `${data}`.split(",")
  for (let index = 0; index < groupList.length; index++) {
    const element = groupList[index];
    const [eleId,elePin] = element.split(":")
    if(eleId===id&&elePin===pin){
      return true
    }
    
  }
  return false
  
}
wss.broadcast = function(data) {
  wss.clients.forEach(client => client.send(data));
};

wss.on('connection', function connection(ws) {
  console.log("dfdfdfdfd")
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const messageData = JSON.parse(data)

    
    console.log(messageData.message)
    if(messageData.message==="create_group"){
      const groupId=Math.floor(Math.random()*1000)+1000
      const pin = Math.floor(Math.random()*1000)+1000
      const res = {groupId,pin}
      const data = `${groupId}:${pin},`
      fs.appendFile("groups.txt", data, (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
      });
      ids.set(groupId,pin)
      console.log(res)
      ws.send(JSON.stringify(res))

    }else if(messageData.message==="join_group"){
      console.log("reached here")
      const {id,pin} = messageData
      console.log("reached here",id,pin)
      fs.readFile("groups.txt", "utf-8", (err, data) => {
        if (err) { console.log(err) }
        if(authGroup(data,id,pin)){
          ws.id=id
          ws.send('connection success')
        }

        
    })
    
      
        ws.send("join")
      
    }
    else if(messageData.message==="delete_group"){
      ids.delete(messageData.id)

    }
    else if(messageData.message==="getResponse"){
      jsonData.forEach(data=>{
        
        if(data.id==ws.id){
            const res = JSON.stringify(data.childs)
            console.log(res)
            ws.send(res)
            return
        }
      })
    }
  });


  ws.send('something');
});
