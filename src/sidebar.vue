<style>

</style>

<template>
  <div class="sidebar animated animated--all">
    <ul class="list-nav">
      <li v-for="value in wp.attributes.druh.values">
        <a @click="selectFilter('druh', value.term_id)" :class="{ 'active' : isSelected('druh', value.term_id) }">
          {{ value.name }}
        </a>
      </li>
    </ul>

    <ul class="list-nav list-nav--footer">
      <li class="item--social">
        <a href="#" target="_blank">
          <i class="icon icon__social icon--facebook"></i>
        </a>
      </li>
      <li class="item--social">
        <a href="#" target="_blank">
          <i class="icon icon__social icon--instagram"></i>
        </a>
      </li>
      <li v-for="item in menu">
        <router-link :to="{ path: url2Slug(item.url) }">{{ item.title }}</router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    mounted() {
      const vm = this;
      this.getMenuLocation('footer', (response) => {
        vm.menu = response;
      });
    },

    data() {
      return {
        wp: window.wp,
        menu: [],
        filters: {},
      };
    },

    methods: {
      selectFilter(name, value) {
        window.eventHub.$emit('filter-changed', name, value);
      },
      setFilters(filters) {
        this.filters = filters;
      },
      setFilter(name, value) {
        this.filters[name] = value;
      },
      isSelected(name, value) {
        if (typeof this.filters === 'undefined') {
          return false;
        }

        if (typeof this.filters[name] === 'undefined') {
          return false;
        }

        if (this.filters[name] === null) {
          return false;
        }

        if (this.filters[name] === value) {
          return true;
        }
        if (Object.prototype.toString.call(this.filters[name]) === '[object Array]') {
          if (this.filters[name].indexOf(value) > -1) {
            return true;
          }
        }

        return false;
      },
    },

    created() {
      window.eventHub.$on('filters-changed', this.setFilters);
      window.eventHub.$on('filter-changed', this.setFilter);
    },

    beforeDestroy() {
      window.eventHub.$off('filters-changed');
      window.eventHub.$off('filter-changed');
    },
  };
</script>
