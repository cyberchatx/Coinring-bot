const express = require('express');
const app = express();
let myCode = null;
let myStatus = "Starte...";

app.get('/', (req,res)=>{
  if(myStatus==='READY') return res.send('<h1>✅ FERTIG! Bot verbunden!</h1><p>Chasch WhatsApp jetzt normal bruche!</p>');
  if(!myCode) return res.send(`<meta http-equiv="refresh" content="2"><h1>${myStatus}</h1>`);
  res.send(`<div style="font-family:sans-serif;text-align:center;padding:20px"><h1 style="font-size:60px;background:#000;color:#0f0;padding:20px">${myCode}</h1><h2>Code: ${myCode} für 41798339387</h2><p>Wenn "Wird angemeldet" hängt: 60 Sek warte, Handy nid sperre!</p></div>`);
});

async function start(){
  const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ 
    auth: state, 
    printQRInTerminal:false,
    browser: ["Chrome","Windows","10"],
    syncFullHistory: false,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 10000,
    defaultQueryTimeoutMs: 60000
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async(u)=>{
    console.log('Status:', u.connection);
    if(u.connection==='open'){ 
        myStatus='READY'; 
        console.log('✅ VERBUNDEN!');
    }
    if(u.connection==='close'){ 
        console.log('Close', u.lastDisconnect?.error);
        await delay(2000);
        if(myStatus!=='READY') start();
    }
  });

  await delay(3000);
  if(!state.creds.registered){
    try{
      myStatus='Code wird generiert...';
      let code = await sock.requestPairingCode("41798339387");
      myCode = code;
      myStatus = code;
      console.log('CODE:', code);
      // WICHTIG: Socket nid schliesse! Muss offe blibe während Handy "Wird angemeldet" zeigt
    }catch(e){ 
        console.log(e); 
        myStatus='Fehler, neu in 3 Sek...';
        await delay(3000);
        start();
    }
  } else {
    myStatus='READY';
  }
}
app.listen(process.env.PORT||3000, ()=>start());
