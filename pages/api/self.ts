import { prisma } from '../../lib/prisma';
import { endpoint, EndpointError } from '../../lib/endpoint';
import type { NextApiRequest, NextApiResponse } from 'next';

export interface Success {
	code: number;
	message: string;
	accounts?: string[];
}

export type Output = Success | EndpointError;

export default endpoint(
	['GET'],
	async (_req: NextApiRequest, res: NextApiResponse<Output>, { uid }) => {
		await prisma.account
			.findMany({
				where: { userId: uid },
				select: { provider: true },
			})
			.then(async (accounts) =>
				res
					.status(200)
					.json({ code: 200, message: 'OK', accounts: accounts.map(({ provider }) => provider) }),
			)
			.catch(() => res.status(500).json({ code: 500, message: 'Internal Server Error' }));
	},
);
