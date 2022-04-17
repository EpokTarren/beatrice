import { FunctionComponent } from 'react';
import styles from '../styles/Error.module.css';

export interface ErrProps {
	err?: {
		code?: number;
		message: string;
	};
}

export const Err: FunctionComponent<ErrProps> = (props) =>
	props.err ? (
		<div className={styles.error}>
			<h3>An error has occured</h3>
			{props.err.code ? <h4>{props.err.code}</h4> : <></>}
			<p>{props.err.message}</p>
		</div>
	) : (
		<></>
	);
