import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';

type Data = {
	code: number;
	message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (req.method !== 'POST')
		return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

	const session = await getSession({ req });

	if (!session) return res.status(403).json({ code: 403, message: 'Please login first' });

	if (session.username !== null)
		return res.status(400).json({ code: 400, message: 'You already have a username' });

	try {
		if (typeof session.uid !== 'string')
			return res.status(401).json({ code: 401, message: 'Invalid session' });

		if (typeof req.body !== 'string')
			return res.status(400).json({ code: 400, message: 'No username provided' });

		const username = req.body.toLowerCase().trim();

		if (username.length < 1)
			return res.status(400).json({ code: 400, message: 'Invalid username provided' });

		if (username === 'api')
			return res.status(409).json({ code: 409, message: 'Reserved username provided' });

		if (username !== encodeURIComponent(username))
			return res.status(400).json({ code: 400, message: 'Please select a url safe username' });

		await prisma.user
			.update({
				where: { id: session.uid },
				data: { username },
			})
			.then(() => res.status(200).json({ code: 200, message: 'OK' }))
			.catch(() => res.status(409).json({ code: 409, message: 'Username is already taken' }));
	} catch (error: any) {
		res.status(error?.responseCode ?? 400).json({
			code: error?.responseCode ?? 400,
			message: error?.message ?? 'Unable to parse file',
		});
	}
}
