<template>
  <!-- Empty template is fine - Vue Toastification handles the UI -->
</template>

<script>
import { useToast } from 'vue-toastification';

export default {
  props: {
    messages: Array,
  },
  data() {
    return {
      displayedMessages: new Set(),
      toast: null // Initialize as null
    };
  },
  mounted() {
    // Initialize toast in mounted lifecycle hook
    this.toast = useToast();
    
    // Process any messages that were already present
    if (this.messages && this.messages.length > 0) {
      this.processMessages(this.messages);
    }
  },
  watch: {
    messages: {
      handler(newMessages) {
        this.processMessages(newMessages);
      },
      deep: true
    },
  },
  methods: {
    processMessages(messages) {
      if (!this.toast) return; // Guard against toast not being initialized
      
      messages.forEach((message) => {
        if (!this.displayedMessages.has(message.id)) {
          this.displayedMessages.add(message.id);
          
          const toastOptions = {
            position: 'bottom-right',
            timeout: 4000,
            closeOnClick: true,
            pauseOnFocusLoss: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => {
              setTimeout(() => {
                this.displayedMessages.delete(message.id);
              }, 500);
            },
          };
          
          if (message.type === 'success') {
            this.toast.success(message.text, toastOptions);
          } else if (message.type === 'error') {
            this.toast.error(message.text, toastOptions);
          } else if (message.type === 'info') {
            this.toast.info(message.text, toastOptions);
          } else if (message.type === 'warning') {
            this.toast.warning(message.text, toastOptions);
          }
        }
      });
    }
  }
};
</script>