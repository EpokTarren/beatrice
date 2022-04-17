import { FunctionComponent } from 'react';
import styles from '../styles/Message.module.css';

export interface MessageProps {
	msg?: {
		ms?: number;
		title?: string;
		message: string;
		clear: () => void;
	};
}

export const Message: FunctionComponent<MessageProps> = (props) => {
	if (!props.msg) return <></>;

	const time = props.msg.ms || 5000;
	setTimeout(props.msg.clear, time);

	return (
		<>
			<style>:root {`{ --time: ${time + 5}ms; }`}</style>
			<div className={styles.message}>
				{props.msg.title ? <h3>{props.msg.title}</h3> : <></>}
				<p>{props.msg.message}</p>
			</div>
		</>
	);
};
