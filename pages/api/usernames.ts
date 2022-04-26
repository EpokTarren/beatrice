import { prisma } from '../../lib/prisma';
import type { NextApiResponse } from 'next';
import type { Username } from '@prisma/client';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: 200;
	usernames: Username[];
}

export type Output = Success | EndpointError;

export default endpoint(['GET'], async (_, res: NextApiResponse<Output>, { uid }) => {
	await prisma.username
		.findMany({ where: { id: uid } })
		.then((usernames) => res.status(200).json({ code: 200, usernames }))
		.catch(() => res.status(500).json({ code: 500, message: 'Database error' }));
});
