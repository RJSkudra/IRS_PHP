<template>
  <form @submit.prevent="handleSubmit" id="userForm" class="form-grid">
    <div class="form-group">
      <label>Vārds:</label>
      <input type="text" name="name" v-model="formData.name" @input="handleChange" />
      <span v-if="touched.name && errors.name" class="error">{{ errors.name }}</span>
    </div>
    <div class="form-group">
      <label>Uzvārds:</label>
      <input type="text" name="surname" v-model="formData.surname" @input="handleChange" />
      <span v-if="touched.surname && errors.surname" class="error">{{ errors.surname }}</span>
    </div>
    <div class="form-group">
      <label>Vecums:</label>
      <input type="text" name="age" v-model="formData.age" @input="handleChange" />
      <span v-if="touched.age && errors.age" class="error">{{ errors.age }}</span>
    </div>
    <div class="form-group">
      <label>Telefona nr.:</label>
      <input type="text" name="phone" v-model="formData.phone" @input="handleChange" />
      <span v-if="touched.phone && errors.phone" class="error">{{ errors.phone }}</span>
    </div>
    <div class="form-group full-width">
      <label>Adrese:</label>
      <input type="text" name="address" v-model="formData.address" @input="handleChange" />
      <span v-if="touched.address && errors.address" class="error">{{ errors.address }}</span>
    </div>
    <div class="button-group full-width">
      <button
        type="submit"
        class="button submit-button"
        :disabled="!isFormValid"
        :style="submitButtonStyle"
      >
        Iesniegt
      </button>
    </div>
  </form>
</template>

<script>
export default {
  props: {
    formData: Object,
    errors: Object,
    touched: Object,
    isFormValid: Boolean,
  },
  computed: {
    submitButtonStyle() {
      return {
        backgroundColor: this.isFormValid ? '#007bff' : '#ccc',
        cursor: this.isFormValid ? 'pointer' : 'not-allowed',
        opacity: this.isFormValid ? 1 : 0.7,
        transition: 'all 0.3s ease',
      };
    },
  },
  methods: {
    handleChange(event) {
      this.$emit('change', event);
    },
    handleSubmit(event) {
      this.$emit('submit', event);
    },
  },
};
</script>