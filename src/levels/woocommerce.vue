<style lang="sass">
  $product-image-width: 260px;
  $product-image-height: 260px;

  $columns: 3;

  .products {
    display: flex;
    flex-wrap: wrap;
  }

  .product {
    cursor: pointer;
    position: relative;
    padding: 40px;
    flex: 1;
    width: 100%/$columns;
    max-width: 100%/$columns;
    min-width: 100%/$columns;
  }

  .product__image__wrapper {
    text-align: center;
  }

  .product__image {
    margin: 0 auto;
    width: $product-image-width;
    height: $product-image-height;
    line-height: $product-image-height;
    display: block;
    max-width: 100%;
    img {
      vertical-align: middle;
      max-width: 100%;
      height: auto;
    }
  }

  .colors {
    position: absolute;
    list-style-type: none;
    top: 40px;
    left: 40px;
    padding-left: 0;
  }

  .color {
    display: inline-block;
    min-width: 20px;
    height: 20px;
    line-height: 20px;
    margin-right: 10px;
    border-radius: 1px;
    cursor: pointer;
    overflow: hidden;

    span {
      display: block;
      overflow: hidden;
      font-size: 10px;
      text-transform: uppercase;
      color: #fff;
      font-weight: 700;
      transition: all 0.5s;
      width: 0;
    }
    &:hover {
      span {
        display: inline-block;
        padding-left: 20px;
        padding-right: 10px;
        width: 100px;
      }
    }
  }
</style>

<template>
  <div class="products catalog">

    <div v-for="product in products" class="product" @click="showProduct(product)" v-if="product.attributes">

      <ul class="colors" v-if="product.attributes.barva">
        <li v-for="barva in product.attributes.barva" :style="{ backgroundColor: barva.barva }" class="color">
          <span>{{ barva.name }}</span>
        </li>
      </ul>

      <div class="product__image__wrapper">
        <div class="product__image" :data-product_id="product.id">
          <img  :src="product.images.product_image[0]"
                :width="product.images.product_image[1]"
                :height="product.images.product_image[2]"
                :alt="product.title">
          <img  v-for="image in product.gallery.product_image"
                :src="image[0]"
                :width="image[1]"
                :hight="image[2]"
                :alt="product.title"
                class="hidden">
        </div>
      </div>

      <h3 class="product__title">{{ product.title }}</h3>

      <div class="product__excerpt">
        {{ product.excerpt }}
      </div>

      <span v-html="product.formatted_prices.regular" class="price price--regular"></span>

      <button type="button" @click="addProduct(product)" class="btn btn--cart">
        Add to cart
      </button>

    </div>

  </div>
</template>

<script>
  var jQuery = require('jquery')

  export default {

    props: ['level'],

    mounted() {
      this.getProducts()
    },

    methods: {
      getProducts() {
        let vm = this

        let query = jQuery.param( { filters: vm.filters } )

        window.wyvern.http.get(wp.root + 'api/products/?' + query).then((response) => {
          vm.products = response.data
        })
      },
      addProduct(product) {

      },
      showProduct(product) {
        this.$router.push({path: product.permalink})
      },
      setFilters(filters) {
        this.filters = filters

        this.getProducts()
      },
      setFilter(name, value) {
        this.filters[name] = value

        this.getProducts()
      }
    },

    updated() {
      let vm = this

      // Mousemove gallery
      if ( this.mousemove_gallery ) {
        let images = document.querySelectorAll('.product__image')

        images.forEach((image) => {

          // Swap images on gallery mousemove
          image.addEventListener('mousemove', (event) => {
            let bodyRect    = document.body.getBoundingClientRect(),
                elemRect    = image.getBoundingClientRect(),
                offset      = elemRect.left - bodyRect.left,
                max         = elemRect.width + offset,
                share       = (event.clientX - offset)/elemRect.width,
                order       = Math.abs( parseInt(share / 0.25, 10) ),
                imgs        = image.querySelectorAll('img')

            if ( typeof imgs[order] !== 'undefined' ) {
              imgs.forEach((img) => {
                vm.addClass(img, 'hidden')
              })
              vm.removeClass(imgs[order], 'hidden')
            }
          })

          // Set #1 image on gallery mouseleave
          image.addEventListener('mouseleave', (event) => {
            let imgs        = image.querySelectorAll('img'),
                order       = 0

            if ( imgs.length > 1 ) {
              imgs.forEach((img) => {
                vm.addClass(img, 'hidden')
              })
              vm.removeClass(imgs[order], 'hidden')
            }
          })
        })
      }
    },

    data() {
      return {
        products: [],

        filters: {},

        mousemove_gallery: true
      }
    },

    created() {
      window.eventHub.$on('filters-changed', this.setFilters)
      window.eventHub.$on('filter-changed', this.setFilter)
    },

    beforeDestroy() {
      window.eventHub.$off('filters-changed')
      window.eventHub.$off('filter-changed')
    }
  }
</script>