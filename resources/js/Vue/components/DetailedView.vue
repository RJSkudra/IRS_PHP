<template>
  <div class="detailed-view-overlay">
    <div class="detailed-view">
      <div class="detailed-view-header">
        <button class="close-button" @click="onClose">{{ messages.buttons.close }}</button>
        <h2>{{ messages.titles.editEntries }}</h2>
      </div>
      <div class="detailed-view-content">
        <table class="users-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.accessor" @click="sortColumn(column)">
                <div class="header-content">
                  <span>{{ column.Header }}</span>
                  <span class="sort-indicator">
                    {{ getSortIndicator(column) }}
                  </span>
                </div>
                <div class="resizer" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedEntries" :key="row.id">
              <td v-for="column in columns" :key="column.accessor">
                <template v-if="editableEntryId === row.id && column.accessor !== 'id' && column.accessor !== 'actions'">
                  <input
                    v-model="editValues[row.id][column.accessor]"
                    :type="column.accessor === 'age' ? 'text' : 'text'"
                    :pattern="column.accessor === 'age' ? '[0-9]*' : ''"
                    :inputmode="column.accessor === 'age' ? 'numeric' : ''"
                    @focus="setFocusedField(row.id, column.accessor)"
                  />
                  <span v-if="errors[column.accessor]" class="error">{{ errors[column.accessor] }}</span>
                </template>
                <template v-else-if="column.accessor !== 'actions'">
                  {{ row[column.accessor] }}
                </template>
                <template v-if="column.accessor === 'actions'">
                  <div class="action-buttons">
                    <template v-if="editableEntryId === row.id">
                      <button class="apply-button" @click="handleApply">{{ messages.buttons.apply }}</button>
                      <button class="cancel-button" @click="handleCancel">{{ messages.buttons.cancel }}</button>
                    </template>
                    <template v-else>
                      <button class="edit-button" @click="handleEdit(row.id)">{{ messages.buttons.edit }}</button>
                      <button class="delete-button" @click="handleDelete(row.id)">{{ messages.buttons.delete }}</button>
                    </template>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="footer">{{ messages.footer }}</div>
      </div>
    </div>
    <MessageQueue :messages="messageQueue" @remove-message="removeMessage" />
  </div>
</template>

<script>
import axios from 'axios';
import MessageQueue from './MessageQueue.vue';
import { validateField } from '../../utils/Validation';

export default {
  name: 'DetailedView',
  components: {
    MessageQueue,
  },
  props: {
    entries: Array,
    onClose: Function,
    messages: Object
  },
  data() {
    return {
      editableEntryId: null,
      sortedEntries: this.entries,
      originalEntries: this.entries,
      editingEntry: null,
      messageQueue: [],
      isEditing: false,
      errors: {},
      editValues: {},
      focusedField: null,
      columns: [
        { Header: this.messages.headers.id, accessor: 'id' },
        { Header: this.messages.headers.name, accessor: 'name' },
        { Header: this.messages.headers.surname, accessor: 'surname' },
        { Header: this.messages.headers.age, accessor: 'age' },
        { Header: this.messages.headers.phone, accessor: 'phone' },
        { Header: this.messages.headers.address, accessor: 'address' },
        { Header: this.messages.headers.actions, accessor: 'actions' },
      ],
      sortBy: [],
    };
  },
  watch: {
    entries(newEntries) {
      if (!this.isEditing) {
        this.sortedEntries = newEntries;
        this.originalEntries = newEntries;
      }
    },
  },
  methods: {
    setFocusedField(id, field) {
      this.focusedField = { id, field };
    },
    handleInputChange(id, field, value) {
      this.setFocusedField(id, field);
      this.editValues[id] = { ...this.editValues[id], [field]: value };
      const error = validateField(field, value);
      this.errors[field] = error;
    },
    handleEdit(id) {
      const entry = this.sortedEntries.find((entry) => entry.id === id);
      this.editableEntryId = id;
      this.editingEntry = { ...entry };
      this.editValues[id] = { ...entry };
      this.isEditing = true;
    },
    async handleApply() {
      const updatedEntry = {
        ...this.sortedEntries.find((entry) => entry.id === this.editableEntryId),
        ...this.editValues[this.editableEntryId],
      };

      const fieldErrors = {};
      Object.entries(updatedEntry).forEach(([key, value]) => {
        if (key !== 'id') {
          const stringValue = value === null || value === undefined ? '' : String(value);
          const error = validateField(key, stringValue);
          if (error) {
            fieldErrors[key] = error;
          }
        }
      });

      if (Object.keys(fieldErrors).length > 0) {
        this.errors = fieldErrors;
        this.addMessageToQueue({ text: this.messages.messages.validationError, type: 'error' });
        return;
      }

      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const updatedEntries = this.sortedEntries.map((entry) =>
          entry.id === this.editableEntryId ? updatedEntry : entry
        );

        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let apiUrl;
        let apiResponse = null;
        let apiError = null;

        if (isLocalDev) {
          const socketPort = 4000;
          const apiBaseUrl = `http://${window.location.hostname}:${socketPort}`;
          const apiPrefix = '/socket-api';
          const nodeServerUrl = `${apiBaseUrl}${apiPrefix}/update-entries`;

          console.log(`Attempting to connect to Node.js server at: ${nodeServerUrl}`);

          try {
            apiResponse = await axios.post(nodeServerUrl, { entries: updatedEntries }, {
              headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              withCredentials: true,
              timeout: 5000,
            });
            apiUrl = nodeServerUrl;
          } catch (nodeError) {
            console.warn(`Node.js server connection failed: ${nodeError.message}`);
            apiError = nodeError;

            const laravelServerUrl = `${window.location.origin}/api/update-entries`;
            console.log(`Attempting to connect to Laravel server at: ${laravelServerUrl}`);

            try {
              apiResponse = await axios.post(laravelServerUrl, { entries: updatedEntries }, {
                headers: {
                  'X-CSRF-TOKEN': csrfToken,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                withCredentials: true,
              });
              apiUrl = laravelServerUrl;
            } catch (laravelError) {
              console.error(`Laravel server connection also failed: ${laravelError.message}`);
              throw apiError;
            }
          }
        } else {
          apiUrl = `${window.location.origin}/api/update-entries`;
          apiResponse = await axios.post(apiUrl, { entries: updatedEntries }, {
            headers: {
              'X-CSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            withCredentials: true,
          });
        }

        if (apiResponse.status === 200) {
          this.sortedEntries = updatedEntries;
          this.originalEntries = updatedEntries;
          this.addMessageToQueue({ text: this.messages.messages.entryUpdateSuccess, type: 'success' });
          this.editableEntryId = null;
          delete this.editValues[this.editableEntryId];
          this.isEditing = false;
          this.errors = {};
        } else {
          console.error('Unexpected response:', apiResponse);
          this.addMessageToQueue({ text: this.messages.messages.unexpectedResponse, type: 'error' });
        }
      } catch (error) {
        console.error('Error updating entry:', error);
        this.addMessageToQueue({
          text: error.response?.data?.message || this.messages.messages.errorUpdatingEntries.replace('{0}', ''),
          type: 'error',
        });
      }
    },
    handleCancel() {
      this.sortedEntries = this.sortedEntries.map((entry) =>
        entry.id === this.editableEntryId ? this.editingEntry : entry
      );
      this.editableEntryId = null;
      this.isEditing = false;
    },
    addMessageToQueue(message) {
      this.messageQueue.push(message);
    },
    removeMessage(index) {
      this.messageQueue.splice(index, 1);
    },
    sortColumn(column) {
      const existingSort = this.sortBy.find((sort) => sort.id === column.accessor);
      if (existingSort) {
        existingSort.desc = !existingSort.desc;
      } else {
        this.sortBy = [{ id: column.accessor, desc: false }];
      }
      this.applySorting();
    },
    getSortIndicator(column) {
      const sort = this.sortBy.find((sort) => sort.id === column.accessor);
      if (sort) {
        return sort.desc ? ' ▼' : ' ▲';
      }
      return '';
    },
    applySorting() {
      if (!this.sortBy.length) {
        this.sortedEntries = [...this.entries];
        return;
      }

      const { id: columnId, desc } = this.sortBy[0];
      this.sortedEntries = [...this.entries].sort((rowA, rowB) => {
        let a = rowA[columnId];
        let b = rowB[columnId];
        a = a == null ? '' : a;
        b = b == null ? '' : b;

        if (columnId === 'age') {
          const numA = Number(a) || 0;
          const numB = Number(b) || 0;
          return desc ? numB - numA : numA - numB;
        }

        if (typeof a === 'string' && typeof b === 'string') {
          return desc ? b.localeCompare(a) : a.localeCompare(b);
        }

        if (a < b) return desc ? 1 : -1;
        if (a > b) return desc ? -1 : 1;
        return 0;
      });
    },
    
    handleDelete(id) {
      try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const updatedEntries = this.sortedEntries.filter(entry => entry.id !== id);
        
        const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        let apiUrl;
        
        const makeRequest = async (url) => {
          return await axios.delete(url, {
            headers: {
              'X-CSRF-TOKEN': csrfToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            withCredentials: true,
          });
        };
    
        if (isLocalDev) {
          const socketPort = 4000;
          const apiBaseUrl = `http://${window.location.hostname}:${socketPort}`;
          const apiPrefix = '/socket-api';
          const nodeServerUrl = `${apiBaseUrl}${apiPrefix}/delete/${id}`;
    
          console.log(`Attempting to delete entry via Node.js server at: ${nodeServerUrl}`);
    
          makeRequest(nodeServerUrl)
            .then(response => {
              this.handleDeleteSuccess(response, updatedEntries);
            })
            .catch(nodeError => {
              console.warn(`Node.js server connection failed: ${nodeError.message}`);
              
              const laravelServerUrl = `${window.location.origin}/delete/${id}`;
              console.log(`Attempting to delete entry via Laravel server at: ${laravelServerUrl}`);
              
              return makeRequest(laravelServerUrl);
            })
            .then(response => {
              if (response) this.handleDeleteSuccess(response, updatedEntries);
            })
            .catch(error => {
              this.handleDeleteError(error);
            });
        } else {
          apiUrl = `${window.location.origin}/delete/${id}`;
          
          makeRequest(apiUrl)
            .then(response => {
              this.handleDeleteSuccess(response, updatedEntries);
            })
            .catch(error => {
              this.handleDeleteError(error);
            });
        }
      } catch (error) {
        this.handleDeleteError(error);
      }
    },
    
    handleDeleteSuccess(response, updatedEntries) {
      if (response.status === 200) {
        this.sortedEntries = updatedEntries;
        this.originalEntries = updatedEntries;
        this.addMessageToQueue({ 
          text: this.messages.messages.entryDeleteSuccess || 'Entry deleted successfully', 
          type: 'success' 
        });
      } else {
        console.error('Unexpected response:', response);
        this.addMessageToQueue({ 
          text: this.messages.messages.unexpectedResponse || 'Unexpected server response', 
          type: 'error' 
        });
      }
    },
    
    handleDeleteError(error) {
      console.error('Error deleting entry:', error);
      this.addMessageToQueue({
        text: error.response?.data?.message || 
              (this.messages.messages.errorDeletingEntry 
                ? this.messages.messages.errorDeletingEntry.replace('{0}', '') 
                : 'Error deleting entry'),
        type: 'error',
      });
    },
    
    saveColumnWidths() {
      // Your saveColumnWidths implementation goes here
    }
  },
  
  mounted() {
    window.addEventListener('beforeunload', this.saveColumnWidths);
  },
  beforeDestroy() {
    window.removeEventListener('beforeunload', this.saveColumnWidths);
  },
};
</script>

