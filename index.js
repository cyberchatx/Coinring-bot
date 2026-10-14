const express = require('express');
const app = express();
let myCode = null;
let myStatus = "Starte...";

app.get('/', (req,res)=>{
  if(myStatus.includes('READY')) return res.send('<h1>✅ VERBUNDEN! Jetzt lauft de Bot!</h1>');
  if(!myCode) return res.send(`<meta http-equiv="refresh" content="3"><h1>${myStatus}</h1>`);
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:20px">
    <h1 style="font-size:50px;letter-spacing:5px">${myCode}</h1>
    <h2>So verknüpfen:</h2>
    <p>WhatsApp > Verknüpfte Geräte > Gerät verknüpfen > UNTE klicken:</p>
    <p><b>"Gerät stattdessen via Telefonnummer verknüpfen"</b></p>
    <p>Code: <b>${myCode}</b></p>
    <p>Code isch 2 Minute gültig!</p>
    <a href="/">Neuen Code</a>
    </div>
  `);
});

async function start(){
  const fs=require('fs');
  if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
  const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state, printQRInTerminal:false, browser: ["Ubuntu","Chrome","110.0"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async(u)=>{
    if(u.connection==='open'){ myStatus='READY'; myCode='READY'; }
    if(u.connection==='close'){ myCode=null; myStatus='Neu starte...'; await delay(3000); start(); }
  });
  await delay(3000);
  try{
    myStatus='Fordere Code für 41798339387 an...';
    let code = await sock.requestPairingCode("41798339387");
    myCode = code;
    myStatus = 'Code: '+code;
    console.log('CODE: '+code);
  }catch(e){ myStatus='Fehler: '+e.message+' - neu laden in 5 Sek'; setTimeout(start,5000); }
}
app.listen(process.env.PORT||3000, ()=>start());
