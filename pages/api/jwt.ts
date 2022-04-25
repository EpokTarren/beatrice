import * as jwt from 'jsonwebtoken';
import type { NextApiResponse } from 'next';
import { endpoint, EndpointError } from '../../lib/endpoint';

export interface Success {
	code: number;
	jwt: string;
}

export type Output = Success | EndpointError;

const secret = process.env['NEXTAUTH_SECRET'];
if (!secret) throw new Error('Must have a NEXTAUTH_SECRET in ENV');

export default endpoint(['GET'], async (_req, res: NextApiResponse<Output>, session) => {
	const token = jwt.sign(session, secret, { expiresIn: '30d' });
	res.status(200).json({ code: 200, jwt: token });
});
