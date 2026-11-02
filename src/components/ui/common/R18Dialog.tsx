import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import type React from "react";
import { Fragment, useEffect, useState } from "react";

import { r18Atom } from "../../../modules/atoms/global";
import { Button } from "../atoms/Button";
import AdSense from "./AdSense";

import styles from "./ConfirmationDialog.module.css";

export const R18Dialog: React.FC<{
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
									あなたは18歳以上ですか？
								</Dialog.Title>
								<div className={styles.body}>
									<p className={styles.description}>
										このページには18歳未満閲覧禁止のR18小説情報が含まれています。
										<br />
										あなたは18歳以上ですか？
									</p>
									<AdSense />
								</div>

								<div className={styles.actions}>
									<Button data-autofocus onClick={handleCancel} color="primary">
										18歳未満である（通常ランキングを見る）
									</Button>
									<Button onClick={handleOk} color="primary">
										18歳以上である（閲覧可）
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

export const R18DialogForm: React.FC = () => {
	const [ok, setOk] = useAtom(r18Atom);
	const [ready, setReady] = useState(false);
	// atomの購読で保存値を復元してから、年齢確認の要否を判定する。
	useEffect(() => setReady(true), []);
	const navigate = useNavigate();
	const handleOk = () => {
		setOk(true);
	};
	const handleCancel = () => {
		navigate({ to: "/" });
	};
	return (
		<R18Dialog
			open={ready && !ok}
			handleOk={handleOk}
			handleCancel={handleCancel}
		/>
	);
};

export default R18DialogForm;
