import { Writable } from 'stream';
import requestIp from 'request-ip';
import { randomBytes } from 'crypto';
import { prisma } from '../../lib/prisma';
import { getUserId } from '../../lib/getUser';
import type { NextApiRequest, NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';
import formidable, { IncomingForm, Fields, File } from 'formidable';

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

export interface Success {
	code: 201;
	url: string;
	filename: string;
}

export type Output = Success | EndpointError;

export default endpoint(
	['POST'],
	async (req: NextApiRequest, res: NextApiResponse<Output>, session) => {
		const ip = requestIp.getClientIp(req);

		if (!ip) return res.status(500).json({ code: 500, message: 'Unable to locate ip' });

		let file: File, fields: Fields;

		try {
			[fields, file] = await parse(req);
		} catch (error: any) {
			return res.status(error?.responseCode ?? 400).json({
				code: error?.responseCode ?? 400,
				message: error?.message ?? 'Unable to parse file',
			});
		}

		const username =
			typeof fields.username === 'string' && fields.username ? fields.username : session.username;

		if (fields.username === username)
			try {
				if ((await getUserId(username)) !== session.uid)
					return res
						.status(403)
						.json({ code: 403, message: 'You may only upload a file as yourself' });
			} catch (error: any) {
				return res.status(error?.responseCode ?? 500).json({
					code: error?.responseCode ?? 500,
					message: error?.message ?? 'Unable to parse file',
				});
			}

		const content = files.get(file.newFilename);
		files.delete(file.newFilename);

		if (!file.originalFilename?.length)
			return res.status(500).json({ code: 500, message: 'Please provide a file name' });

		if (!content) return res.status(500).json({ code: 500, message: 'File could not be read' });

		const ext = (filename: string) => {
			const parts = filename.split('.');
			return parts.length < 2 ? '' : `.${parts.pop()}`;
		};

		const filename =
			req.query.r !== undefined
				? `${randomBytes(4).toString('base64url')}${ext(file.originalFilename)}`
				: file.originalFilename;
		const url = `/${username}/${filename}`;

		if (await prisma.file.findUnique({ where: { url }, select: { url: true } }))
			return res.status(400).json({ code: 400, message: 'File already exists' });

		await prisma.file.create({ data: { url, content, ip, userId: session.uid } }).catch(() => {
			return res.status(500).json({ code: 500, message: 'Unable to create file' });
		});

		res.status(201).json({ code: 201, url, filename });
	},
);
