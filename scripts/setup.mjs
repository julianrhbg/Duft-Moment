import {createApp} from '../src/server.mjs';
import {validateConfig} from '../src/validate.mjs';
const major=Number(process.versions.node.split('.')[0]);
if(major!==24)throw Error('Dieses Projekt verwendet Node.js 24 LTS.');
const app=createApp();validateConfig(app.current().config);app.db.close();
console.log('Privater Datenspeicher vorbereitet. Bestehende Inhalte und Konten bleiben erhalten. Einrichtungsschlüssel wird nicht ausgegeben.');
