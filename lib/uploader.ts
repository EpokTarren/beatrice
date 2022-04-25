const download = (filename: string, content: string) => {
	const elem = document.createElement('a');
	elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
	elem.setAttribute('download', filename);
	elem.click();
	elem.remove();
};

export const sharex = async (session: { username?: string }) => {
	const response = await fetch('/api/jwt', { method: 'GET' }).then((res) => res.json());

	if (response.code !== 200) return;

	const url = `${window.location.protocol}//${window.location.host}`;
	const host =
		process.env.NEXT_PUBLIC_BEATRICE_FILES_URL?.replace(/https?:\/\/|\/$/g, '') ||
		window.location.host;
	const fileServerUrl = process.env.NEXT_PUBLIC_BEATRICE_FILES_URL?.replace(/\/$/, '') || url;

	const uploader = {
		Version: '13.3.0',
		Name: `${session?.username}@${host}`,
		DestinationType: 'ImageUploader, TextUploader, FileUploader',
		RequestMethod: 'POST',
		RequestURL: `${url}/api/upload`,
		Headers: { jwt: response.jwt },
		Body: 'MultipartFormData',
		FileFormName: 'file',
		URL: `${fileServerUrl}$json:url$`,
		ThumbnailURL: `${fileServerUrl}$json:url$`,
		DeletionURL: `${url}/api/delete$json:url$`,
		ErrorMessage: '$json:message$',
	};

	download(`${session?.username}.${host}.sxcu`, JSON.stringify(uploader, undefined, '\t'));
};
