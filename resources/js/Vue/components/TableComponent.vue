<template>
  <div>
    <div class="table-header">
      <h2>{{ tableComponentMessages.title }}</h2>
      <div class="button-group">
        <button @click="$emit('delete-all')" class="button delete-button">
          {{ tableComponentMessages.buttons.deleteAll }}
        </button>
        <button @click="$emit('edit-all')" class="button primary-button">
          {{ tableComponentMessages.buttons.editAll }}
        </button>
      </div>
    </div>
    <table class="users-table">
      <thead>
        <tr>
          <th>{{ tableComponentMessages.headers.id }}</th>
          <th>{{ tableComponentMessages.headers.name }}</th>
          <th>{{ tableComponentMessages.headers.surname }}</th>
          <th>{{ tableComponentMessages.headers.age }}</th>
          <th>{{ tableComponentMessages.headers.phone }}</th>
          <th>{{ tableComponentMessages.headers.address }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in entries" :key="entry.id">
          <td>{{ entry.id }}</td>
          <td>{{ entry.name }}</td>
          <td>{{ entry.surname }}</td>
          <td>{{ entry.age }}</td>
          <td>{{ entry.phone }}</td>
          <td>{{ entry.address }}</td>
        </tr>
      </tbody>
    </table>
    <p style="margin-left: 15%">{{ tableComponentMessages.totalEntries.replace('{0}', totalEntries) }}</p>
  </div>
</template>

<script>
import tableComponentMessages from '../../../lang/lv/tableComponentMessages';

export default {
  props: {
    entries: Array,
    totalEntries: Number,
  },
  data() {
    return {
      tableComponentMessages,
    };
  },
};
</script>