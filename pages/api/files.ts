import { prisma } from '../../lib/prisma';
import type { NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: number;
	files?: string[];
	message?: string;
}

export type Output = Success | EndpointError;

export default endpoint(['GET'], async (req, res: NextApiResponse<Output>, session) => {
	await prisma.file
		.findMany({
			where: { userId: session.uid },
			select: { url: true },
			orderBy: { createdAt: 'desc' },
		})
		.then((files) => res.status(200).json({ code: 200, files: files.map(({ url }) => url) }))
		.catch(() => res.status(500).json({ code: 500, message: 'Internal server error' }));
});
