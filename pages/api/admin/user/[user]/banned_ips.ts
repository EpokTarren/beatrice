import { BannedIP } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
	ips: BannedIP[];
}

export type Output = Success | EndpointError;

export default adminEndpoint(['GET'], async (_req, res: NextApiResponse<Output>, _, username) => {
	await prisma.user
		.findUnique({ where: { username } })
		.then(async (user) =>
			user
				? await prisma.bannedIP
						.findMany({ where: { userId: user.id } })
						.then((ips) => res.status(200).json({ code: 200, ips }))
						.catch((err) =>
							res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
						)
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
