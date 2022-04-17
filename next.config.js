/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	experimental: {
		outputStandalone: true,
	},

	async rewrites() {
		return [
			{
				source: '/:user/:file',
				destination: '/api/file/:user/:file',
			},
		];
	},
};

module.exports = nextConfig;
