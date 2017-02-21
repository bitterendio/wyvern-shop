<style lang="sass">
  .brand-select {
    padding-top: 60px;
  }
  .brand-select {
    cursor: pointer;
    h5 {
      color: #aaa;
    }
    h5, h4 {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  .slider__link {
    color: #aaa;
    font-size: 13px;
    text-transform: uppercase;
    font-weight: 700;
  }
</style>

<template>
  <div class="page content" :class="[page.slug, page.template]">

    <div v-show="page.id" class="container cols">

      <sidebar></sidebar>

      <div class="main">

        <!-- Selection guide -->
        <div id="selection-guide" class="selection-guide" :class="{'hidden':!show_guide, 'changing':slider_changing}" :style="{backgroundColor : sliderColor}">
          <h2 class="headline--guide" :style="{borderColor:sliderColor}">
            <span>
              Průvodce výběrem
            </span>
          </h2>
          <div class="filters container animated animated--all" v-show="show_filters">
            <div v-for="attribute in wp.attributes" class="filter">
              <select-component :attribute="attribute" v-model="filters[attribute.name]"></select-component>
            </div>
          </div>
          <button type="button" class="btn btn--search btn--guide" :style="{borderColor : sliderColor}">
            Vyhledat
          </button>
          <div class="slider__image__wrapper">
            <img :src="sliderImage" class="selection__image">
          </div>
        </div>

        <!-- Choose brands -->
        <div class="cols" :class="{'hidden':!show_guide}">
          <div class="brand-select">
            <h5>Vyberte podle</h5>
            <h4>Značky</h4>
          </div>
          <div class="brand-select" @click="selectFilter('znacka', 121)">
            <img :src="wp.assets_path + '/images/keen.png'">
          </div>
          <div class="brand-select" @click="selectFilter('znacka', 49)">
            <img :src="wp.assets_path + '/images/kidofit.png'">
          </div>
          <div class="brand-select" @click="selectFilter('znacka', 86)">
            <img :src="wp.assets_path + '/images/froddo.png'">
          </div>
          <div class="brand-select">
            <h5>Na ilustračním obrázku</h5>
            <h4>{{ sliderName }}</h4>
            <router-link :to="sliderUrl" class="slider__link">Zobrazit produkt</router-link>
          </div>
        </div>

        <h1 class="entry-title">{{ page.title.rendered }}</h1>

        <div class="entry-content" v-html="page.content.rendered">
        </div>

        <component is="levels" :object="page" :class="{'hidden':show_guide}"></component>

      </div>

    </div>

  </div>
</template>

<script>

  export default {
    computed: {
      sliderImage() {
        return this.slider_images[this.slider_position];
      },
      sliderColor() {
        return this.slider_colors[this.slider_position];
      },
      sliderName() {
        return this.slider_names[this.slider_position];
      },
      sliderUrl() {
        return this.slider_urls[this.slider_position];
      },
    },

    mounted() {
      // Set default filters
      const filters = {};
      Object.keys(this.wp.attributes).forEach((key) => {
        filters[key] = null;
      });

      // Get route filters
      if (typeof this.attributeName !== 'undefined' && this.attributeValue !== 'undefined') {
        filters[this.attributeName] = this.attributeValue;
        window.eventHub.$emit('filter-set', this.attributeName, this.attributeValue);
        this.show_guide = false;
      }

      this.$set(this, 'filters', filters);

      this.getPage((data) => {
        this.page = data;
        this.page.filters = this.filters;
        window.eventHub.$emit('page-title', this.page.title.rendered);
        window.eventHub.$emit('track-ga');
      });

      // Footer menu
      this.getMenuLocation('footer', (response) => {
        this.menu = response;
      });

      // Slider
      this.slider_interval = setInterval(() => {
        this.slider_position += 1;
        if (typeof this.slider_images[this.slider_position] === 'undefined') {
          this.slider_position = 0;
        }
        this.slider_changing = true;
        setTimeout(() => {
          this.slider_changing = false;
        }, this.slider_animation_duration);
      }, this.slider_delay);
    },

    props: ['attributeName', 'attributeValue'],

    data() {
      return {
        page: {
          id: 0,
          slug: '',
          title: { rendered: '' },
          content: { rendered: '' },
        },
        lang: window.lang,
        wp: window.wp,
        menu: [],
        filters: {},
        show_filters: true,
        show_guide: true,

        slider_image: '/wp-content/themes/wyvern-shop/assets/images/berboty1.jpg',
        slider_images: [
          '/wp-content/themes/wyvern-shop/assets/images/berboty1.jpg',
          '/wp-content/themes/wyvern-shop/assets/images/berboty2.jpg',
          '/wp-content/themes/wyvern-shop/assets/images/berboty3.jpg',
        ],
        slider_colors: [
          '#d0ea00',
          '#d645d6',
          '#87dac8',
        ],
        slider_names: [
          'KIDS Chandler CNX',
          'KIDS Chandler CNX',
          'KIDS Seacamp II CNX',
        ],
        slider_urls: [
          '/produkt/kids-chandler-cnx/',
          '/produkt/kids-chandler-cnx-2/',
          '/produkt/kids-seacamp-ii-cnx-2/',
        ],
        slider_interval: null,
        slider_delay: 5000,
        slider_position: 0,
        slider_changing: false,
        slider_animation_duration: 1000,
      };
    },

    methods: {
      setFilters(filters) {
        this.filters = filters;
        this.toggleGuide();
      },
      setFilter(name, value) {
        this.filters[name] = value;
        this.toggleGuide();
      },
      selectFilter(name, value) {
        window.eventHub.$emit('filter-changed', name, value);
      },
      toggleGuide() {
        Object.keys(this.filters).forEach((key) => {
          if (this.filters[key] !== null) {
            this.show_guide = false;
          }
        });
      },
      showGuide() {
        this.show_guide = true;
      },
    },

    created() {
      window.eventHub.$on('filters-changed', this.setFilters);
      window.eventHub.$on('filter-changed', this.setFilter);
      window.eventHub.$on('site-title-click', this.showGuide);
    },

    beforeDestroy() {
      window.eventHub.$off('filters-changed', this.setFilters);
      window.eventHub.$off('filter-changed', this.setFilter);
      window.eventHub.$off('site-title-click', this.showGuide);
    },

    watch: {
      filters() {
        this.toggleGuide();
      },
      $route() {
        // Set default filters
        const filters = {};
        Object.keys(this.wp.attributes).forEach((key) => {
          filters[key] = null;
        });

        // Get route filters
        if (typeof this.attributeName !== 'undefined' && this.attributeValue !== 'undefined') {
          filters[this.attributeName] = this.attributeValue;
          window.eventHub.$emit('filter-set', this.attributeName, this.attributeValue);
        }

        this.$set(this, 'filters', filters);
      },
    },

    route: {
      canReuse() {
        return false;
      },
    },
  };
</script>
