<template>
  <div id="app">
    <user-form :detailedViewMessages="detailedViewMessages" />
  </div>
</template>

<script>
import UserForm from './Vue/components/UserForm.vue';
import detailedViewMessages from '../lang/lv/detailedViewMessages.js';

export default {
  name: 'VueApp',
  components: {
    UserForm
  },
  data() {
    return {
      detailedViewMessages
    };
  }
}
</script>

