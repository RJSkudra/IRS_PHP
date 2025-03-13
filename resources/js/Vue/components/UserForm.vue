<template>
  <div :class="['user-form', { 'dark-mode': darkMode }]">
    <DetailedView
      v-if="showDetailedView"
      :entries="entries"
      :messages="detailedViewMessages"
      @close="showDetailedView = false"
      @update-entry="handleEditEntry"
    />
    <MessageQueue :messages="messageQueue" @remove-message="removeMessage" />
    <button @click="toggleDarkMode" class="button toggle-button" style="z-index: 1005">
      <i :class="darkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
    </button>
    <h1 className="main-title">IRS datu ievade (Vue.js)</h1>
    <FormComponent
      :formData="formData"
      :errors="errors"
      :touched="touched"
      @change="handleChange"
      @submit="handleSubmit"
      :isFormValid="isFormValid"
      @delete-all="handleDeleteAll"
    />
    <TableComponent
      v-if="entries.length > 0"
      :entries="sortedEntries"
      :totalEntries="totalEntries"
      @delete-all="handleDeleteAll"
      @edit-all="showDetailedView = true"
    />
    <div class="footer">IRS™ © ® 2025</div>
  </div>
</template>

<script>
import '../../../sass/app.scss';
import FormComponent from './FormComponent.vue';
import TableComponent from './TableComponent.vue';
import DetailedView from './DetailedView.vue';
import validationMessages from '../../../lang/lv/validationMessages';
import MessageQueue from './MessageQueue.vue';
import SocketService from '../../services/socketService';
import { validateField, validateForm, areAllFieldsFilled } from '../../utils/Validation';

export default {
  name: 'UserForm',
  components: {
    FormComponent,
    TableComponent,
    DetailedView,
    MessageQueue,
  },
  props: {
    detailedViewMessages: Object
  },
  data() {
    return {
      formData: {
        name: '',
        surname: '',
        age: '',
        phone: '',
        address: '',
      },
      errors: {},
      touched: {},
      entries: [],
      lastId: null,
      darkMode: this.getDarkModePreference(),
      isFormValid: false,
      messageQueue: [],
      showDetailedView: false,
      totalEntries: 0,
      isEditing: false,
      socketService: null,
      isSubmitting: false, // Add this new flag
    };
  },
  computed: {
    sortedEntries() {
      return [...this.entries].sort((a, b) => b.id - a.id).slice(0, 5);
    },
  },
  mounted() {
    // Apply dark mode class to body if needed
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    }
    
    // Initialize socket service with event handlers - use the existing method instead of an inline function
    this.socketService = new SocketService({
      onEntriesUpdated: this.handleEntriesUpdated
    });
    
    this.fetchEntries();
    this.checkFormValidity();
  },
  beforeUnmount() {
    // Clean up socket connection when component is destroyed
    if (this.socketService) {
      this.socketService.disconnect();
    }
  },
  watch: {
    darkMode(newVal) {
      if (newVal) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      // Update both storage mechanisms for compatibility
      this.setCookie('darkMode', newVal);
      localStorage.setItem('darkMode', newVal);
    },
    formData: {
      handler: 'checkFormValidity',
      deep: true,
    },
    errors: {
      handler: 'checkFormValidity',
      deep: true,
    },
  },
  methods: {
    // Handle entries updates from the socket service
    handleEntriesUpdated(updatedEntries) {
      console.log('Entries updated via socket:', updatedEntries.length);
      this.entries = updatedEntries;
      this.totalEntries = updatedEntries.length;
      this.lastId = updatedEntries.length > 0 ? updatedEntries[updatedEntries.length - 1].id : null;
    },
    
    async fetchEntries() {
      try {
        const baseUrl = window.location.origin;
        console.log('Fetching entries from:', `${baseUrl}/api/entries`);

        const response = await axios.get(`${baseUrl}/api/entries`);
        console.log('Entries response:', response.data);

        this.entries = response.data;
        this.totalEntries = response.data.length;
        this.lastId = response.data.length > 0 ? response.data[response.data.length - 1].id : null;
      } catch (error) {
        console.error('Error fetching entries:', error);
        if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
      }
    },
    handleDeleteAll() {
      axios.post('/delete-all').then(() => {
        this.entries = [];
        this.totalEntries = 0;
        this.addMessageToQueue({ text: validationMessages.success.all_deleted, type: 'success' });
        // Emit updated entries to the Socket.IO server
        this.socketService.socket.emit('entriesUpdated', []);
      }).catch((error) => {
        console.error('Error deleting all entries:', error);
        this.addMessageToQueue({ text: 'Error deleting all entries', type: 'error' });
      });
    },
    handleChange(e) {
      const { name, value } = e.target;
      this.formData[name] = value;
      this.touched[name] = true;
      this.errors[name] = validateField(name, value);
      this.checkFormValidity();
    },
    checkFormValidity() {
      this.isFormValid = areAllFieldsFilled(this.formData) && validateForm(this.formData);
    },
    handleSubmit(e) {
      // Add flag to prevent double submission
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      
      e.preventDefault();
      const newErrors = {};
      Object.keys(this.formData).forEach((key) => {
        const error = validateField(key, this.formData[key]);
        if (error) {
          newErrors[key] = error;
        }
      });
      this.errors = newErrors;

      if (Object.keys(newErrors).length === 0) {
        this.addMessageToQueue({ text: validationMessages.info.submittingForm, type: 'info' });

        // Emit the form data to the Socket.IO server
        this.socketService.socket.emit('storeEntry', this.formData, (response) => {
          if (response.success) {
            this.formData = {
              name: '',
              surname: '',
              age: '',
              phone: '',
              address: '',
            };
            this.touched = {};
            this.addMessageToQueue({ text: 'Ieraksts izveidots veiksmīgi', type: 'success' });
          } else {
            this.addMessageToQueue({ text: response.message, type: 'error' });
          }
          this.isSubmitting = false;
        });
      } else {
        this.isSubmitting = false;
      }
    },
    addMessageToQueue(message) {
      const messageWithId = { ...message, id: Date.now() };
      this.messageQueue.push(messageWithId);
      setTimeout(() => {
        this.messageQueue = this.messageQueue.filter((msg) => msg.id !== messageWithId.id);
      }, 5000);
    },
    removeMessage(index) {
      this.messageQueue.splice(index, 1);
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.setCookie('darkMode', this.darkMode);
    },
    getDarkModePreference() {
      // First check for cookie
      const darkModeCookie = this.getCookie('darkMode');
      if (darkModeCookie !== null) {
        return darkModeCookie === 'true';
      }
      
      // Fall back to localStorage if no cookie exists
      const darkModeLocal = localStorage.getItem('darkMode');
      return darkModeLocal === 'true';
    },
    getCookie(name) {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith(name + '='));
      
      return cookieValue ? cookieValue.split('=')[1] : null;
    },
    setCookie(name, value, days = 365) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = "; expires=" + date.toUTCString();
      document.cookie = name + "=" + value + expires + "; path=/; SameSite=Lax";
    },
  },
};
</script>