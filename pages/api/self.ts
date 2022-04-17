import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../lib/prisma';

type Data = {
	code: number;
	message: string;
	accounts?: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (req.method !== 'GET')
		return res.status(405).json({ code: 405, message: 'Method Not Allowed' });

	const session = await getSession({ req });

	if (!session) return res.status(403).json({ code: 403, message: 'Please login first' });

	if (typeof session.uid !== 'string')
		return res.status(401).json({ code: 401, message: 'Invalid session' });

	await prisma.account
		.findMany({
			where: { userId: session.uid },
			select: { provider: true },
		})
		.then(async (accounts) =>
			res
				.status(200)
				.json({ code: 200, message: 'OK', accounts: accounts.map(({ provider }) => provider) }),
		)
		.catch(() => res.status(500).json({ code: 500, message: 'Internal Server Error' }));
}
