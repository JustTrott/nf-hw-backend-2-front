"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";

export default function ChooseUserModal({
	showModal,
	setShowModal,
	setUser,
}: {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	setUser: (user: string) => void;
}) {
	return (
		<>
			{showModal ? (
				<>
					<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
						<div className="relative w-auto my-6 mx-auto max-w-3xl">
							{/*content*/}
							<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
								{/*header*/}
								<div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
									<h3 className="text-3xl font-semibold">
										Who are you?
									</h3>
									<button
										className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
										onClick={() => setShowModal(false)}
									>
										<span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
											×
										</span>
									</button>
								</div>
								{/*body*/}
								{/* <div className="relative p-6 flex-auto">
									<p className="my-4 text-blueGray-500 text-lg leading-relaxed">
										I always felt like I could do anything.
										That’s the main thing people are
										controlled by! Thoughts- their
										perception of themselves! They're slowed
										down by their perception of themselves.
										If you're taught you can’t do anything,
										you won’t do anything. I was taught I
										could do everything.
									</p>
								</div> */}
								{/*footer*/}
								<div className="flex items-center justify-between p-6 border-t border-solid border-blueGray-200 rounded-b">
									<Button
										variant={"destructive"}
										onClick={() => {
											setShowModal(false),
												setUser("uldana");
										}}
									>
										Uldana
									</Button>
									<Button
										onClick={() => {
											setShowModal(false);
											setUser("daulet");
										}}
									>
										Daulet
									</Button>
								</div>
							</div>
						</div>
					</div>
					<div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
				</>
			) : null}
		</>
	);
}
