import prisma from './prisma';
import { isBanned } from './ipBan';
import * as jwt from 'jsonwebtoken';
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

const secret = process.env['NEXTAUTH_SECRET'];
if (!secret) throw new Error('Must have a NEXTAUTH_SECRET in ENV');

export const endpoint =
	(methods: string[], handler: Handler): NextApiHandler =>
	async (req: NextApiRequest, res: NextApiResponse<EndpointError>) => {
		if (isBanned(getClientIp(req) || ''))
			return res.status(404).json({ code: 404, message: 'Page Not Found' });

		if (!methods.includes(req.method || ''))
			return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

		let session = (await getSession({ req })) as HandlerSession & { banned?: boolean };

		const token_str = req.headers['jwt'];

		if (!session && typeof token_str === 'string') {
			try {
				const token = jwt.verify(token_str, secret, { complete: true });
				const payload = token.payload as jwt.JwtPayload;
				const id = (token.payload as jwt.JwtPayload).uid;

				if (typeof id === 'string')
					await prisma.user.findUnique({ where: { id }, select: { banned: true } }).then((user) => {
						if (user && !user.banned)
							session = {
								username: payload.username,
								uid: payload.uid,
								admin: payload.admin,
								user: {
									name: payload.user?.name,
									image: payload.user?.image,
								},
								expires: payload.expires,
							};
					});
			} catch {}
		}

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

		const session = (await getSession({ req })) as HandlerSession & { banned?: boolean };

		if (!session || session.banned || !session.admin)
			return res.status(403).json({
				code: 403,
				message: 'You need to be logged in as an administrator to view this page',
			});

		if (typeof req.query.user !== 'string')
			return res.status(404).json({ code: 404, message: 'User not found' });

		await handler(req, res, session as HandlerSession, req.query.user);
	};
