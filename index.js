const server = require('./src/server.js');

const PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
    console.log(`Server up and running on port ${PORT} (http://localhost:${PORT})`);
});
