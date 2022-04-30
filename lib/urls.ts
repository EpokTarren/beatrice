export const fileServerUrl =
	process.env.NEXT_PUBLIC_BEATRICE_FILES_URL?.replace(/\/$/, '') ||
	`${window.location.protocol}//${window.location.host}`;

export const redirectServerUrl =
	process.env.NEXT_PUBLIC_BEATRICE_REDIRECT_URL?.replace(/\/$/, '') ||
	`${window.location.protocol}//${window.location.host}/l`;
