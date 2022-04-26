import type { NextApiResponse } from 'next';
import { prisma } from '../../../../../lib/prisma';
import { getUserId } from '../../../../../lib/getUser';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: 201;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['POST'], async (req, res: NextApiResponse<Output>, _s, un) => {
	const id = await getUserId(un);

	if (!id) return res.status(404).json({ code: 404, message: 'User not found' });

	if (typeof req.body !== 'string')
		return res.status(400).json({ code: 400, message: 'No username provided' });

	const username = req.body.toLowerCase().trim();

	if (username.length < 1)
		return res.status(400).json({ code: 400, message: 'Invalid username provided' });

	if (username === 'api')
		return res.status(409).json({ code: 409, message: 'Reserved username provided' });

	if (username !== encodeURIComponent(username))
		return res.status(400).json({ code: 400, message: 'Please select a url safe username' });

	await prisma.username
		.create({ data: { username, id } })
		.then(() => res.status(201).json({ code: 201 }))
		.catch(() => res.status(409).json({ code: 409, message: 'Username is already taken' }));
});
