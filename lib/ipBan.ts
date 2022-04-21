import { prisma } from './prisma';
import { User } from '@prisma/client';

declare global {
	var ips: Map<string, undefined> | undefined;
}

let ips: Map<string, undefined>;

if (process.env.NODE_ENV === 'production') ips = new Map();
else {
	if (!global.ips) global.ips = new Map();
	ips = global.ips;
}

prisma.bannedIP.findMany({ select: { ip: true, active: true } }).then((bans) =>
	bans
		.filter(({ active }) => active)
		.map(({ ip }) => ip)
		.forEach((ip) => ips.set(ip, undefined)),
);

export const ban = async (ip: string, user: User) => {
	const ban = await prisma.bannedIP.create({ data: { ip, userId: user.id } });
	ips.set(ban.ip, undefined);
};

export const unban = async (ip: string) => {
	ips.delete(ip);
};

export const isBanned = (ip: string) => ips.has(ip);
