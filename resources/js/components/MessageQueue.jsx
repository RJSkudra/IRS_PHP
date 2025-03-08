import React, { useEffect, useState } from 'react';

const MessageQueue = ({ messages, removeMessage }) => {
    const [visibleMessages, setVisibleMessages] = useState(messages);

    useEffect(() => {
        setVisibleMessages(messages);
    }, [messages]);

    useEffect(() => {
        const timers = visibleMessages.map((message, index) =>
            setTimeout(() => {
                setVisibleMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[index] = { ...newMessages[index], fadeOut: true };
                    return newMessages;
                });
                setTimeout(() => removeMessage(index), 300); // Delay removal from parent state to allow CSS transition
            }, 3000)
        );
        return () => timers.forEach(timer => clearTimeout(timer));
    }, [visibleMessages, removeMessage]);

    const handleRemoveMessage = (index) => {
        setVisibleMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = { ...newMessages[index], fadeOut: true };
            return newMessages;
        });
        setTimeout(() => removeMessage(index), 300); // Delay removal from parent state to allow CSS transition
    };

    return (
        <div className="message-container bottom-right">
            {visibleMessages.map((message, index) => (
                <div key={index} className={`message ${message.type} ${message.fadeOut ? 'fade-out' : ''}`}>
                    {message.text}
                    <button onClick={() => handleRemoveMessage(index)} className="close-button">x</button>
                </div>
            ))}
        </div>
    );
};

export default MessageQueue;