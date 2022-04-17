import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../../.env.local') }).parsed;

const port = Number(process.env['PORT'] || 3001);
const user = process.env['BEATRICE_FILES_USER'];
const prefix = user ? `/${user}` : '';

import { createServer } from 'http';
import { prisma } from '../lib/prisma';
import { contentType } from '../lib/contentType';

const errorPage = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>404 - File Not Found</title>
		<style>
			body {
				display: grid;
				place-content: center;
				text-align: center;
				font-size: xx-large;
				font-family: sans-serif;
				height: 100vh;
				margin: 0;
				color: hsl(350, 100%, 50%);
				background: hsl(324, 15%, 8%);
			}
		</style>
	</head>
	<body>
		<h1>404</h1>
		<h2>File Not Found</h2>
	</body>
</html>`.replace(/\t|\n/g, '');

createServer(async (req, res) => {
	const url = prefix + req.url;

	if (url) {
		const file = await prisma.file.findUnique({ where: { url }, select: { content: true } });

		if (file) {
			res
				.writeHead(200, { 'Content-Type': contentType(url.split('/').pop() || '') })
				.write(file.content);
			res.end();

			return;
		}
	}

	res.writeHead(404, { 'Content-Type': 'text/html' });
	res.write(errorPage);
	res.end();
}).listen(port);
