const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    const staticDir = path.join(__dirname, 'static'); //
    let filePath = path.join(staticDir, req.url === '/' ? 'index.html' : req.url); //
    const extname = path.extname(filePath); //
    let contentType = 'text/html'; //
    //
    switch (extname) { //
        case '.js': //
            contentType = 'text/javascript'; //
            break; //
        case '.css': //
            contentType = 'text/css'; //
            break; //
        case '.json': //
            contentType = 'application/json'; //
            break; //
    } //
    //
    fs.readFile(filePath, (err, content) => { //
        if (err) { //
            if (err.code === 'ENOENT') { //
                res.writeHead(404, { 'Content-Type': 'text/plain' }); //
                res.end('Error 404: File Not Found'); //
            } else { //
                res.writeHead(500, { 'Content-Type': 'text/plain' }); //
                res.end(`Server Error: ${err.code}`); //
            } //
        } else { //
            res.writeHead(200, { 'Content-Type': contentType }); //
            res.end(content, 'utf-8'); //
        } //
    }); //
});

server.listen(3000)
