import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { Footer } from '../components/footer';
import { UserMenu } from '../components/userMenu';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<SessionProvider>
				<UserMenu />
				<main>
					<Component {...pageProps} />
				</main>
			</SessionProvider>
			<Footer />
		</>
	);
}

export default MyApp;
