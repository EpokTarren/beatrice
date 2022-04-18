import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { endpoint, EndpointError } from '../../lib/endpoint';
import { prisma } from '../../lib/prisma';

export interface Success {
	code: number;
	message: string;
}

export type Output = Success | EndpointError;

export default endpoint(
	['POST'],
	async (req: NextApiRequest, res: NextApiResponse<Output>, session) => {
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
	},
);
