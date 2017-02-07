<style>

</style>

<template>
  <button v-on:click="onclick"
          v-bind:id="id"
          class="ladda-button"
          :data-color="color"
          :data-style="laddastyle"><span class="ladda-label"><slot></slot></span><span class="ladda-spinner"></span>
  </button>
</template>

<script>
  const Ladda = require('ladda');

  export default {
    props: {
      id: {
        default: false,
      },
      color: {
        default: 'green',
      },
      autostart: {
        default: true,
      },
      laddastyle: {
        default: 'expand-left',
      },
      stop: {
        default: false,
      },
    },
    data() {
      return {
        ladda: {},
      };
    },
    created() {
      if (!this.id) {
        const random = Math.random().toString(36).substring(16);
        this.id = `lbtn${random}`;
      }
      setTimeout(this.startLadda, 50);
    },
    methods: {
      startLadda() {
        this.ladda = Ladda.create(document.getElementById(this.id));
      },
      onclick() {
        this.$emit('click');
        if (this.autostart) {
          this.ladda.start();
        }
      },
      stopLadda() {
        this.ladda.stop();
      },
    },
    watch: {
      stop(value) {
        if (value) {
          this.stopLadda();
        }
      },
    },
  };
</script>
