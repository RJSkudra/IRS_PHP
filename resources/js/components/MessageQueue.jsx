import React, { useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessageQueue = ({ messages }) => {
    // Use useRef to persist the displayedMessages set between renders
    const displayedMessagesRef = useRef(new Set());
    
    useEffect(() => {
        // Only process new messages that haven't been displayed yet
        messages.forEach(message => {
            if (!displayedMessagesRef.current.has(message.id)) {
                displayedMessagesRef.current.add(message.id);
                
                const toastOptions = {
                    position: "bottom-right",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    // Add onClose to remove the message ID when toast is closed
                    onClose: () => {
                        setTimeout(() => {
                            displayedMessagesRef.current.delete(message.id);
                        }, 500); // Small delay to prevent race conditions
                    }
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