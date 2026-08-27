const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de Supabase usando variables de entorno por seguridad
const supabaseUrl = process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'PEGA_AQUI_TU_LLAVE_SI_LA_NECESITAS_LOCALMENTE';

const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware para leer JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de prueba del servidor
app.get('/api/status', (req, res) => {
    res.json({ status: 'Servidor funcionando correctamente con Supabase' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});