import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessageQueue = ({ messages }) => {
    React.useEffect(() => {
        const displayedMessages = new Set();
        messages.forEach(message => {
            if (!displayedMessages.has(message.id)) {
                displayedMessages.add(message.id);
                if (message.type === 'success') {
                    toast.success(message.text);
                } else if (message.type === 'error') {
                    toast.error(message.text);
                }
            }
        });
    }, [messages]);

    return <ToastContainer position="bottom-right" />;
};

export default MessageQueue;