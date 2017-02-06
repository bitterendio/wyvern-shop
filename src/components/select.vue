<style lang="sass">

  $select-height: 40px;
  $select-option-height: 25px;
  $select-dropdown-max-height: $select-option-height * 6;
  $select-background: #fff;

  .select {
    width: 100%;
    background: $select-background;
    height: $select-height;
    line-height: $select-height;
    cursor: pointer;
    position: relative;
    font-size: 0.75em;
    text-transform: uppercase;

    &:after {
      content: "";
      display: block;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid #000;
      opacity: 0.25;
      position: absolute;
      top: ($select-height - 5px)/2;
      right: $select-height/2;
    }

    &:hover {
      .select__values {
        box-shadow: 0 2px 2px rgba(0,0,0,0.4);
      }
      &:after {
        opacity: 1;
      }
    }

    &.opened {
      box-shadow: 0 1px 1px rgba(0,0,0,0.2);
      &:hover {
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.4);
      }
      &:after {
        opacity: 1;
      }
    }
  }

  .select__values {
    position: absolute;
    z-index: 2;
    background: $select-background;
    width: 100%;
    box-shadow: 0 1px 1px rgba(0,0,0,0.2);
    max-height: $select-dropdown-max-height;
    overflow-y: auto;
  }

  .select__value, .select__label {
    padding: 0 15px;
  }

  .select__value {
    height: $select-option-height;
    line-height: $select-option-height;
    width: 100%;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }

  .selected__value {
    text-align: right;
    float: right;
    padding-right: 20px;
    opacity: 0.5;
  }

</style>

<template>
  <div class="select" @click="showValues()" :class="{'opened' : show_values}">
    <div class="select__label">
      {{ current_label }}
      <span class="selected__value">{{ current_value }}</span>
    </div>
    <div class="select__values" v-show="show_values">
      <div v-for="value in attribute.values" class="select__value" @click="select(value.term_id)">
        {{ value.name }}
      </div>
    </div>
  </div>
</template>

<script>
  export default {

    props: ['attribute', 'multiple'],

    mounted() {
      if ( typeof this.attribute.label !== 'undefined' )
        this.current_label = this.attribute.label
    },

    data() {
      return {
        wp: window.wp,
        current_label: null,
        values: [],

        show_values: false,
        lang: window.lang
      }
    },

    computed: {
      current_value() {
        let vm = this,
            output = []
        this.values.forEach((item) => {
          // @todo: IE
          let index = vm.attribute.values.findIndex(value => value.term_id === item)

          output.push(vm.attribute.values[index].name)
        })

        if ( output.length == 0 )
          return this.lang.all

        return output.join(', ')
      }
    },

    methods: {
      showValues(state) {
        if ( typeof state === 'undefined' )
          state = !this.show_values

        this.show_values = state
      },
      selectShown(uid, state) {
        if ( this._uid !== uid )
          this.show_values = false
      },
      select(value) {
        let index = this.values.indexOf(value)

        if ( index > -1 )
          this.values.splice(index, 1)
        else
          this.values.push(value)
      }
    },

    watch: {
      'show_values'(value) {
        if ( value )
          window.eventHub.$emit('select-values-shown', this._uid, value)
        else
          window.eventHub.$emit('select-values-hidden', this._uid, value)
      },
      'values'(value) {
        this.$emit('input', this.values)
      }
    },

    // Create listeners
    created() {
      window.eventHub.$on('select-values-shown', this.selectShown)
    },

    // It's good to clean up event listeners before
    // a component is destroyed.
    beforeDestroy() {
      window.eventHub.$off('select-values-shown')
    },
  }
</script>