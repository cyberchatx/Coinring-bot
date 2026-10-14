const express = require('express');
const app = express();
let myCode = null;
let myStatus = "Starte... Schnelle Version";

app.get('/', (req,res)=>{
  if(myStatus==='READY') return res.send('<h1>✅ VERBUNDEN! Bot lauft!</h1><p>Nümme neu lade!</p>');
  if(!myCode) return res.send(`<meta http-equiv="refresh" content="2"><h1>${myStatus}</h1><p>Wart 5-10 Sek...</p>`);
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:20px">
    <h1 style="font-size:60px;letter-spacing:8px;background:#000;color:#0f0;padding:20px">${myCode}</h1>
    <h1 style="color:red;font-size:80px" id="timer">60</h1>
    <p>Für: 41798339387</p>
    <script>
      let t=60; setInterval(()=>{ t--; document.getElementById('timer').textContent=t; if(t<=0) location.reload(); },1000);
    </script>
    </div>
  `);
});

async function start(){
  // NÜMME LÖSCHE! Das isch schnell!
  const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  console.log('Auth state gfade:', !!state.creds.registered);
  
  const sock = makeWASocket({ 
    auth: state, 
    printQRInTerminal:false,
    browser: ["Ubuntu","Chrome","110"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 10000,
    keepAliveIntervalMs: 10000
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async(u)=>{
    console.log('Update:', u);
    if(u.connection==='open'){ myStatus='READY'; myCode='READY'; console.log('CONNECTED!'); }
    if(u.connection==='close'){ 
        let reason = u.lastDisconnect?.error?.output?.statusCode;
        console.log('Close reason:', reason);
        // Nur lösche wenn wirklich ausgeloggt (401)
        if(reason===401){ 
            const fs=require('fs'); 
            if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
        }
        myCode=null; myStatus='Neu verbinde in 2 Sek...'; await delay(2000); start(); 
    }
  });

  // Nur Code afo wenn nid scho registriert
  await delay(2000);
  if(!state.creds.registered){
    try{
      myStatus='Fordere Code an... (schnell)';
      let code = await sock.requestPairingCode("41798339387");
      myCode = code;
      console.log('CODE:', code);
    }catch(e){ myStatus='Fehler: '+e.message; console.log(e); }
  } else {
    myStatus='READY';
  }
}
app.listen(process.env.PORT||3000, ()=>start());
