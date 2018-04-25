const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get(['/','index.html'], (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

app.get(['/branding','branding.html'], (req, res) => {
	res.sendFile(__dirname + '/public/branding.html');
});

app.get(['/illustration','illustration.html'], (req, res) => {
	res.sendFile(__dirname + '/public/illustration.html');
});

app.get(['/web','web.html'], (req, res) => {
	res.sendFile(__dirname + '/public/web.html');
});

app.get(['/blog','blog.html'], (req, res) => {
	res.sendFile(__dirname + '/public/blog.html');
});

app.get(['/blog/*'], (req, res) => {
	let articleRoute = req.url.split('/');
	let articleLoc = articleRoute[articleRoute.length-1];
	fs.readFile(__dirname + `/public/articles/${articleLoc}/article.md`, 'utf8', function (error, pgResp) {
		if (error) {
			res.writeHead(404);
			res.write('Contents you are looking are Not Found');
		} else {
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta http-equiv="X-UA-Compatible" content="ie=edge"><base href="/articles/${articleLoc}/"><link rel="stylesheet" href="/css/main.css" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:800|Esteban" rel="stylesheet"><title>Document</title> </head> <body><div class="ui-container -blog">`);
			res.write(markdown.toHTML(pgResp));
			res.write('</div></body></html>');
		}
		res.end();
	});
});

let server = http.createServer(app);

// if (process.env.NODE_ENV == "production") {
// 	const credentials = {
// 	  key: fs.readFileSync('/etc/letsencrypt/live/simonlayfield.com/privkey.pem'),
// 	  cert: fs.readFileSync('/etc/letsencrypt/live/simonlayfield.com/cert.pem'),
// 	  ca: fs.readFileSync('/etc/letsencrypt/live/simonlayfield.com/chain.pem')
// 	};
// 	server = https.createServer(credentials, app);
// } else {
// 	server = http.createServer(app);
// }

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log('Press Ctrl+C to quit.');
	console.log('The environment is:', process.env.NODE_ENV);
});
