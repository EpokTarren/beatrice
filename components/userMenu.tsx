/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Login } from './login';
import { sharex } from '../lib/uploader';
import type { Username } from '@prisma/client';
import styles from '../styles/UserMenu.module.css';
import { useSession, signOut } from 'next-auth/react';
import type { HandlerSession } from '../lib/endpoint';
import { FormEvent, FunctionComponent, useEffect, useState } from 'react';

export const UserMenu: FunctionComponent = () => {
	const { data: session } = useSession();

	const [menu, setMenu] = useState(false);

	const UploaderMenu: FunctionComponent = () => {
		const [usernames, setUsernames] = useState<Username[] | undefined>();
		const [uploaderType, setUploaderType] = useState<string>('file');

		const fileServerUrl =
			process.env.NEXT_PUBLIC_BEATRICE_FILES_URL?.replace(/\/$/, '') ||
			`${window?.location.protocol}//${window?.location.host}`;

		const redirectServerUrl =
			process.env.NEXT_PUBLIC_BEATRICE_REDIRECT_URL?.replace(/\/$/, '') ||
			`${window?.location.protocol}//${window?.location.host}/l`;

		const updateUsernames = () =>
			fetch('/api/usernames')
				.then((res) => res.json())
				.then((res) => {
					if (res.usernames.length > 1) {
						setUsernames(res.usernames);
					}
				});

		useEffect(() => {
			updateUsernames();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		return (
			<form
				className={styles.uploaderMenu}
				encType="multipart/form-data"
				onSubmit={(e: FormEvent<HTMLFormElement>) => {
					e.preventDefault();
					const formData = new FormData(e.target as HTMLFormElement);
					const { username, domain, redirect, random, root } = Object.fromEntries(formData);

					if (uploaderType === 'file') {
						sharex({
							api: `${window?.location.protocol}//${window?.location.host}`,
							url: (domain as string) || fileServerUrl,
							username: (username as string) || (session as HandlerSession).username,
							random: !!random,
							root: !!root,
							type: 'file',
						});
					} else {
						sharex({
							api: `${window?.location.protocol}//${window?.location.host}`,
							url: (redirect as string) || redirectServerUrl,
							username: (username as string) || (session as HandlerSession).username,
							random: !!random,
							root: !!root,
							type: 'url',
						});
					}
				}}
			>
				<h2>
					<button
						className={styles.close}
						onClick={(e) => {
							e.preventDefault();
							setMenu(false);
						}}
					>
						X
					</button>{' '}
					Uploader settings
				</h2>

				<br />

				<label htmlFor="domain">File server URL</label>
				<input type="text" name="domain" id="domain" placeholder={fileServerUrl} />
				<br />

				<label htmlFor="redirect">Redirect server URL</label>
				<input type="text" name="redirect" id="redirect" placeholder={redirectServerUrl} />

				<br />

				{usernames?.length && usernames.length > 1 ? (
					<>
						<label htmlFor="username">Username</label>
						<select name="username" id="username">
							{usernames.map(({ username }) => (
								<option value={username} key={username}>
									{username}
								</option>
							))}
						</select>
					</>
				) : (
					<></>
				)}

				<br />

				<label htmlFor="root">Upload as root</label>
				<input type="checkbox" name="root" id="root" />

				<br />

				<label htmlFor="random">Random URL</label>
				<input type="checkbox" name="random" id="random" />

				<br />

				<fieldset onChange={(e) => setUploaderType((e.target as any).value)}>
					<legend>Uploader type</legend>

					<input
						type="radio"
						value="file"
						name="file"
						id="file"
						checked={uploaderType === 'file'}
						onChange={() => {}}
					/>
					<label htmlFor="file">File</label>

					<input
						type="radio"
						value="link"
						name="link"
						id="link"
						checked={uploaderType === 'link'}
						onChange={() => {}}
					/>
					<label htmlFor="link">Shortener</label>
				</fieldset>

				<input type="submit" value="ShareX" />
				<style>{'body { overflow: hidden; }'}</style>
			</form>
		);
	};

	if (session)
		return (
			<>
				<nav className={styles.nav}>
					<div className={styles.has_dropdown}>
						<a href="#" onClick={(e) => e.preventDefault()}>
							<div className={styles.pfp_container}>
								<span>{(session as HandlerSession)?.username as string}</span>
								<img className={styles.pfp} src={session?.user?.image ?? ''} alt="" />
							</div>
						</a>

						<div className={styles.dropdown}>
							{(session as HandlerSession).admin ? (
								<>
									<hr />
									<span>
										<Link href="/admin">
											<a>Dashboard</a>
										</Link>
									</span>
								</>
							) : (
								<></>
							)}

							<hr />
							<span>Link account</span>
							<Login />

							<hr />
							<span>Uploader</span>
							{menu ? (
								<button onClick={() => setMenu(false)}>Close Menu</button>
							) : (
								<button onClick={() => setMenu(true)}>Open Menu</button>
							)}

							<hr />
							<button onClick={() => signOut()}>Sign out</button>
						</div>
					</div>
				</nav>

				{menu ? <UploaderMenu /> : <></>}
			</>
		);

	return <></>;
};
