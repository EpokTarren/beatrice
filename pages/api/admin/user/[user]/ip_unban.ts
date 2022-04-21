import { BannedIP } from '.prisma/client';
import type { NextApiResponse } from 'next';
import { unban } from '../../../../../lib/ipBan';
import { prisma } from '../../../../../lib/prisma';
import { adminEndpoint, EndpointError } from '../../../../../lib/endpoint';

export interface Success {
	code: number;
	ban: BannedIP;
}

export type Output = Success | EndpointError;

export default adminEndpoint(['PATCH'], async (req, res: NextApiResponse<Output>, _, _username) => {
	let id = Number(req.body);
	if (isNaN(id) || id !== Math.floor(id))
		return res.status(400).send({ code: 400, message: 'Please provide an IP ban id unban.' });

	await prisma.bannedIP
		.update({ where: { id }, data: { active: false, expiredAt: new Date() } })
		.then((ban) => {
			if (ban) {
				unban(ban.ip);
				res.status(200).json({ code: 200, ban });
			}

			res.status(404).json({ code: 404, message: 'Ban not found' });
		})
		.catch((err) =>
			res.status(500).json({ code: 500, message: err?.message || 'Internal server error' }),
		);
});
