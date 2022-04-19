import { User } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
	user: User;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['PATCH'], async (_req, res: NextApiResponse<Output>, _, username) => {
	await prisma.user
		.update({ where: { username }, data: { banned: true, bannedAt: new Date() } })
		.then((user) =>
			user
				? res.status(200).json({ code: 200, user })
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
