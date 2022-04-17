import { FunctionComponent } from 'react';

import { signIn } from 'next-auth/react';
export const Login: FunctionComponent = () => {
	return (
		<>
			<button onClick={() => signIn('discord')}>Discord</button>
			<button onClick={() => signIn('github')}>GitHub</button>
		</>
	);
};
