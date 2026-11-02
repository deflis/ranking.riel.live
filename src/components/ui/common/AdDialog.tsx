import { Dialog, Transition } from "@headlessui/react";
import type React from "react";
import { Fragment } from "react";

import { Button } from "../atoms/Button";
import AdSense from "./AdSense";

import styles from "./ConfirmationDialog.module.css";

export const AdDialog: React.FC<{
	open: boolean;
	handleOk: () => void;
	handleCancel: () => void;
}> = ({ open, handleOk, handleCancel }) => {
	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog as="div" className={styles.dialog} onClose={handleCancel}>
				<Transition.Child
					as={Fragment}
					enter={styles.enter}
					enterFrom={styles.transparent}
					enterTo={styles.opaque}
					leave={styles.leave}
					leaveFrom={styles.opaque}
					leaveTo={styles.transparent}
				>
					<div className={styles.backdrop} />
				</Transition.Child>

				<div className={styles.viewport}>
					<div className={styles.alignment}>
						<Transition.Child
							as={Fragment}
							enter={styles.enter}
							enterFrom={styles.panelHidden}
							enterTo={styles.panelVisible}
							leave={styles.leave}
							leaveFrom={styles.panelVisible}
							leaveTo={styles.panelHidden}
						>
							<Dialog.Panel className={styles.panel}>
								<Dialog.Title as="h3" className={styles.title}>
									広告を本当に消去してもよろしいですか？
								</Dialog.Title>
								<div className={styles.body}>
									<p className={styles.description}>
										昨今のインターネットは広告で成り立っています。このサービスの運営には数円程度と僅かながらも運営資金が必要となっております。ご協力をお願いしたいです。
									</p>
									<AdSense />
								</div>

								<div className={styles.actions}>
									<Button data-autofocus onClick={handleCancel} color="primary">
										広告を消去しない
									</Button>
									<Button onClick={handleOk} color="primary">
										広告を消去する
									</Button>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
};

export default AdDialog;
