const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const file = req.url === '/' ? 'index.html' : req.url; //
    const filePath = path.join(__dirname, 'static', file);

    let contentType = 'text/plain';
    switch (path.extname(filePath)) { //
        case '.html': contentType = 'text/html'; break;
        case '.css': contentType = 'text/css'; break; //
        case '.js': contentType = 'text/javascript'; break; //
    }

    fs.readFile(filePath, (err, content) => { //
        if (err) {
            res.statusCode = 404;
            return res.end('error 404');
        }
        res.writeHead(200, { 'Content-Type': contentType }); //
        res.end(content);
    });
});

server.listen(3000);
