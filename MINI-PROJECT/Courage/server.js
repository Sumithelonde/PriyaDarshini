import app from './server/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Legislate AI Server running on port ${PORT}`);
});
