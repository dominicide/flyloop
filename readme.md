# ✈️ Flug-Preisalarm Backend

Ein Node.js-Server, der automatisch günstige **Hin- und Rückflüge weltweit** sucht (über die Kiwi.com API) und bei Erreichen eines Wunschpreises eine **E-Mail-Benachrichtigung** sendet.

---

## 🔧 Funktionen

- Preisalarme per API speichern (`/add-alert`)
- Automatische Flugsuche alle 60 Minuten per Cronjob
- Berücksichtigt Hin- und Rückflüge (1–5 Tage Aufenthalt)
- Weltweite Ziele (`fly_to=any`)
- Benachrichtigung per E-Mail mit Details zum Flug
- Persistente Speicherung der Alarme (`alerts.json`)

---

## 🚀 Schnellstart

### 1. Voraussetzungen

- Node.js v18+
- VPS oder Server (z. B. Hetzner, Render, etc.)
- API-Schlüssel von [Kiwi.com](https://partners.kiwi.com/)
- E-Mail-Account (z. B. Gmail + App-Passwort)

---

### 2. Installation

```bash
git clone https://github.com/dein-nutzername/flug-alarm.git
cd flug-alarm
npm install
