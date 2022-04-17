import { resolve } from 'path';
import { readFileSync } from 'fs';
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
	code: number;
	licenses: any;
};

let licenses: any = undefined;

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	res.status(200).json({ code: 200, licenses });
}
