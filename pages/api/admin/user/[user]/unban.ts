import type { User } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';
import { getUserId } from '../../../../../lib/getUser';

export interface Success {
	code: number;
	user: User;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['PATCH'], async (_req, res: NextApiResponse<Output>, _, username) => {
	const id = await getUserId(username);

	if (!id) return res.status(404).json({ code: 404, message: 'User not found' });

	await prisma.user
		.update({ where: { id }, data: { banned: false, bannedAt: null } })
		.then((user) =>
			user
				? res.status(200).json({ code: 200, user })
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
