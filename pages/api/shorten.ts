import requestIp from 'request-ip';
import { prisma } from '../../lib/prisma';
import { getUserId } from '../../lib/getUser';
import type { NextApiRequest, NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: number;
	url: string;
}

export type Output = Success | EndpointError;

export default endpoint(
	['POST'],
	async (req: NextApiRequest, res: NextApiResponse<Output>, session) => {
		const ip = requestIp.getClientIp(req);

		if (!ip) return res.status(500).json({ code: 500, message: 'Unable to locate ip' });

		if (typeof session.username !== 'string')
			return res.status(401).json({ code: 401, message: 'Please set a username' });

		if (typeof session.uid !== 'string')
			return res.status(401).json({ code: 401, message: 'Invalid session' });

		if (!req.body) return res.status(403).json({ code: 403, message: 'Invalid request' });

		let body = req.body;

		if (typeof req.body === 'string')
			try {
				body = JSON.parse(req.body);
			} catch (error) {
				return res.status(400).json({ code: 400, message: 'Invalid json' });
			}

		if (typeof body?.path !== 'string')
			return res.status(400).json({ code: 400, message: 'You must provide a path' });

		if (typeof body?.target !== 'string')
			return res.status(400).json({ code: 400, message: 'You must provide a target url' });

		const path: string = body.path;
		const target: string = body.target;

		let username = session.username;

		if (typeof body.username === 'string') {
			username = body.username;
			if ((await getUserId(username)) !== session.uid)
				return res
					.status(403)
					.json({ code: 403, message: 'You may only shorten a link as yourself' });
		}

		const url = `/${username}/${path}`;

		if (await prisma.uRL.findUnique({ where: { url }, select: { url: true } }))
			return res.status(400).json({ code: 400, message: 'File already exists' });

		await prisma.uRL
			.create({ data: { url, target, ip, userId: session.uid } })
			.then(() => res.status(201).json({ code: 201, url }))
			.catch(() => res.status(500).json({ code: 500, message: 'Unable to create file' }));
	},
);
