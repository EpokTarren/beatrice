/* eslint-disable @next/next/no-img-element */
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { FunctionComponent, useState } from 'react';

import type { File, User } from '@prisma/client';
import styles from '../styles/Admin.module.css';
import { Err, ErrProps } from '../components/error';
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

	const [err, setErr] = useState<ErrProps['err']>();
	const [confirmation, setConfirmation] = useState<ConfirmationProps['msg'] | undefined>();

	const search = async () => {
		const response = await fetch('/api/admin/user/' + username);
		const res = await response.json();

		if (response.ok) {
			setUser(res?.user);

			const fileResponse = await fetch(`/api/admin/user/${username}/files`);
			const fileData = await fileResponse.json();

			if (fileResponse.ok) setFiles(fileData.files);
			else {
				setFiles(undefined);
				setErr(res);
			}
		} else {
			setUser(undefined);
			setErr(res);
		}
	};

	const del = (url: string) => () =>
		fetch(`/api/admin/file/${url}`, { method: 'DELETE' }).then(async (res) =>
			res.ok ? search() : setErr(await res.json()),
		);

	const ipBan = (_ip: string) => () => setErr({ message: 'Unimplemented' });

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
				return setErr({ message: 'Unimplemented' });
		}
	};

	const FileDetails = (file: File) => (
		<li key={file.url}>
			<a href={file.url} target="_blank" rel="noreferrer">
				{file.url}
			</a>
			<button onClick={del(file.url)}>delete</button>
			<button onClick={ipBan(file.ip)}>ban ip</button>
		</li>
	);

	return (
		<AdminPage>
			<div className={styles.main}>
				<input type="text" placeholder="username" onChange={(e) => setUsername(e.target.value)} />
				<button onClick={search}>Search</button>

				<Err err={err} />

				<UserDetails user={user} eventHandler={eventHandler} />

				<Confirmation msg={confirmation} />

				<ul className={styles.files}>{files?.map(FileDetails)}</ul>
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
	} else if (session.admin) {
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
