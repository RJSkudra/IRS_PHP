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
    <h1 className="main-title">IRS datu ievade</h1>
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
import axios from 'axios';
import io from 'socket.io-client'; // Import Socket.IO client
import '../../../sass/app.scss';
import FormComponent from './FormComponent.vue';
import TableComponent from './TableComponent.vue';
import DetailedView from './DetailedView.vue';
import validationMessages from '../../../lang/lv/validationMessages';
import MessageQueue from './MessageQueue.vue';
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
      socket: null, // Add socket instance
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
    
    // Initialize socket connection
    this.socket = io('http://localhost:4000'); // Adjust the URL as needed

    // Handle entries updates from the socket service
    this.socket.on('entriesUpdated', this.handleEntriesUpdated);

    this.fetchEntries();
    this.checkFormValidity();
  },
  beforeUnmount() {
    // Clean up socket connection when component is destroyed
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  methods: {
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
        this.socket.emit('entriesUpdated', []);
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
        const baseUrl = window.location.origin;
        this.addMessageToQueue({ text: validationMessages.info.submittingForm, type: 'info' });

        axios.post(`${baseUrl}/store`, this.formData, {
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true,
        }).then((response) => {
          console.log('Form submission response:', response);
          this.formData = {
            name: '',
            surname: '',
            age: '',
            phone: '',
            address: '',
          };
          this.touched = {};
          if (response.data && response.data.message) {
            this.addMessageToQueue({ text: response.data.message, type: 'success' });
          }
          this.isSubmitting = false;
          
          // Fetch updated entries and emit them to the Socket.IO server
          this.fetchEntries().then(() => {
            this.socket.emit('entriesUpdated', this.entries);
          });
        }).catch((error) => {
          console.error('Error submitting form:', error);
          if (error.response && error.response.data && error.response.data.message) {
            this.addMessageToQueue({ text: error.response.data.message, type: 'error' });
          } else {
            this.addMessageToQueue({ text: validationMessages.error.submission || 'Error submitting form', type: 'error' });
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