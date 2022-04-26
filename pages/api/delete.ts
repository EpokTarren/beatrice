import { prisma } from '../../lib/prisma';
import type { NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';
import { getUserId } from '../../lib/getUser';

export interface Success {
	code: number;
	message: string;
}

export type Output = Success | EndpointError;

export default endpoint(['DELETE'], async (req, res: NextApiResponse<Output>, session) => {
	if (typeof req.body !== 'string') return res.status(400).json({ code: 400, message: 'No URL' });

	if (req.body.match(/\//g)?.length !== 2)
		return res.status(400).json({ code: 400, message: 'Invalid URL' });

	const user = req.body.split(/\//g).filter((section) => section)[0];

	if (!user) return res.status(400).json({ code: 400, message: 'Invalid URL' });

	if (user !== session.username && (await getUserId(user)) !== session.uid)
		return res.status(403).json({ code: 403, message: 'You do not own said file, cannot delete.' });

	await prisma.file
		.delete({ where: { url: req.body } })
		.then(() => res.status(200).json({ code: 200, message: 'OK' }))
		.catch(() => res.status(404).json({ code: 404, message: 'File not found' }));
});
