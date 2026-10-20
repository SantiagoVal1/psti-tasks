
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


const express = require('express');
const mongoose = require('mongoose');
const { router } = require('./api');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('PSTI Tasks - Servidor funcionando');
});

async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('Falta configurar MONGODB_URI en el archivo .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conexión a MongoDB exitosa');

        app.listen(port, () => {
            console.log(`Servidor escuchando en el puerto ${port}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error.message);
        process.exit(1);
    }
}

startServer();
