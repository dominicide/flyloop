const express = require('express');
const fs = require('fs');
const cron = require('node-cron');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const ALERTS_FILE = 'alerts.json';

function loadAlerts() {
  return JSON.parse(fs.readFileSync(ALERTS_FILE));
}

function saveAlerts(alerts) {
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2));
}

app.post('/add-alert', (req, res) => {
  const { from, price_limit, email } = req.body;
  if (!from || !price_limit || !email) return res.status(400).send('Fehlende Felder');

  const alerts = loadAlerts();
  alerts.push({ from, price_limit, email });
  saveAlerts(alerts);
  res.send({ message: 'Alarm gespeichert' });
});

async function searchFlights(from) {
  const now = new Date();
  const dateFrom = now.toLocaleDateString('en-GB').split('/').join('/');
  const dateTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    .toLocaleDateString('en-GB').split('/').join('/');

  const url = `https://api.tequila.kiwi.com/v2/search?fly_from=${from}&fly_to=any&date_from=${dateFrom}&date_to=${dateTo}&nights_in_dst_from=1&nights_in_dst_to=5&type_flight=round&sort=price&limit=1`;

  const response = await axios.get(url, {
    headers: { apikey: process.env.KIWI_API_KEY }
  });

  return response.data.data[0]; // billigster Flug
}

async function sendEmail(to, subject, body) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `Flugalarm <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text: body
  });
}

cron.schedule('0 * * * *', async () => {
  const alerts = loadAlerts();

  for (const alert of alerts) {
    try {
      const flight = await searchFlights(alert.from);
      if (flight && flight.price <= alert.price_limit) {
        const msg = `Günstiger Flug gefunden!\n\nVon: ${alert.from}\nNach: ${flight.cityTo} (${flight.flyTo})\nHinflug: ${flight.route[0].local_departure}\nRückflug: ${flight.route[1].local_departure}\nPreis: ${flight.price} €`;

        await sendEmail(alert.email, 'Flugalarm – günstiger Flug gefunden!', msg);
        console.log(`Email an ${alert.email} gesendet.`);
      }
    } catch (err) {
      console.error('Fehler bei Suche oder E-Mail:', err.message);
    }
  }
});

app.listen(3000, () => console.log('Server läuft auf http://localhost:3000'));
