import mime from 'mime-types';

export function contentType(fileName: string) {
	let t = mime.lookup(fileName);
	switch (t) {
		case false:
		case 'text/xml':
		case 'text/html':
		case 'text/javascript':
		case 'application/xml':
		case 'application/atom+xml':
		case 'application/xhtml+xml':
			return 'text/plain';
		default:
			return t;
	}
}
