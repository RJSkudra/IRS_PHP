<template>
  <div id="app">
    <h1>Welcome to the Vue App</h1>
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

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>