import { User } from '@prisma/client';
import type { NextApiResponse } from 'next';
import { getUser } from '../../../../../lib/getUser';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: 200;
	user: User;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['GET'], async (_req, res: NextApiResponse<Output>, _, username) => {
	await getUser(username)
		.then((user) =>
			user
				? res.status(200).json({ code: 200, user })
				: res.status(404).json({ code: 404, message: 'User not found' }),
		)
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
