import requestIp from 'request-ip';
import { randomBytes } from 'crypto';
import { prisma } from '../../lib/prisma';
import { getUserId } from '../../lib/getUser';
import type { NextApiRequest, NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: 201;
	url: string;
	path: string;
}

export type Output = Success | EndpointError;

export default endpoint(
	['POST'],
	async (req: NextApiRequest, res: NextApiResponse<Output>, session) => {
		const ip = requestIp.getClientIp(req);

		if (!ip) return res.status(500).json({ code: 500, message: 'Unable to locate ip' });

		if (!req.body) return res.status(403).json({ code: 403, message: 'Invalid request' });

		let body = req.body;

		if (typeof req.body === 'string')
			try {
				body = JSON.parse(req.body);
			} catch (error) {
				return res.status(400).json({ code: 400, message: 'Invalid json' });
			}

		if (req.query.r !== undefined) body.path = undefined;
		else if (body.path !== undefined && typeof body.path !== 'string')
			return res.status(400).json({ code: 400, message: 'You must provide a valid path' });

		if (typeof body.target !== 'string')
			return res.status(400).json({ code: 400, message: 'You must provide a target url' });

		let username = session.username;

		if (typeof body.username === 'string') {
			username = body.username;
			if ((await getUserId(username)) !== session.uid)
				return res
					.status(403)
					.json({ code: 403, message: 'You may only shorten a link as yourself' });
		}

		const target: string = body.target;
		const path: string = body.path || randomBytes(4).toString('base64url');
		const url = `/${username}/${path}`;

		if (await prisma.uRL.findUnique({ where: { url }, select: { url: true } }))
			return res.status(400).json({ code: 400, message: 'File already exists' });

		await prisma.uRL
			.create({ data: { url, target, ip, userId: session.uid } })
			.then(() => res.status(201).json({ code: 201, url, path: `/${path}` }))
			.catch(() => res.status(500).json({ code: 500, message: 'Unable to create file' }));
	},
);
