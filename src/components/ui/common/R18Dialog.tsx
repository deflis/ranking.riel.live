import { Dialog, Transition } from "@headlessui/react";
import { useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import type React from "react";
import { Fragment, useCallback, useState } from "react";

import { r18Atom } from "../../../modules/atoms/global";
import { Button } from "../atoms/Button";

import AdSense from "./AdSense";

export const R18Dialog: React.FC<{
	open: boolean;
	handleOk: () => void;
	handleCancel: () => void;
}> = ({ open, handleOk, handleCancel }) => {
	return (
		<Transition appear show={open} as={Fragment}>
			<Dialog as="div" className="relative z-10" onClose={handleCancel}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black bg-opacity-25" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4 text-center">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
								<Dialog.Title
									as="h3"
									className="text-lg font-medium leading-6 text-gray-900"
								>
									あなたは18歳以上ですか？
								</Dialog.Title>
								<div className="mt-2">
									<p className="text-sm text-gray-500">
										このページには18歳未満閲覧禁止のR18小説情報が含まれています。
										<br />
										あなたは18歳以上ですか？
									</p>
									<AdSense />
								</div>

								<div className="mt-4">
									<Button autoFocus onClick={handleCancel} color="primary">
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
	const [showDialog, setShowDialog] = useState(!ok);
	const navigate = useNavigate();
	const handleOk = useCallback(() => {
		setOk(true);
		setShowDialog(false);
	}, [setOk]);
	const handleCancel = useCallback(() => {
		navigate("/");
	}, [navigate]);
	return (
		<R18Dialog
			open={showDialog}
			handleOk={handleOk}
			handleCancel={handleCancel}
		/>
	);
};

export default R18DialogForm;
