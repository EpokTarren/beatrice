import { prisma } from './prisma';

export const getUser = async (username: string) =>
	await prisma.username
		.findUnique({ where: { username }, select: { id: true } })
		.then(
			async (username) =>
				username && (await prisma.user.findUnique({ where: { id: username?.id } })),
		);

export const getUserId = async (username: string) =>
	await prisma.username
		.findUnique({ where: { username }, select: { id: true } })
		.then(async (username) => username?.id);
