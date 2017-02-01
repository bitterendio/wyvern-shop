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
  var Ladda = require('ladda')

  export default {
    props: {
      id: {
        default: false
      },
      color: {
        default: 'green'
      },
      autostart: {
        default: true
      },
      laddastyle: {
        default: 'expand-left'
      },
      stop: {
        default: false
      }
    },
    data() {
      return {
        ladda: {}
      }
    },
    created() {
      if (!this.id) {
        this.id = 'lbtn' + Math.random().toString(36).substring(16);
      }
      setTimeout(function() {
        this.ladda = Ladda.create(document.getElementById(this.id));
      }.bind(this), 50);

    },
    methods: {
      onclick: function() {
        this.$emit('click')

        if (this.autostart) {
          this.ladda.start();
        }
        var self = this
      },
      stopLadda: function() {
        this.ladda.stop();
      }
    },
    watch: {
      stop(value) {
        console.log(value)
        if ( value ) {
          this.stopLadda()
        }
      }
    }
  }
</script>