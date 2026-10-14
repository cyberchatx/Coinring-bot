const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const app = express();
let lastQR = null;

app.get('/', (req,res)=>{
  if(!lastQR) return res.send('<h1>Bot startet... lade in 10 Sek neu</h1><a href="/">Klick zum Neuladen</a>');
  if(lastQR=='READY') return res.send('<h1>✅ VERBUNDEN - READY!</h1>');
  res.send(`<h1>COINRING QR - mit 41798339387 scannen</h1><img src="https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(lastQR)}" /><br><p>WhatsApp > Verknüpfte Geräte > Gerät verknüpfen</p><a href="/">Neu laden</a>`);
});

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ auth: state, printQRInTerminal: false, browser: ["Coinring","Chrome","1.0"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', u=>{
    if(u.qr){ lastQR = u.qr; console.log('QR:'+u.qr); }
    if(u.connection==='open'){ lastQR='READY'; console.log('READY'); }
  });
}
app.listen(process.env.PORT||3000, ()=>start());
