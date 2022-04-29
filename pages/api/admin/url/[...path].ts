import type { URL } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { endpoint, EndpointError } from '../../../../lib/endpoint';

export interface Success {
	code: number;
	url: URL;
}

export type Output = Success | EndpointError;

export default endpoint(['GET', 'DELETE'], async (req, res: NextApiResponse<Output>, { admin }) => {
	if (!admin)
		return res
			.status(403)
			.json({ code: 403, message: 'You need to be an administrator to view this page' });

	if (!Array.isArray(req.query.path) || req.query.path.length < 2)
		return res.status(404).json({ code: 404, message: 'URL not found' });

	const [user, short] = req.query.path;
	const url = `/${user}/${short}`;

	if (req.method === 'GET')
		return await prisma.uRL
			.findUnique({ where: { url } })
			.then((url) =>
				url
					? res.status(200).json({ code: 200, url })
					: res.status(404).json({ code: 404, message: 'URL not found' }),
			)
			.catch((err) =>
				res.status(500).json({ code: 500, message: err?.message || 'Datbase error' }),
			);

	await prisma.uRL
		.delete({ where: { url } })
		.then((url) => res.status(200).json({ code: 200, url }))
		.catch(() => res.status(404).json({ code: 404, message: 'URL not found' }));
});
