import express from 'express';
const app = express();
const PORT = 5003;

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Frontend corriendo en http://localhost:${PORT}`);
});