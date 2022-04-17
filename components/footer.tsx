import Link from 'next/link';
import { FunctionComponent } from 'react';
import styles from '../styles/Footer.module.css';

export const Footer: FunctionComponent = () => (
	<footer className={styles.footer}>
		<Link href="/">Home</Link>
		<Link href="/license">License</Link>
		<Link href="/licenses">Open source licenses</Link>
	</footer>
);
