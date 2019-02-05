const fs = require('fs');
const express = require('express');
const marked = require('marked');
const serveIndex = require('serve-index');
const fetch = require("node-fetch");
const app = express();

// Var for determining prod
const environment = process.env.NODE_ENV == "development" ? "http://127.0.0.1:8080/" : "https://www.simonlayfield.com/";

// Sever side rendering Svelte components
require('svelte/ssr/register')({
  extensions: ['.svelte']
});
const PageProject = require('./src/components/PageProject.svelte');

function requireHTTPS(req, res, next) {
  // The 'x-forwarded-proto' check is for Evennode
  if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
}

app.use(requireHTTPS);

app.use(express.static('public'));
app.use('/misc', express.static('public/misc'), serveIndex('public/misc'))

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

app.get('/project', (req, res) => {

  const projectId = req.param('id');

  fetch(environment + 'js/projects.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(projects) {
    const { html, css, head } = PageProject.render(projects[`${projectId}`]);

    res.set({ 'content-type': 'text/html; charset=utf-8' });
    res.write(head);
    res.write('<style>' + css.code + '</style>');
    res.write(html);
    res.end();
  });

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
			res.write(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <meta http-equiv="X-UA-Compatible" content="ie=edge"><base href="/articles/${articleLoc}/"><title>Document</title><link rel="stylesheet" href="/css/main.css" type="text/css"><link href="https://fonts.googleapis.com/css?family=Montserrat:800|Esteban" rel="stylesheet"></head><body class="article"><div class="ui-container -blog">`);
			res.write(marked.parser(marked.lexer(pgResp)));
			res.write('</div></body></html>');
		}
		res.end();
	});
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
	console.log('Press Ctrl+C to quit.');
})
console.log('The environment is:', process.env.NODE_ENV);
