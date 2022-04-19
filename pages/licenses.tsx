import type { NextPage } from 'next';
import { packages } from '../lib/licenses';

export const Licenses: NextPage = () => {
	const repo = (url?: string) =>
		url ? (
			<h2>
				Repository:
				<br />
				<a href={url} target="_blank" rel="noreferrer">
					{url}
				</a>
			</h2>
		) : (
			<></>
		);

	const url = (url?: string) =>
		url ? (
			<h2>
				URL:
				<br />
				<a href={url} target="_blank" rel="noreferrer">
					{url}
				</a>
			</h2>
		) : (
			<></>
		);

	const text = (text?: string) =>
		text ? (
			<details>
				<summary>License text</summary>
				<div dangerouslySetInnerHTML={{ __html: text }}></div>
			</details>
		) : (
			<></>
		);

	const rows = Object.keys(packages)
		.sort()
		.map((key: string) => (
			<div key={key}>
				<h1>{key}</h1>
				{repo(packages[key]?.repository)}
				{url(packages[key]?.url)}
				<h2>
					License:{' '}
					<a
						href={
							packages[key]?.licenses ? `https://spdx.org/licenses/${packages[key].licenses}` : ''
						}
						target="_blank"
						rel="noreferrer"
					>
						{packages[key]?.licenses ?? 'Unkown'}
					</a>
				</h2>
				{text(packages[key]?.licenseText)}
				<hr />
			</div>
		));

	return <>{rows}</>;
};

export default Licenses;
