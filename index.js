const express = require('express');
const app = express();
let myCode = null;
let myStatus = "Starte...";

app.get('/', (req,res)=>{
  if(myStatus.includes('READY')) return res.send('<h1>✅ VERBUNDEN! Bot lauft!</h1>');
  if(!myCode) return res.send(`<meta http-equiv="refresh" content="2"><h1>${myStatus}</h1>`);
  res.send(`
    <div style="font-family:sans-serif;text-align:center;padding:20px">
    <h1 style="font-size:60px;letter-spacing:8px;background:#eee;padding:20px;border-radius:15px">${myCode}</h1>
    <h1 style="color:red;font-size:80px" id="timer">60</h1>
    <h2 id="text">Sekunde noch gültig</h2>
    <p><b>Nummer: 41798339387</b></p>
    <p>WhatsApp > Verknüpfte Geräte > Mit Telefonnummer verknüpfen</p>
    <br><a href="/" style="font-size:20px">Neuer Code jetzt</a>
    </div>
    <script>
      let time = 60;
      let el = document.getElementById('timer');
      let txt = document.getElementById('text');
      setInterval(()=>{
        time--;
        el.textContent = time;
        if(time<=10){ el.style.color='red'; el.style.fontSize='90px'; txt.textContent='SCHNELL!'; }
        if(time<=0){ location.reload(); }
      },1000);
    </script>
  `);
});

async function start(){
  const fs=require('fs');
  if(fs.existsSync('./auth_info')) fs.rmSync('./auth_info',{recursive:true,force:true});
  const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
  const sock = makeWASocket({ auth: state, browser: ["Ubuntu","Chrome","110"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async(u)=>{
    if(u.connection==='open'){ myStatus='READY'; myCode='READY'; }
    if(u.connection==='close'){ myCode=null; myStatus='Neu starte...'; await delay(3000); start(); }
  });
  await delay(3000);
  try{
    myStatus='Hole Code...';
    let code = await sock.requestPairingCode("41798339387");
    myCode = code;
    myStatus = code;
    console.log('CODE: '+code);
  }catch(e){ myStatus='Fehler: '+e.message; setTimeout(start,5000); }
}
app.listen(process.env.PORT||3000, ()=>start());
