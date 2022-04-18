import { User } from '@prisma/client';
import { prisma } from '../../../../../lib/prisma';
import type { NextApiResponse } from 'next';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
	user: User;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['GET'], async (req, res: NextApiResponse<Output>, _, username) => {
	await prisma.user
		.findUnique({ where: { username } })
		.then((user) =>
			user
				? res.status(200).json({ code: 200, user })
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
