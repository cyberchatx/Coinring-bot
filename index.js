const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const admin = require('firebase-admin');

const app = express();
admin.initializeApp();
const db = admin.firestore();

async function start(){
const { state, saveCreds } = await useMultiFileAuthState('auth');
const sock = makeWASocket({ auth: state, printQRInTerminal: true });
sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', u=>{
if(u.qr) qrcode.generate(u.qr,{small:true});
if(u.connection==='open') console.log('✅ READY 41798339387');
});
db.collection("whatsappQueue").onSnapshot(s=>{
s.docChanges().forEach(async c=>{
if(c.type==='added'){
const d=c.doc.data();
await sock.sendMessage(d.phone+"@s.whatsapp.net",{text:d.message});
await c.doc.ref.delete();
console.log('Gesendet',d.phone);
}
});
});
}
app.get('/', (req,res)=>res.send('COINRING Bot läuft'));
app.listen(process.env.PORT||3000, ()=>start());
Commit.
