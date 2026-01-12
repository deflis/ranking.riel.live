import { Dialog, Transition } from "@headlessui/react";
import type React from "react";
import { Fragment } from "react";

import { Button } from "../atoms/Button";

import AdSense from "./AdSense";

export const AdDialog: React.FC<{
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
									広告を本当に消去してもよろしいですか？
								</Dialog.Title>
								<div className="mt-2">
									<p className="text-sm text-gray-500">
										昨今のインターネットは広告で成り立っています。このサービスの運営には数円程度と僅かながらも運営資金が必要となっております。ご協力をお願いしたいです。
									</p>
									<AdSense />
								</div>

								<div className="mt-4">
									<Button autoFocus onClick={handleCancel} color="primary">
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
