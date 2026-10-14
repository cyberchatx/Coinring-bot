const express = require('express');
const app = express();
let lastQR = null;
let err = null;
let log = "Starte...";

app.get('/', (req,res)=>{
  if(err) return res.send(`<h1>FEHLER:</h1><pre>${err}</pre><p>Log: ${log}</p><a href="/">Reload</a>`);
  if(!lastQR) return res.send(`<h1>${log}</h1><p>Bitte 30 Sek warten</p><a href="/"><b>RELOAD KLICKEN</b></a><br><br>Err: ${err}`);
  if(lastQR==='READY') return res.send('<h1>✅ VERBUNDEN!</h1>');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(lastQR)}`;
  res.send(`<h1>JETZT SCANNEN</h1><img src="${url}" style="width:350px;height:350px" /><br><a href="/">Reload</a>`);
});

async function start(){
  try{
    log = "Lösche alte Session...";
    const fs = require('fs');
    if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
    
    log = "Lade Baileys...";
    const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
    
    log = "Erstelle Auth...";
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    
    log = "Starte WhatsApp Verbindung... QR kommt in 5 Sek";
    const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ["Coinring","Chrome","1.0"] });
    
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u=>{
      log = "Update: "+JSON.stringify(u);
      console.log(log);
      if(u.qr) lastQR = u.qr;
      if(u.connection==='open') lastQR='READY';
    });
  }catch(e){
    err = e.message + "\n" + e.stack;
    log = "FEHLER beim Start";
    console.log(err);
  }
}
app.listen(process.env.PORT||3000, ()=>{ console.log('Server läuft'); start(); });
