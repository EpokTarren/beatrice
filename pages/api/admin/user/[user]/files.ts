import type { File } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
	files: Partial<File>[];
	userId: string;
}

export type Output = Success | EndpointError;

const errResponse = (res: NextApiResponse<EndpointError>) => (err: any) =>
	res.status(500).json({ code: 500, message: err?.message || 'Internal server error' });

export default adminEndpoint(['GET'], async (_req, res: NextApiResponse<Output>, _, username) => {
	await prisma.user
		.findUnique({ where: { username }, select: { id: true } })
		.then(async (user) =>
			user
				? await prisma.file
						.findMany({
							where: { userId: user.id },
							select: { id: true, createdAt: true, url: true, userId: true, ip: true },
						})
						.then((files) => res.status(200).json({ code: 200, files, userId: user.id }))
						.catch(errResponse)
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch(errResponse);
});
