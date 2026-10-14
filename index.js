const express = require('express');
const app = express();
let lastQR = null;

app.get('/', (req,res)=>{
  if(!lastQR) return res.send('<meta http-equiv="refresh" content="5"><h1>Bot startet... 10 Sek warten</h1>Auto Reload in 5 Sek...');
  if(lastQR==='READY') return res.send('<h1>✅ VERBUNDEN! Bot lauft!</h1>');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(lastQR)}`;
  res.send(`<h1 style="font-family:sans-serif">SCANNE JETZT - 15 SEK ZYT!</h1><img src="${url}" style="width:90%;max-width:400px;border:15px solid black" /><br><br><h2>Neuer QR in 20 Sek: <a href="/">HIER KLICKEN</a></h2><script>setTimeout(()=>location.reload(),20000)</script>`);
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
    if(u.connection==='close'){ lastQR=null; setTimeout(start,3000); }
  });
}
app.listen(process.env.PORT||3000, ()=>{ console.log('Server'); start(); });
