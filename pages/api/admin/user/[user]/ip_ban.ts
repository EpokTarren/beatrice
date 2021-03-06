import type { NextApiResponse } from 'next';
import { ban } from '../../../../../lib/ipBan';
import { prisma } from '../../../../../lib/prisma';
import { getUserId } from '../../../../../lib/getUser';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: 200;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['POST'], async (req, res: NextApiResponse<Output>, _, username) => {
	if (typeof req.body !== 'string')
		return res.status(400).send({ code: 400, message: 'Please provide an ip to ban.' });

	const id = await getUserId(username);

	if (!id) return res.status(404).json({ code: 404, message: 'User not found' });

	await prisma.user
		.findUnique({ where: { id } })
		.then(async (user) => {
			if (!user) return res.send({ code: 404, message: 'User not found.' });

			await ban(req.body, user)
				.then(() => res.status(200).json({ code: 200 }))
				.catch((err) =>
					res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
				);
		})
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
