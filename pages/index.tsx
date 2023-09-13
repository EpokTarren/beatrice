import { useSession } from 'next-auth/react';
import { FunctionComponent } from 'react';
import type { NextPage } from 'next';

import styles from '../styles/Home.module.css';

import { Username } from '../components/username';
import { Upload } from '../components/upload';
import { Login } from '../components/login';
import { HandlerSession } from '../lib/endpoint';

const HomePage: FunctionComponent = () => {
	const { data: session } = useSession();

	if (session) {
		const Page: FunctionComponent = () =>
			(session as HandlerSession).username ? <Upload /> : <Username />;
		return <Page />;
	}

	return <Login />;
};

const Home: NextPage = () => {
	return (
		<div className={styles.main}>
			<HomePage />
		</div>
	);
};

export default Home;
