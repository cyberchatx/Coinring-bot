const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.get('/', (req,res)=> res.send('Bot lauft - QR in Logs!'));

async function start(){
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ 
    auth: state, 
    printQRInTerminal: true,
    browser: ['Coinring','Chrome','1.0']
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.qr) {
      console.log('--- QR CODE START ---');
      qrcode.generate(u.qr, {small:false});
      console.log('--- QR CODE ENDE - JETZT SCANNEN ---');
    }
    if(u.connection==='open') console.log('✅ READY - Account verbunden!');
  });
}

app.listen(process.env.PORT || 3000, ()=>{
  console.log('Server startet...');
  start();
});
