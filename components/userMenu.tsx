/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Login } from './login';
import { sharex } from '../lib/uploader';
import { FunctionComponent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import styles from '../styles/UserMenu.module.css';
import type { HandlerSession } from '../lib/endpoint';

export const UserMenu: FunctionComponent = () => {
	const { data: session } = useSession();

	if (session)
		return (
			<nav className={styles.nav}>
				<div className={styles.has_dropdown}>
					<a href="#" onClick={(e) => e.preventDefault()}>
						<div className={styles.pfp_container}>
							<span>{session?.username as string}</span>
							<img className={styles.pfp} src={session?.user?.image ?? ''} alt="" />
						</div>
					</a>

					<div className={styles.dropdown}>
						{session.admin ? (
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
						<button onClick={() => sharex((session as HandlerSession | null) || {})}>ShareX</button>

						<hr />
						<button onClick={() => signOut()}>Sign out</button>
					</div>
				</div>
			</nav>
		);

	return <></>;
};
