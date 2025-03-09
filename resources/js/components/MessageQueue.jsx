import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessageQueue = ({ messages }) => {
    useEffect(() => {
        const displayedMessages = new Set();
        
        messages.forEach(message => {
            if (!displayedMessages.has(message.id)) {
                displayedMessages.add(message.id);
                
                const toastOptions = {
                    position: "bottom-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                };
                
                if (message.type === 'success') {
                    toast.success(message.text, toastOptions);
                } else if (message.type === 'error') {
                    toast.error(message.text, toastOptions);
                } else if (message.type === 'info') {
                    toast.info(message.text, toastOptions);
                } else if (message.type === 'warning') {
                    toast.warning(message.text, toastOptions);
                }
            }
        });
    }, [messages]);

    return (
        <ToastContainer 
            position="bottom-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    );
};

export default MessageQueue;