import Router from 'next/router';
import { Err, ErrProps } from './error';
import { FunctionComponent, useState } from 'react';

export const Username: FunctionComponent = () => {
	const [err, setErr] = useState<ErrProps['err']>();
	const [username, setUsername] = useState<string>('');

	const selectUsername = async () => {
		if (username.length) {
			await fetch('/api/username', {
				method: 'POST',
				body: username,
			}).then(async (res) => (res.ok ? Router.reload() : setErr(await res.json())));
		}
	};

	return (
		<>
			<p>Please select a username</p>

			<input
				type="text"
				placeholder="username"
				onChange={(event) => {
					setUsername(event.target.value);
				}}
			/>

			<br />

			<button onClick={() => selectUsername()}>submit</button>

			<Err err={err} />
		</>
	);
};
