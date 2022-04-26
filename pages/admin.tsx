/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { FunctionComponent, useState } from 'react';

import styles from '../styles/Admin.module.css';
import { Err, ErrProps } from '../components/error';
import type { BannedIP, File, User, Username } from '@prisma/client';
import { Message, MessageProps } from '../components/message';
import { Confirmation, ConfirmationProps } from '../components/confimation';

interface UserDetailProps {
	user?: User;
	eventHandler: (event: 'ban' | 'unban' | 'deleteContent' | 'banIp') => void;
}

const UserDetails: FunctionComponent<UserDetailProps> = ({ user, eventHandler }) =>
	user ? (
		<>
			<h1>
				<img src={user.image || ''} alt="profile picture" className={styles.pfp} />
				{user.username}
			</h1>
			<p>Admin: {user.admin ? 'true' : 'false'}</p>
			<p>Banned: {user.banned ? 'true' : 'false'}</p>
			{user.banned ? (
				<button onClick={() => eventHandler('unban')}>Unban Account</button>
			) : (
				<button onClick={() => eventHandler('ban')}>Ban Account</button>
			)}

			<button onClick={() => eventHandler('deleteContent')}>Delete All Content</button>
			<button onClick={() => eventHandler('banIp')}>Ban all IP addresses</button>
			<hr />
		</>
	) : (
		<></>
	);

const Admin: NextPage = () => {
	const [username, setUsername] = useState('');
	const [user, setUser] = useState<User | undefined>();
	const [files, setFiles] = useState<File[] | undefined>();
	const [ips, setIps] = useState<BannedIP[] | undefined>();
	const [usernames, setUsernames] = useState<Username[] | undefined>();
	const [additionalUsername, setAdditionalUsername] = useState<string | undefined>();

	const [err, setErr] = useState<ErrProps['err']>();
	const [confirmation, setConfirmation] = useState<ConfirmationProps['msg']>();
	const [message, setMessage] = useState<MessageProps['msg']>();

	const searchUsernames = async () => {
		const response = await fetch(`/api/admin/user/${username}/usernames`);
		const data = await response.json();

		if (response.ok) setUsernames(data.usernames);
		else {
			setIps(undefined);
			setErr(data);
		}
	};

	const searchIps = async () => {
		const response = await fetch(`/api/admin/user/${username}/banned_ips`);
		const data = await response.json();

		if (response.ok) setIps(data.ips);
		else {
			setIps(undefined);
			setErr(data);
		}
	};

	const searchFiles = async () => {
		const response = await fetch(`/api/admin/user/${username}/files`);
		const data = await response.json();

		if (response.ok) setFiles(data.files);
		else {
			setFiles(undefined);
			setErr(data);
		}
	};

	const search = async () => {
		setErr(undefined);
		const response = await fetch('/api/admin/user/' + username);
		const res = await response.json();

		if (response.ok) {
			setUser(res?.user);
			searchFiles();
			searchIps();
			searchUsernames();
		} else {
			setUser(undefined);
			setErr(res);
		}
	};

	const del = (url: string) => () =>
		fetch(`/api/admin/file/${url}`, { method: 'DELETE' }).then(async (res) =>
			res.ok ? search() : setErr(await res.json()),
		);

	const ipBan = (ip: string) => () => {
		setConfirmation({
			title: 'Are you sure you want to ban this IP?',
			message: `IP: ${ip}`,
			response: async (answer) => {
				setConfirmation(undefined);
				if (!answer) return;

				if (!user) return setErr({ message: 'No user selected, unable to take action.' });

				const response = await fetch(`/api/admin/user/${user.username}/ip_ban`, {
					method: 'POST',
					body: ip,
				});

				if (!response.ok) setErr(await response.json());
				else {
					setMessage(undefined);
					setMessage({
						ms: 20000,
						title: 'Succesfully banned IP',
						message: `${ip} has been banned, note that banning an IP does not automatically ban the user.`,
						clear: () => setMessage(undefined),
					});
				}
			},
		});
	};

	const ipUnban = (ban: BannedIP) => () =>
		setConfirmation({
			title: 'Are you sure you want to unban this IP?',
			message: `IP: ${ban.ip}`,
			response: async (answer) => {
				setConfirmation(undefined);
				if (!answer) return;

				if (!user) return setErr({ message: 'No user selected, unable to take action.' });

				const response = await fetch(`/api/admin/user/${user.username}/ip_unban`, {
					method: 'PATCH',
					body: ban.id.toString(),
				});

				if (!response.ok) setErr(await response.json());
				else {
					setMessage(undefined);
					setMessage({
						ms: 20000,
						title: 'Succesfully unbanned IP',
						message: `${ban.ip} has been unbanned.`,
						clear: () => setMessage(undefined),
					});
					searchIps();
				}
			},
		});

	const eventHandler = (event: 'ban' | 'unban' | 'deleteContent' | 'banIp') => {
		switch (event) {
			case 'ban':
			case 'unban':
				return setConfirmation({
					title: `Are you sure you want to ${event} ${user?.username}?`,
					message: 'This action is reversible.',
					response: async (answer) => {
						setConfirmation(undefined);

						if (!answer) return;
						if (!user) return setErr({ message: 'No user selected, unable to take action.' });

						const response = await fetch(`/api/admin/user/${user.username}/${event}`, {
							method: 'PATCH',
						});

						if (!response.ok) setErr(await response.json());
						else setUser((await response.json()).user);
					},
				});

			case 'deleteContent':
				return setConfirmation({
					title: `Are you sure you want to delete all of the user ${user?.username} content?`,
					message: 'This action is non reversible and will lead to permanent data loss.',
					response: async (answer) => {
						setConfirmation(undefined);

						if (!answer) return;
						if (!user) return setErr({ message: 'No user selected, unable to take action.' });

						const response = await fetch(`/api/admin/user/${user.username}/delete_files`, {
							method: 'DELETE',
						});

						if (!response.ok) setErr(await response.json());
						else setFiles([]);
					},
				});

			case 'banIp':
				return setConfirmation({
					title: `Are you sure you want to ban all of the user ${user?.username} IP adresses?`,
					message:
						'This action is reversible by unbanning each IP manually, this will not delete any files.',
					response: async (answer) => {
						setConfirmation(undefined);

						if (!answer) return;
						if (!files) return setErr({ message: 'Unable to load the users files.' });

						const toBan = [
							...files.reduce((set, { ip }) => {
								set.add(ip);
								return set;
							}, new Set<string>()),
						];

						const failed: string[] = [];
						const succesfull: string[] = [];

						await Promise.all(
							toBan.map(async (ip) => {
								const response = await fetch(`/api/admin/user/${user?.username}/ip_ban`, {
									method: 'POST',
									body: ip,
								});

								if (!response.ok) failed.push(ip);
								else succesfull.push(ip);
							}),
						);

						if (failed.length)
							setErr({ message: 'Failed to ban the following ips:\n' + failed.join('\n') });

						if (succesfull.length) {
							setMessage(undefined);
							setMessage({
								title: 'Banned the following ips',
								message: succesfull.join('\n'),
								clear: () => setMessage(undefined),
							});
						}

						searchIps();
					},
				});
		}
	};

	const BanDetails = (ban: BannedIP) => (
		<li key={ban.id}>
			<span>Active:</span>
			<span>{ban.active ? 'true' : 'false'}</span>

			<span>Date:</span>
			<span>{ban.createdAt?.toString() || 'Unkown'}</span>

			<span>Expired:</span>
			<span>{ban?.expiredAt?.toString() || 'IP is still banned'}</span>

			<span>IP</span>
			<span>{ban.ip}</span>

			{ban.active ? <button onClick={ipUnban(ban)}>Unban</button> : <></>}
		</li>
	);

	const FileDetails = (file: File) => (
		<li key={file.url}>
			<a href={file.url} target="_blank" rel="noreferrer">
				{file.url}
			</a>
			<button onClick={del(file.url)}>delete</button>
			<button onClick={ipBan(file.ip)}>ban ip</button>
		</li>
	);

	const addUsername = async () =>
		setConfirmation({
			title: 'Are you sure you want to assign an additional username?',
			message: `Username: ${additionalUsername}`,
			response: async (answer) => {
				setConfirmation(undefined);
				if (!answer) return;

				if (!user) return setErr({ message: 'No user selected, unable to take action.' });
				if (!additionalUsername)
					return setErr({ message: 'No username selected, unable to take action.' });

				const response = await fetch(`/api/admin/user/${user.username}/add_username`, {
					method: 'POST',
					body: additionalUsername,
				});

				if (!response.ok) setErr(await response.json());
				else {
					setMessage(undefined);

					setMessage({
						ms: 5000,
						title: 'Succesfully added username',
						message: `${additionalUsername} has been assigned to the user.`,
						clear: () => setMessage(undefined),
					});

					searchUsernames();
				}
			},
		});

	return (
		<AdminPage>
			<div className={styles.main}>
				<input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
				<button onClick={search}>Search</button>

				<Err err={err} />

				<Message msg={message} />

				<UserDetails user={user} eventHandler={eventHandler} />

				<Confirmation msg={confirmation} />

				{usernames && (
					<>
						<h3>Usernames</h3>
						<ul className={styles.usernames}>
							{usernames.map((username) => (
								<li key={username.username}>
									<span>{username.username}</span>
								</li>
							))}
						</ul>
						<input
							type="text"
							name="un"
							id="un"
							placeholder="Additional username"
							onChange={(e) => setAdditionalUsername(e.target.value)}
						/>
						<button onClick={addUsername}>Add username</button>
					</>
				)}

				{(ips?.length && (
					<>
						<h3>Bans</h3>
						<ul className={styles.bans}>{ips.map(BanDetails)}</ul>
					</>
				)) || <></>}

				{(files?.length && (
					<>
						<h3>Files</h3>
						<ul className={styles.files}>{files.map(FileDetails)}</ul>
					</>
				)) || <></>}
			</div>
		</AdminPage>
	);
};

export interface AdminPageProps {
	children?: React.ReactChild | React.ReactChild[];
}

export const AdminPage: FunctionComponent<AdminPageProps> = ({ children }) => {
	const { status, data: session } = useSession({ required: true });

	if (status === 'loading') {
		return <h1>Loading...</h1>;
	} else if (session?.admin) {
		return <>{children}</>;
	} else {
		return (
			<>
				<h1>This is an admin only page</h1>
				<p>You need to be logged in as an administrator to view this page</p>
			</>
		);
	}
};

export default Admin;
