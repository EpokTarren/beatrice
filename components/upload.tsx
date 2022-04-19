import { Err, ErrProps } from './error';
import { Message, MessageProps } from './message';
import styles from '../styles/Upload.module.css';
import { ChangeEvent, FunctionComponent, MouseEventHandler, useEffect, useState } from 'react';

export const Upload: FunctionComponent = () => {
	const [file, setFile] = useState<File | undefined>();
	const [filename, setFilename] = useState<string>('');
	const [msg, setMsg] = useState<MessageProps['msg']>();
	const [err, setErr] = useState<ErrProps['err']>();
	const [rows, setRows] = useState<JSX.Element[]>([]);

	const fileServerUrl =
		process.env.NEXT_PUBLIC_BEATRICE_FILES_URL?.replace(/\/$/, '') ||
		`${window.location.protocol}//${window.location.host}`;

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

	const del = (url: string) => async () =>
		fetch('/api/delete', {
			method: 'DELETE',
			body: url,
		}).then(async (res) => {
			if (res.ok) {
				setMsg({ title: 'File delted', message: url, clear: () => setMsg(undefined) });
				updateRows();
			} else setErr(await res.json());
		});

	const copy =
		(location: string): MouseEventHandler =>
		(event) => {
			event.preventDefault();
			const url = `${fileServerUrl}${location}`;
			navigator.clipboard.writeText(url).then(
				() => setMsg({ title: 'URL copied', message: url, clear }),
				() => setErr({ message: 'Unable to copy URL' }),
			);
		};

	const updateRows = async () => {
		const response = await fetch('/api/files');

		if (response.ok) {
			const { files } = await response.json();

			setRows(
				files.map((location: string) => (
					<li key={location}>
						<a href={`${fileServerUrl}${location}`} target="_blank" rel="noreferrer">
							{location}
						</a>
						<button onClick={copy(location)}>copy</button>
						<button onClick={del(location)}>delete</button>
					</li>
				)),
			);
		}
	};

	useEffect(() => {
		updateRows();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={styles.upload}>
			<Message msg={msg} />

			<label htmlFor="upload">
				<input type="file" name="upload" id="upload" onChange={stage} />
				<span>{filename ? filename : <span className={styles.default}>upload a file</span>}</span>
			</label>

			<br />

			<button type="submit" onClick={upload}>
				Upload
			</button>

			<Err err={err} />

			<ul>{rows}</ul>
		</div>
	);
};
