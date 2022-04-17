/* eslint-disable @next/next/no-img-element */
import { Login } from './login';
import { FunctionComponent } from 'react';
import { useSession } from 'next-auth/react';
import styles from '../styles/UserMenu.module.css';

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
						<span>Link account</span>
						<hr />
						<Login />
						<hr />
						<button>Sign out</button>
					</div>
				</div>
			</nav>
		);

	return <></>;
};
