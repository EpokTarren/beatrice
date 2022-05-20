import { prisma } from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { EndpointError } from '../../../lib/endpoint';

const maxAge = parseInt(process.env['BEATRICE_MAX_AGE'] || '', 10);
const cacheControl = isFinite(maxAge) && maxAge > 0 ? `max-age=${maxAge}` : undefined;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<string | EndpointError>,
) {
	if (req.method !== 'GET')
		return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

	if (!Array.isArray(req.query.path) || req.query.path.length < 2)
		return res.status(404).json({ code: 404, message: 'URL not found' });

	const [user, filename] = req.query.path;
	const url = `/${user}/${filename}`;
	const redirect = await prisma.uRL.findUnique({ where: { url }, select: { target: true } });

	if (redirect) {
		if (cacheControl) res.setHeader('Cache-Control', cacheControl);

		return res.status(301).setHeader('Location', redirect.target).send('');
	}

	res.status(404).json({ code: 404, message: 'URL not found' });
}
