import { FunctionComponent } from 'react';
import styles from '../styles/Message.module.css';

export interface ConfirmationProps {
	msg?: {
		title?: string;
		message: string;
		response: (answer: boolean) => void;
	};
}

export const Confirmation: FunctionComponent<ConfirmationProps> = (props) => {
	if (!props.msg) return <></>;

	return (
		<>
			<div className={styles.confirmation}>
				{props.msg.title ? <h3>{props.msg.title}</h3> : <></>}
				<p>{props.msg.message}</p>
				<button onClick={() => props.msg!.response(true)}>Yes</button>
				<button onClick={() => props.msg!.response(false)}>No</button>
			</div>
		</>
	);
};
