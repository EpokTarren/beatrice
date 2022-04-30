const download = (filename: string, content: string) => {
	const elem = document.createElement('a');
	elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
	elem.setAttribute('download', filename);
	elem.click();
	elem.remove();
};

export interface ShareXOptions {
	api: string;
	url: string;
	type: 'file' | 'url';
	root: boolean;
	random: boolean;
	username: string;
}

export const sharex = async ({ api, url, type, root, random, username }: ShareXOptions) => {
	const response = await fetch('/api/jwt', {
		method: 'POST',
		body: username,
	}).then((res) => res.json());

	if (response.code !== 200) return;

	const host = url.replace(/https?:\/\/|\/$/g, '');

	const common = {
		Version: '13.7.0',
		Name: `${username}@${host}`,
		RequestMethod: 'POST',
		Parameters: random ? { r: null } : undefined,
		Headers: { jwt: response.jwt },
		ErrorMessage: '$json:message$',
	};

	let uploader;

	if (type === 'file') {
		uploader = {
			...common,
			DestinationType: 'ImageUploader, TextUploader, FileUploader',
			RequestURL: `${api.replace(/\/$/g, '')}/api/upload`,
			Body: 'MultipartFormData',
			FileFormName: 'file',
			URL: root ? `${url.replace(/\/$/g, '')}/$json:filename$` : `${url}$json:url$`,
			DeletionURL: `${api.replace(/\/$/g, '')}/api/delete$json:url$`,
		};
	} else {
		uploader = {
			...common,
			DestinationType: 'URLShortener',
			RequestURL: `${api.replace(/\/$/g, '')}/api/shorten`,
			Body: 'JSON',
			Data: JSON.stringify({
				target: '$input$',
				path: random ? '$prompt$' : undefined,
			}),
			URL: root ? `${url.replace(/\/$/g, '')}$json:path$` : `${url}$json:url$`,
			DeletionURL: `${api.replace(/\/$/g, '')}/api/delete/l$json:url$`,
		};
	}

	const filename = `${root ? '' : username}${random ? '.random' : ''}@${host}.sxcu`;
	download(filename, JSON.stringify(uploader, undefined, '\t'));
};
