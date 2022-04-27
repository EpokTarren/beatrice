import { prisma } from '../../lib/prisma';
import type { NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: number;
	urls: string[];
}

export type Output = Success | EndpointError;

export default endpoint(['GET'], async (_req, res: NextApiResponse<Output>, session) => {
	await prisma.uRL
		.findMany({
			where: { userId: session.uid },
			select: { url: true },
			orderBy: { createdAt: 'desc' },
		})
		.then((urls) => res.status(200).json({ code: 200, urls: urls.map(({ url }) => url) }))
		.catch(() => res.status(500).json({ code: 500, message: 'Internal server error' }));
});
