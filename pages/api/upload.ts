import formidable, { IncomingForm, Fields, File } from 'formidable';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';
import requestIp from 'request-ip';
import { Writable } from 'stream';

const files = new Map<string, Buffer>();

export const config = {
	api: {
		bodyParser: false,
	},
};

const parse = (req: NextApiRequest): Promise<[Fields, File]> =>
	new Promise((resolve, reject) => {
		const uuid = Date.now().toString();
		const options: formidable.Options = {
			allowEmptyFiles: false,
			multiples: false,
			filename: () => uuid,
			fileWriteStreamHandler: () => {
				const a: number[] = [];
				return new Writable({
					decodeStrings: false,
					write: (chunk, _encoding, callback) => {
						if (chunk instanceof Buffer) {
							chunk.forEach((b) => a.push(b));
						} else {
							a.push(chunk);
						}

						callback(null);
					},

					final(callback) {
						files.set(uuid, Buffer.from(a));

						callback(null);
					},
				});
			},
		};

		new IncomingForm(options).parse(req, (err, fields, files) => {
			if (err) reject(err);
			else {
				const file = files.file as unknown as File;
				resolve([fields, file]);
			}
		});
	});

type Data = {
	url: string;
};

type Error = {
	code: number;
	message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data | Error>) {
	if (req.method !== 'POST')
		return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

	const session = await getSession({ req });

	if (!session) return res.status(401).json({ code: 401, message: 'Please login to upload' });

	const ip = requestIp.getClientIp(req);

	if (!ip) return res.status(500).json({ code: 500, message: 'Unable to locate ip' });

	if (typeof session.username !== 'string')
		return res.status(401).json({ code: 401, message: 'Please set a username' });

	if (typeof session.uid !== 'string')
		return res.status(401).json({ code: 401, message: 'Invalid session' });

	let file;

	try {
		[, file] = await parse(req);
	} catch (error: any) {
		return res.status(error?.responseCode ?? 400).json({
			code: error?.responseCode ?? 400,
			message: error?.message ?? 'Unable to parse file',
		});
	}

	const filename = file.newFilename;
	const content = files.get(filename);

	files.delete(filename);

	if (!file.originalFilename)
		return res.status(500).json({ code: 500, message: 'Please provide a file name' });

	if (!content) return res.status(500).json({ code: 500, message: 'File could not be read' });

	const url = `/${session.username}/${file.originalFilename}`;

	if (await prisma.file.findUnique({ where: { url }, select: { url: true } }))
		return res.status(400).json({ code: 400, message: 'File already exists' });

	await prisma.file.create({ data: { url, content, ip, userId: session.uid } }).catch(() => {
		return res.status(500).json({ code: 500, message: 'Unable to create file' });
	});

	res.status(201).json({ url });
}
