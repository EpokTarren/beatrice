require('license-checker').init(
	{ start: __dirname, excludePrivatePackages: true, production: true, customFormat: [] },
	async (err, packages) => {
		if (err) return console.error(err);

		const { marked } = require('marked');

		for (const key in packages) {
			if (key.startsWith('@next/swc-win32-x64-msvc')) {
				packages[key] = undefined;
				continue;
			}

			let { licenses, repository, url, licenseText, licenseFile } = packages[key];

			if (licenseFile?.includes('README') || !licenseText) licenseText = undefined;

			packages[key] = {
				licenses,
				repository,
				url,
				licenseText: licenseText && marked(licenseText),
			};
		}

		console.log('/* eslint-disable */');
		console.log(
			'export const packages: Record<string, { licenses: string; repository?: string; url?: string; licenseText?: string } > = ',
			JSON.stringify(packages, null, '\t'),
			';',
		);
	},
);
