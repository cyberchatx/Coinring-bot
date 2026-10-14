const express = require('express');
const app = express();
let lastQR = null;

app.get('/', (req,res)=>{
  if(!lastQR) return res.send('<h1 style="font-family:sans-serif">Bot startet... bitte 40 Sek warten dann hier klicken:<br><br><a href="/">RELOAD KLICKEN</a></h1>');
  if(lastQR==='READY') return res.send('<h1>✅ VERBUNDEN! Bot lauft!</h1>');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(lastQR)}`;
  res.send(`<h1>JETZT SCANNEN mit 41798339387</h1><img src="${url}" style="width:350px;height:350px;border:10px solid black" /><br><br><h2>WhatsApp > Verknüpfte Geräte > Gerät verknüpfen</h2><br><a href="/">Neu laden wenn abgelaufen</a>`);
});

async function startBot(){
  const fs = require('fs');
  // Alte kaputte Session löschen
  if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
  
  const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ 
    auth: state, 
    printQRInTerminal: true,
    browser: ["Coinring","Chrome","10.0"]
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    console.log('STATUS:', u);
    if(u.qr){ lastQR = u.qr; console.log('QR DA: '+u.qr.substring(0,20)); }
    if(u.connection==='open'){ lastQR='READY'; console.log('VERBUNDEN!'); }
    if(u.connection==='close'){ lastQR=null; setTimeout(startBot,3000); }
  });
}

app.listen(process.env.PORT||3000, ()=>{ console.log('Server OK'); startBot(); });
