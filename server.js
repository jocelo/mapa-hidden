const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.listen(8080, '0.0.0.0', () => {
    console.log('Server listening on port 8080')
});