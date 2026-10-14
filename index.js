const express = require('express');
const app = express();
let lastQR = null;
let myCode = null;

app.get('/', (req,res)=>{
  if(lastQR==='READY') return res.send('<h1>✅ VERBUNDEN! Fertig!</h1>');
  if(myCode){
    res.send(`<div style="font-family:sans-serif;text-align:center"><h1>CODE: ${myCode}</h1><h2>Nummer: 41798339387</h2><p>Wenn Code nid goht, <a href="/qr">HIER QR probiere</a></p></div>`);
    return;
  }
  if(!lastQR) return res.send('<meta http-equiv="refresh" content="2"><h1>Starte... 10 Sek</h1><a href="/qr">Zu QR wechseln</a>');
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(lastQR)}`;
  res.send(`<h1 style="text-align:center">QR - Probier de wenn Code nid goht!</h1><div style="text-align:center"><img src="${url}" style="width:90%;max-width:400px" /><br><br><a href="/">Code probiere</a> | <a href="/qr">QR neu</a></div>`);
});

app.get('/qr', (req,res)=>{
  lastQR = null;
  myCode = null;
  res.redirect('/');
});

async function start(){
  const fs=require('fs');
  if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
  console.log('Auth gelöscht, frisch start...');
  
  const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ 
    auth: state, 
    printQRInTerminal: true,
    browser: ["Chrome (Windows)", "", ""],
    syncFullHistory: false,
    markOnlineOnConnect: true
  });
  
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async(u)=>{
    console.log(u);
    if(u.qr) lastQR = u.qr;
    if(u.connection==='open'){ lastQR='READY'; console.log('✅ READY!'); }
  });

  await delay(5000);
  try{
    console.log('Fordere Code für 41798339387');
    let code = await sock.requestPairingCode("41798339387");
    myCode = code;
    console.log('CODE GEHT:', code);
  }catch(e){
    console.log('Code Fehler, nimm QR:', e.message);
  }
}
app.listen(process.env.PORT||3000, ()=>start());
