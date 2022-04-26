import { prisma } from '../../lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: 201;
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

		const err = () => res.status(409).json({ code: 409, message: 'Username is already taken' });

		await prisma.username
			.create({ data: { username, id: session.uid } })
			.then(() =>
				prisma.user
					.update({ where: { id: session.uid }, data: { username } })
					.then(() => res.status(200).json({ code: 201 }))
					.catch(err),
			)
			.catch(err);
	},
);
