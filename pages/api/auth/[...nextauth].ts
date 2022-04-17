import NextAuth from 'next-auth';
import prisma from '../../../lib/prisma';
import GitHubProvider from 'next-auth/providers/github';
import DiscordProvider from 'next-auth/providers/discord';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

const allowSignUp = process.env.ALLOW_SIGN_UP?.toLowerCase() !== 'false';

export default NextAuth({
	adapter: PrismaAdapter(prisma),

	callbacks: {
		async signIn({ user }) {
			user.email = undefined;
			return allowSignUp || (await prisma.user.findUnique({ where: { id: user.id } })) !== null;
		},

		async session({ session, user }) {
			return { ...session, username: user.username, uid: user.id };
		},
	},

	providers: [
		DiscordProvider({
			authorization: 'https://discord.com/api/oauth2/authorize?scope=identify',
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
		}),

		GitHubProvider({
			authorization: 'https://github.com/login/oauth/authorize',
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
		}),
	],
});
