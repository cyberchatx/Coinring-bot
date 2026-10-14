const express = require('express');
const app = express();
let code = null;
let status = "Starte...";

app.get('/', (req,res)=>{
  if(!code) return res.send(`<h1>${status}</h1><a href="/">Reload</a>`);
  if(code==='READY') return res.send('<h1>✅ VERBUNDEN!</h1>');
  res.send(`<h1 style="font-size:60px;letter-spacing:10px;text-align:center">${code}</h1><h2>Code i WhatsApp igeh:</h2><p>WhatsApp > Verknüpfte Geräte > Mit Telefonnummer verknüpfen > CODE igeh</p><p>Nummer: 41798339387</p><a href="/">Reload</a>`);
});

async function start(){
  try{
    const fs = require('fs');
    if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
    const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    status = "Verbinde...";
    const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ["Coinring","Chrome","1.0"] });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', u=>{
      if(u.connection==='open'){ code='READY'; console.log('VERBUNDEN'); }
    });
    // 5 Sek warte dann Code ahfordere
    setTimeout(async()=>{
      try{
        status = "Fordere Code ah...";
        const c = await sock.requestPairingCode("41798339387");
        code = c;
        console.log("CODE: "+c);
        status = "Code da: "+c;
      }catch(e){ status = "Fehler Code: "+e.message; }
    },5000);
  }catch(e){ status = "Fehler: "+e.message; }
}
app.listen(process.env.PORT||3000, ()=>{ start(); });
