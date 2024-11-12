import React, { useState, createContext } from "react";

const ReplyMessageContext = createContext();

const ReplyMessageProvider = ({ children }) => {
	const [replyingMessage, setReplyingMessage] = useState(null);
	const [valueSearch, setValueSearch] = useState(2);

	return (
		<ReplyMessageContext.Provider
			value={{ replyingMessage, setReplyingMessage, valueSearch, setValueSearch }}
		>
			{children}
		</ReplyMessageContext.Provider>
	);
};

export { ReplyMessageContext, ReplyMessageProvider };
