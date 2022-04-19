import { isBanned } from './ipBan';
import { getClientIp } from 'request-ip';
import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export interface EndpointError {
	code: number;
	message: string;
}

export type HandlerSession = Session & {
	username: string;
	uid: string;
	admin: boolean;
};

export type Handler = (
	req: NextApiRequest,
	res: NextApiResponse,
	session: HandlerSession,
) => Promise<void>;

export const endpoint =
	(methods: string[], handler: Handler): NextApiHandler =>
	async (req: NextApiRequest, res: NextApiResponse<EndpointError>) => {
		if (isBanned(getClientIp(req) || ''))
			return res.status(404).json({ code: 404, message: 'Page Not Found' });

		if (!methods.includes(req.method || ''))
			return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

		const session = await getSession({ req });

		if (!session || session.banned)
			return res.status(403).json({ code: 403, message: 'Please login first' });

		await handler(req, res, session as HandlerSession);
	};

export type AdminEndpointHandler = (
	req: NextApiRequest,
	res: NextApiResponse,
	session: HandlerSession,
	username: string,
) => Promise<void>;

export const adminEndpoint =
	(methods: string[], handler: AdminEndpointHandler): NextApiHandler =>
	async (req: NextApiRequest, res: NextApiResponse<EndpointError>) => {
		if (isBanned(getClientIp(req) || ''))
			return res.status(404).json({ code: 404, message: 'Page Not Found' });

		if (!methods.includes(req.method || ''))
			return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

		const session = await getSession({ req });

		if (!session || session.banned || !session.admin)
			return res.status(403).json({
				code: 403,
				message: 'You need to be logged in as an administrator to view this page',
			});

		if (typeof req.query.user !== 'string')
			return res.status(404).json({ code: 404, message: 'User not found' });

		await handler(req, res, session as HandlerSession, req.query.user);
	};
