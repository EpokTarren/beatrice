import type { NextApiResponse } from 'next';
import type { Username } from '@prisma/client';
import { prisma } from '../../../../../lib/prisma';
import { getUserId } from '../../../../../lib/getUser';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: 200;
	usernames: Username[];
}

export type Output = Success | EndpointError;

export default adminEndpoint(['GET'], async (_, res: NextApiResponse<Output>, _s, username) => {
	const id = await getUserId(username);

	if (!id) return res.status(404).json({ code: 404, message: 'User not found' });

	await prisma.username
		.findMany({ where: { id } })
		.then((usernames) => res.status(200).json({ code: 200, usernames }))
		.catch(() => res.status(500).json({ code: 500, message: 'Database error' }));
});
