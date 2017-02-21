<style lang="sass">

  .number-picker {
    display: flex;
  }

  .number-picker > * {
    flex: 1;
    border: 1px solid #000;
    line-height: 1em;
    padding: 0.5em 1em;
    text-align: center;
  }

  .number-picker > *:nth-child(2) {
    border-right: 0;
    border-left: 0;
  }

</style>

<template>
  <div class="number-picker">
    <button type="button" @click="decrease()" @click.shift="decrease(10)" class="number-picker__button">-</button>
    <span class="number-picker__value">{{ local_value }}</span>
    <button type="button" @click="increase()" @click.shift="increase(10)" class="number-picker__button">+</button>
  </div>
</template>

<script>
  export default {

    props: ['default_value'],

    mounted() {
      if (typeof this.default_value === 'undefined') {
        this.local_value = 1;
      } else {
        this.local_value = this.default_value;
      }
    },

    data() {
      return {
        local_value: 0,
        step: 1,
      };
    },

    computed: {

    },

    methods: {
      decrease(step) {
        let localStep = step;

        if (typeof step === 'undefined') {
          localStep = this.step;
        }

        this.local_value = parseInt(this.local_value, 10) - parseInt(localStep, 10);
      },
      increase(step) {
        let localStep = step;

        if (typeof step === 'undefined') {
          localStep = this.step;
        }

        this.local_value = parseInt(this.local_value, 10) + parseInt(localStep, 10);
      },
    },

    watch: {
      local_value(value) {
        this.$emit('input', value);
        this.$emit('valuechange');
      },
    },

    created() {
    },

    beforeDestroy() {
    },
  };
</script>
