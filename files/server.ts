import dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../../.env.local') }).parsed;

import { prisma } from '../lib/prisma';
import { contentType } from '../lib/contentType';
import { createServer, IncomingMessage, ServerResponse } from 'http';

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

const maxAge = parseInt(process.env['BEATRICE_MAX_AGE'] || '', 10);
const cacheControl = isFinite(maxAge) && maxAge > 0 ? { 'Cache-Control': `max-age=${maxAge}` } : {};

const respond = async (res: ServerResponse, url?: string, error = true) => {
	if (url) {
		const file = await prisma.file.findUnique({
			where: { url: decodeURIComponent(url) },
			select: { content: true },
		});

		if (file) {
			res
				.writeHead(200, {
					...cacheControl,
					'Content-Type': contentType(url.split('/').pop() || ''),
				})
				.write(file.content);
			return new Promise((resolve) => res.end(resolve));
		}
	}

	if (error) {
		res.writeHead(404, { 'Content-Type': 'text/html' }).write(errorPage);
		res.end();
	}
};

const parseUrl = (url?: string): string | undefined =>
	url?.match(/^(\/[^\/\s\n]+\/[^\/\s\n]+)\/?$/)?.[1];

const user = process.env['BEATRICE_FILES_USER'];
const exclusive = process.env['BEATRICE_EXCLUSIVE']?.[0]?.toLowerCase() === 't';

const handler: (req: IncomingMessage, res: ServerResponse) => void = user
	? (() => {
			const prefix = `/${user}`;

			if (exclusive) return (req, res) => respond(res, parseUrl(prefix + req.url));

			return async (req, res) => {
				if (req.url) await respond(res, parseUrl(prefix + req.url), false);
				if (!res.writableEnded) respond(res, parseUrl(req.url));
			};
	  })()
	: (req, res) => respond(res, parseUrl(req.url));

const port = Number(process.env['BEATRICE_FILES_PORT'] || 3001);
createServer(handler).listen(port);
console.log('Listening for file requests on port', port);

const redirect = async (res: ServerResponse, url?: string, error = true) => {
	if (url) {
		const target = await prisma.uRL.findUnique({
			where: { url: decodeURIComponent(url) },
			select: { target: true },
		});

		if (target) {
			res.writeHead(301, { ...cacheControl, Location: target.target }).write('');
			return new Promise((resolve) => res.end(resolve));
		}
	}

	if (error) {
		res.writeHead(404, { 'Content-Type': 'text/html' }).write(errorPage);
		res.end();
	}
};

const urlHandler: (req: IncomingMessage, res: ServerResponse) => void = user
	? (() => {
			const prefix = `/${user}`;

			if (exclusive) return (req, res) => redirect(res, parseUrl(prefix + req.url));

			return async (req, res) => {
				if (req.url) await redirect(res, parseUrl(prefix + req.url), false);
				if (!res.writableEnded) redirect(res, parseUrl(req.url));
			};
	  })()
	: (req, res) => redirect(res, parseUrl(req.url));

const urlPort = Number(process.env['BEATRICE_REDIRECT_PORT'] || 3002);
createServer(urlHandler).listen(urlPort);
console.log('Listening for url requests on port', urlPort);
