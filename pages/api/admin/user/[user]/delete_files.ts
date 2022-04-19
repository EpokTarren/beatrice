import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['DELETE'], async (_r, res: NextApiResponse<Output>, _, username) => {
	await prisma.user
		.findUnique({ where: { username }, select: { id: true } })
		.then(async (user) =>
			user
				? await prisma.file
						.deleteMany({ where: { userId: user.id } })
						.then(() => res.status(200).json({ code: 200 }))
						.catch((err) =>
							res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
						)
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
