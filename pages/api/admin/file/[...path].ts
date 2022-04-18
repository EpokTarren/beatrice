import { File } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { endpoint, EndpointError } from '../../../../lib/endpoint';

export interface Success {
	code: number;
	file: File;
}

export type Output = Success | EndpointError;

export default endpoint(['GET', 'DELETE'], async (req, res: NextApiResponse<Output>, session) => {
	if (!session.admin)
		return res
			.status(403)
			.json({ code: 403, message: 'You need to be an administrator to view this page' });

	if (!Array.isArray(req.query.path) || req.query.path.length < 2)
		return res.status(404).json({ code: 404, message: 'File not found' });

	const [user, filename] = req.query.path;
	const url = `/${user}/${filename}`;

	if (req.method === 'GET')
		return await prisma.file
			.findUnique({ where: { url } })
			.then((file) =>
				file
					? res.status(200).json({ code: 200, file })
					: res.status(404).json({ code: 404, message: 'File not found' }),
			)
			.catch((err) =>
				res.status(500).json({ code: 500, message: err?.message || 'Datbase error' }),
			);

	await prisma.file
		.delete({ where: { url } })
		.then((file) => res.status(200).json({ code: 200, file }))
		.catch(() => res.status(404).json({ code: 404, message: 'File not found' }));
});
