import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';

type Data = {
	code: number;
	message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (req.method !== 'DELETE')
		return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

	const session = await getSession({ req });

	if (!session) return res.status(403).json({ code: 403, message: 'Please login first' });

	if (typeof req.body !== 'string') return res.status(400).json({ code: 400, message: 'No URL' });

	if (!req.body.startsWith('/')) return res.status(400).json({ code: 400, message: 'Invalid URL' });

	if (typeof session.uid !== 'string')
		return res.status(401).json({ code: 401, message: 'Invalid session' });

	if (typeof session.username !== 'string')
		return res.status(401).json({ code: 401, message: 'Invalid session' });

	if (!req.body.startsWith('/' + session.username))
		return res.status(403).json({ code: 403, message: 'You do not own that file' });

	const file = await prisma.file.findUnique({ where: { url: req.body } });

	if (!file) return res.status(404).json({ code: 404, message: 'File not found' });

	if (file.userId !== session.uid)
		return res.status(403).json({ code: 403, message: 'You do not own that file' });

	await prisma.file
		.delete({ where: { url: req.body } })
		.then(() => res.status(200).json({ code: 200, message: 'OK' }))
		.catch(() => res.status(500).json({ code: 500, message: 'Unable to delete file' }));
}
