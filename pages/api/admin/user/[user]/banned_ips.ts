import { BannedIP } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { getUserId } from '../../../../../lib/getUser';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
	ips: BannedIP[];
}

export type Output = Success | EndpointError;

export default adminEndpoint(['GET'], async (_req, res: NextApiResponse<Output>, _, username) => {
	const id = await getUserId(username);

	if (!id) return res.status(404).json({ code: 404, message: 'User not found' });

	await prisma.bannedIP
		.findMany({ where: { userId: id } })
		.then((ips) => res.status(200).json({ code: 200, ips }))
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
