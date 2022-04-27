import type { NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { getUserId } from '../../../../lib/getUser';
import { endpoint, EndpointError } from '../../../../lib/endpoint';

export interface Success {
	code: 200;
}

export type Output = Success | EndpointError;

export default endpoint(['GET', 'DELETE'], async (req, res: NextApiResponse<Output>, session) => {
	if (!Array.isArray(req.query.path) || req.query.path.length < 2)
		return res.status(404).json({ code: 404, message: 'File not found' });

	const [user, filename] = req.query.path;

	if (user !== session.username && (await getUserId(user)) !== session.uid)
		return res.status(403).json({ code: 403, message: 'You do not own said link, cannot delete.' });

	const url = `/${user}/${filename}`;

	await prisma.uRL
		.delete({ where: { url } })
		.then(() => res.status(200).json({ code: 200 }))
		.catch(() => res.status(404).json({ code: 404, message: 'Unable to find a file to delete' }));
});
