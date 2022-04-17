import { prisma } from '../../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { contentType } from '../../../lib/contentType';

type Error = {
	code: number;
	message: string;
};
export default async function handler(req: NextApiRequest, res: NextApiResponse<Buffer | Error>) {
	if (req.method !== 'GET')
		return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

	if (!Array.isArray(req.query.path) || req.query.path.length < 2)
		return res.status(404).json({ code: 404, message: 'File not found' });

	const [user, filename] = req.query.path;
	const url = `/${user}/${filename}`;
	const file = await prisma.file.findUnique({ where: { url }, select: { content: true } });

	if (file)
		return res.status(200).setHeader('Content-Type', contentType(filename)).send(file.content);

	res.status(404).json({ code: 404, message: 'File not found' });
}
