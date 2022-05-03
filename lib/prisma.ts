import {
	Account,
	BannedIP,
	PrismaClient,
	User,
	Username,
	VerificationToken,
	Prisma,
} from '@prisma/client';
import { Session } from 'inspector';

declare global {
	var prisma: PrismaClient | undefined;
}

export let prisma: PrismaClient;

const caches: { [key in Prisma.ModelName]: Map<string, any> } = {
	Account: new Map<string, Account>(),
	BannedIP: new Map<string, BannedIP>(),
	Session: new Map<string, Session>(),
	User: new Map<string, User>(),
	Username: new Map<string, Username>(),
	File: new Map<string, File>(),
	URL: new Map<string, URL>(),
	VerificationToken: new Map<any, VerificationToken>(),
};

const init = () => {
	const minute = 60 * 1000;
	const time = Number(process.env.BEATRICE_CACHE_TIME);
	const cacheTime = isFinite(time) ? time * minute : 0;

	const p = new PrismaClient();

	p.$use(async (params, next) => {
		switch (params.action) {
			case 'findUnique':
				if (params.model) {
					if (cacheTime === 0 && (params.model === 'File' || params.model === 'URL')) break;

					const id =
						params.model === 'VerificationToken'
							? params.args?.where?.identifier
							: params.model === 'Session'
							? params.args?.where?.sessionToken
							: params.model === 'File' || params.model === 'URL'
							? params.args?.where?.url
							: params.args?.where?.id;

					if (typeof id !== 'string') break;

					const map: Map<string, any> = caches[params.model];

					let res = map.get(id);

					if (res) return res;

					res = await next(params);

					if (params.model === 'File' ? 25 : map.size > 100) {
						for (let i = 0; i < 5; ++i) {
							map.delete(map.keys().next().value);
						}
					}

					if (params.model === 'File' || params.model === 'URL') {
						setTimeout(() => {
							map.delete(id);
						}, cacheTime);
					}

					map.set(id, res);

					return res;
				}

				break;

			case 'delete':
			case 'update':
				if (params.model) {
					const res = await next(params);
					const map = caches[params.model];

					const id =
						params.model === 'VerificationToken'
							? res?.identifier
							: params.model === 'Session'
							? res?.sessionToken
							: params.model === 'File' || params.model === 'URL'
							? res?.url || res?.id
							: res?.id;

					if (typeof id === 'string')
						for (const key of map.keys()) {
							if (
								key === id ||
								((params.model === 'File' || params.model === 'URL') && map.get(key).id === id)
							) {
								map.delete(key);
							}
						}

					return res;
				}

				break;

			case 'deleteMany':
			case 'updateMany':
				if (params.model) caches[params.model].clear();

				break;
		}

		return await next(params);
	});

	return p;
};

if (process.env.NODE_ENV === 'production') prisma = init();
else {
	if (!global.prisma) global.prisma = init();

	prisma = global.prisma;
}
export default prisma;
