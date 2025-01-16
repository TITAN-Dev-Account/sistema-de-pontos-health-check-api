const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const API_URL = process.env.API_URL;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

let isApiDown = false;

async function checkApiHealth() {
    try {
        const response = await axios.get(`${API_URL}/health`);
        if (response.status === 200) {
            console.log(`API está ativa: ${new Date().toLocaleString()}`);
            if (isApiDown) {
                isApiDown = false;
                await notifyDiscord("A API foi reativada! 🎉");
            }
        }
    } catch (error) {
        console.error(`Erro ao tentar testar a API: ${error.message}`);
        if (!isApiDown) {
            isApiDown = true;
            await notifyDiscord("🚨 A API está inativa! 🚨");
        }
    }
}

async function notifyDiscord(message) {
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: message,
        });
        console.log("Mensagem enviada ao Discord.");
    } catch (err) {
        console.error("Erro ao enviar mensagem ao Discord:", err.message);
    }
}

setInterval(checkApiHealth, (10 * 60 * 1000)); //  10 minutos

app.listen(PORT, () => {
    console.log(`API secundária rodando na porta ${PORT}`);
});
