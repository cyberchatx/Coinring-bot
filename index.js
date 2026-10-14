const express = require('express');
const app = express();
let lastQR = null;

app.get('/', (req,res)=>{
  if(!lastQR) return res.send('<meta http-equiv="refresh" content="3"><h1>Bot startet... 10 Sek warten</h1>Auto Reload...');
  if(lastQR==='READY') return res.send('<h1>✅ VERBUNDEN! Bot lauft! Chasch zue mache.</h1>');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(lastQR)}`;
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:20px">
    <h1>Du hesch 1 MINUTE zum Scannen!</h1>
    <img src="${url}" style="width:90%;max-width:500px;border:15px solid black" />
    <h2>QR lauft ab in 60 Sekunde - denn automatisch NEU</h2>
    <p>Wenn abgloffe: <a href="/" style="font-size:30px">HIER KLICKEN für neue QR</a></p>
    </div>
    <script>setTimeout(()=>location.reload(),60000)</script>
  `);
});

async function start(){
  const fs=require('fs');
  if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
  const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ["Coinring","Chrome","1"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    console.log(u);
    if(u.qr) lastQR=u.qr;
    if(u.connection==='open') lastQR='READY';
    if(u.connection==='close'){ 
        console.log('Close, neu starte in 3 Sek');
        lastQR=null; 
        setTimeout(start,3000); 
    }
  });
}
app.listen(process.env.PORT||3000, ()=>{ console.log('Server uf 1 Minute gstellt'); start(); });
