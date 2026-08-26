/* @license Apache-2.0; ver LICENCIA.txt */

import express from 'express';
const app = express();
const PORT = Number(process.env.PORT) || 5003;

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Frontend corriendo en http://localhost:${PORT}`);
});
