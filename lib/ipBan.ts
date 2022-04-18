import { prisma } from './prisma';
import { User } from '@prisma/client';

const ips = new Map<string, undefined>();

prisma.bannedIP
	.findMany({ select: { ip: true } })
	.then((bans) => bans.map(({ ip }) => ip).forEach((ip) => ips.set(ip, undefined)));

export const ban = async (ip: string, user: User) => {
	const ban = await prisma.bannedIP.create({ data: { ip, userId: user.id } });
	ips.set(ban.ip, undefined);
};

export const isBanned = (ip: string) => ips.has(ip);
