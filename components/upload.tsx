import { Err, ErrProps } from './error';
import type { Username } from '@prisma/client';
import styles from '../styles/Upload.module.css';
import { Message, MessageProps } from './message';
import { ChangeEvent, FunctionComponent, MouseEventHandler, useEffect, useState } from 'react';
import { sharex } from '../lib/uploader';

export const Upload: FunctionComponent = () => {
	const [file, setFile] = useState<File | undefined>();
	const [filename, setFilename] = useState<string>('');

	const [path, setPath] = useState<string>();
	const [target, setTarget] = useState<string>();

	const [username, setUsername] = useState<string | undefined>();
	const [usernames, setUsernames] = useState<Username[] | undefined>();

	const [msg, setMsg] = useState<MessageProps['msg']>();
	const [err, setErr] = useState<ErrProps['err']>();
	const [files, setFiles] = useState<JSX.Element[]>([]);
	const [urls, setUrls] = useState<JSX.Element[]>([]);

	const fileServerUrl =
		process.env.NEXT_PUBLIC_BEATRICE_FILES_URL?.replace(/\/$/, '') ||
		`${window.location.protocol}//${window.location.host}`;

	const redirectServerUrl =
		process.env.NEXT_PUBLIC_BEATRICE_REDIRECT_URL?.replace(/\/$/, '') ||
		`${window.location.protocol}//${window.location.host}/l`;

	const stage = (event: ChangeEvent<HTMLInputElement>) => {
		stageFile(event.target.files?.[0]);
	};

	const stageFile = (file?: File) => {
		if (!file) return;

		setFilename(file.name);
		setFile(file);
	};

	const clear = () => setMsg(undefined);

	const upload = () => {
		if (file) {
			const body = new FormData();
			body.append('file', file);

			if (username) body.append('username', username);

			fetch('/api/upload', {
				method: 'POST',
				body,
			}).then(async (res) => {
				if (res.ok) {
					const response = await res.json();
					setMsg({ title: 'File uploaded', message: response.url, clear: () => setMsg(undefined) });
					updateRows();
				} else setErr(await res.json());
			});
		}
	};

	const shorten = () => {
		if (!path || !target) return;

		fetch('/api/shorten', {
			method: 'POST',
			body: JSON.stringify({ path, target, username }),
		}).then(async (res) => {
			if (res.ok) {
				const response = await res.json();
				setMsg({
					title: 'Link shortened',
					message: response.url,
					clear: () => setMsg(undefined),
				});
				updateRows();
			} else setErr(await res.json());
		});
	};

	const del = (url: string) => async () =>
		fetch(`/api/delete${url}`, {
			method: 'DELETE',
		}).then(async (res) => {
			if (res.ok) {
				setMsg({ title: 'File deleted', message: url, clear: () => setMsg(undefined) });
				updateRows();
			} else setErr(await res.json());
		});

	const copy =
		(content: string): MouseEventHandler =>
		(event) => {
			event.preventDefault();
			navigator.clipboard.writeText(content).then(
				() => setMsg({ title: 'Copied to clipboard', message: content, clear }),
				() => setErr({ message: 'Unable to copy URL' }),
			);
		};

	const updateRows = async () => {
		const response = await fetch('/api/files');

		if (response.ok) {
			const { files } = await response.json();

			setFiles(
				files.map((location: string) => (
					<li key={location}>
						<a href={`${fileServerUrl}${location}`} target="_blank" rel="noreferrer">
							{location}
						</a>
						<button onClick={copy(`${fileServerUrl}${location}`)}>copy</button>
						<button onClick={del(location)}>delete</button>
					</li>
				)),
			);
		}
	};

	const delUrl = (url: string) => async () =>
		fetch(`/api/delete/l${url}`, {
			method: 'DELETE',
		}).then(async (res) => {
			if (res.ok) {
				setMsg({ title: 'URL delted', message: url, clear: () => setMsg(undefined) });
				updateUrls();
			} else setErr(await res.json());
		});

	const updateUrls = async () => {
		const response = await fetch('/api/urls');

		if (response.ok)
			setUrls(
				(await response.json())?.urls?.map((location: string) => (
					<li key={location}>
						<a href={`${redirectServerUrl}${location}`} target="_blank" rel="noreferrer">
							/l{location}
						</a>
						<button onClick={copy(`${redirectServerUrl}${location}`)}>copy</button>
						<button onClick={delUrl(location)}>delete</button>
					</li>
				)),
			);
	};

	const updateUsernames = () =>
		fetch('/api/usernames')
			.then((res) => res.json())
			.then((res) => {
				if (res.usernames.length > 1) {
					setUsernames(res.usernames);
					setUsername(res.usernames[0].username);
				}
			});

	useEffect(() => {
		updateRows();
		updateUsernames();
		updateUrls();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={styles.upload}>
			<div className={styles.message}>
				<Message msg={msg} />
			</div>

			<div className={styles.uploadBox}>
				<label htmlFor="upload">
					<input type="file" name="upload" id="upload" onChange={stage} />
					<span>{filename ? filename : <span className={styles.default}>upload a file</span>}</span>
				</label>

				<br />

				<button type="submit" onClick={upload}>
					Upload
				</button>
			</div>

			<div className={styles.shorten}>
				<input
					type="text"
					name="url"
					id="url"
					placeholder="https://example.com"
					onChange={(e) => setTarget(e.target.value)}
				/>
				<input
					type="text"
					name="url"
					id="url"
					placeholder="/example"
					onChange={(e) => setPath(e.target.value)}
				/>

				<button onClick={shorten}>Shorten</button>

				{usernames?.length && usernames.length > 1 ? (
					<div>
						<span>Post as</span>
						<select name="username" id="username" onChange={(e) => setUsername(e.target.value)}>
							{usernames.map(({ username }) => (
								<option value={username} key={username}>
									{username}
								</option>
							))}
						</select>

						<br />
						<span>or using</span>
						<button onClick={() => sharex({ username })}>ShareX</button>
					</div>
				) : (
					<></>
				)}
			</div>

			<Err err={err} />

			<ul>
				<h3>Files</h3>
				{files}
			</ul>
			<ul>
				<h3>Links</h3>
				{urls}
			</ul>
		</div>
	);
};
