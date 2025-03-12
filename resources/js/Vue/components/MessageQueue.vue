
<template>
  <ToastContainer
    position="bottom-right"
    autoClose="4000"
    hideProgressBar="false"
    newestOnTop
    closeOnClick
    rtl="false"
    pauseOnFocusLoss
    draggable
    pauseOnHover
  />
</template>

<script>
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default {
  props: {
    messages: Array,
  },
  watch: {
    messages: {
      handler(newMessages) {
        newMessages.forEach((message) => {
          if (!this.displayedMessages.has(message.id)) {
            this.displayedMessages.add(message.id);
            const toastOptions = {
              position: 'bottom-right',
              autoClose: 4000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              onClose: () => {
                setTimeout(() => {
                  this.displayedMessages.delete(message.id);
                }, 500);
              },
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
      },
      immediate: true,
    },
  },
  data() {
    return {
      displayedMessages: new Set(),
    };
  },
};
</script>