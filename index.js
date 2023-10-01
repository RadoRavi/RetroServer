const express = require('express')
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const app = express()

const privateKey = fs.readFileSync('selfsigned.key', 'utf8');
const certificate = fs.readFileSync('selfsigned.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const httpsserver = https.createServer(credentials,app)


httpsserver.listen(8080,()=>{
  console.log("listening to port 8080")
})
const wss = new WebSocket.Server({server:httpsserver})

wss.on('connection', function connection(ws) {
  console.log("dfdfdfdfd")
  ws.on('error', console.error);

  ws.on('message', function message(data) {
    const messageData = data.toString()
    console.log(messageData)
    if(messageData==="create_group"){
      const groupId=Math.floor(Math.random()*1000)+1000
      const pin = Math.floor(Math.random()*1000)+1000
      const res = {groupId,pin}
      console.log(res)
      ws.send(JSON.stringify(res))

    }
  });

  ws.send('something');
});
