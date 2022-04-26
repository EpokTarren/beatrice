import * as jwt from 'jsonwebtoken';
import type { NextApiResponse } from 'next';
import { getUserId } from '../../lib/getUser';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: number;
	jwt: string;
}

export type Output = Success | EndpointError;

const secret = process.env['NEXTAUTH_SECRET'];
if (!secret) throw new Error('Must have a NEXTAUTH_SECRET in ENV');

export default endpoint(['POST'], async (req, res: NextApiResponse<Output>, session) => {
	if (typeof session.username !== 'string')
		return res.status(401).json({ code: 401, message: 'Please set a username' });

	if (typeof req.body === 'string')
		if ((await getUserId(req.body)) !== session.uid)
			return res.status(403).json({ code: 403, message: 'You may only request a JWT as yourself' });
		else session.username = req.body;

	const token = jwt.sign(session, secret, { expiresIn: '30d' });
	res.status(200).json({ code: 200, jwt: token });
});
