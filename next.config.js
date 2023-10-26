/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	output: 'standalone',

	async rewrites() {
		return [
			{
				source: '/:user/:file',
				destination: '/api/file/:user/:file',
			},
			{
				source: '/l/:user/:link',
				destination: '/api/url/:user/:link',
			},
		];
	},
};

module.exports = nextConfig;
