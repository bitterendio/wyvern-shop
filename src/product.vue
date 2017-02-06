<style lang="sass">
  @import './../_variables.scss';

  .product__detail {
    display: flex;
    & > * {
      flex: 1;
    }
  }

  .product__detail--left {

  }

  .product__detail--right {
    max-width: $sidebar-width;
  }

  .product__gallery__preview {
    img {
      max-width: 100%;
      height: auto;
    }
  }

  .product__gallery__wrapper {
    display: flex;
    flex-wrap: wrap;
  }

  .product__gallery__item {
    cursor: pointer;
    flex: 1;
    max-width: 25%;
    border: 2px solid $link-color;
    text-align: center;
    &:hover {
      border-color: $hover-color;
    }
  }

  .available_variations {
    list-style-type: none;
    padding-left: 5px;
    padding-bottom: 5px;
    li {
      cursor: pointer;
      display: block;
      padding: 5px 10px;
      margin-bottom: 5px;
      border: 1px solid #ccc;
      &.active, &:hover {
        border: 1px solid #444;
      }
      &.attribute_pa_velikost {
        float: left;
        display: block;
        margin: 10px 10px -5px -5px;
        background-color: #999;
        border: 1px solid #999;
        color: #fff;
        .variation__attribute__label {
          display: none;
        }
        &.active, &:hover {
          border: 1px solid #444;
          background-color: #444;
        }
      }
    }
  }

  .available_variations--table {
    .variation__image {
      width: 80px;
      img {
        width: 80px;
        height: 80px;
      }
    }
    .variation__description {
      padding-left: 20px;
    }
    .variation__price {
      width: 100px;
    }
    .variation__buy {
      width: 150px;
    }
    .variation__buy__btn {
      padding: 4px 8px;
      font-size: 12px;
    }
  }

  .table-attributes {
    td, th {
      vertical-align: top;
      padding-top: 0;
    }
  }
</style>

<template>
  <div class="page content" :class="[product.slug, product.template]">

    <div class="container cols" v-if="product.id">

      <sidebar></sidebar>

      <div class="main">

        <div class="product__detail">

          <div class="product__detail--left">

            <div class="product__gallery__preview">
              <img :src="product_gallery_preview"
                    :width="product.images.large[1]"
                    :height="product.images.large[2]"
                    :alt="product.title">
            </div>

            <div class="product__gallery__wrapper">
              <div @click="showGallery(product.images.full[0])" class="product__gallery__item">
                <img  :src="product.images.thumbnail[0]"
                      :width="product.images.thumbnail[1]"
                      :height="product.images.thumbnail[2]"
                      :alt="product.title">
              </div>

              <div v-for="(image, index) in product.gallery.thumbnail" @click="showGallery(product.gallery.full[index][0])" class="product__gallery__item">
                <img  :src="image[0]"
                      :width="image[1]"
                      :hight="image[2]"
                      :alt="product.title">
              </div>
            </div>

          </div>

          <div class="product__detail--right">

            <h1 class="entry-title">{{ decode(product.title) }}</h1>

            <span v-html="product.formatted_prices.regular" class="price price--regular"></span>

            <ladda @click="addToCart(product)"
                   :stop="added"
                   color="green"
                   laddastyle="contract"
                   autostart="false">
              {{ lang.add_to_cart }}
            </ladda>

            <!-- Variation selection: List -->
            <ol class="available_variations" v-if="!settings.wyvern_theme_options_woocommerce.variations_table">
              <li v-for="variation in product.available_variations" v-if="variation.variation_is_active && variation.variation_is_visible" @click="selectVariation(variation)" :class="[{ 'active' : variation.variation_id == selected_variation }, getAttributeClass(variation.attributes) ]">
                <span v-for="(value, key) in variation.attributes" :class="[ key + '__item' ]">
                  <span class="variation__attribute__label">{{ getAttributeByKey(key) }}</span>
                  <span class="variation__attribute__value">{{ value }}</span>
                </span>
              </li>
            </ol>

            <!-- Attributes table -->
            <table class="table table-attributes">
              <tbody>
                <tr v-for="(attribute, key) in product.attributes" v-if="attribute.length > 0 && isNotVariationAttribute(key, attribute, product.available_variations)">
                  <th class="text-left">{{ getAttributeByKey(key) }}</th>
                  <td>
                    <ul>
                      <li v-for="value in attribute">
                        {{ value.name }}
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>

        </div>

        <div class="entry-content" v-html="product.content">
        </div>

        <!-- Variation selection: Table -->
        <table class="table available_variations--table" v-if="settings.wyvern_theme_options_woocommerce.variations_table">
          <tbody>
            <tr v-for="variation in product.available_variations" v-if="variation.variation_is_active && variation.variation_is_visible" :class="[{ 'active' : variation.variation_id == selected_variation }, getAttributeClass(variation.attributes) ]">
              <td class="variation__image">
                <img v-if="variation.image_src != ''" :src="variation.image_src">
                <img  v-else
                      :src="product.images.thumbnail[0]"
                      :width="product.images.thumbnail[1]"
                      :height="product.images.thumbnail[2]"
                      :alt="product.title">
              </td>
              <td class="variation__description">
                <span v-for="(value, key) in variation.attributes" :class="[ key + '__item' ]">
                  <span class="variation__attribute__label">{{ getAttributeByKey(key) }}</span>
                  <span class="variation__attribute__value">{{ value }}</span>
                </span>
              </td>
              <td class="variation__price">
                {{ price(variation.display_price) }}
              </td>
              <td class="variation__buy">
                <ladda @click="addVariationToCart(product, variation)"
                       :stop="added"
                       color="green"
                       laddastyle="contract"
                       autostart="false"
                      class="variation__buy__btn">
                  {{ lang.add_to_cart }}
                </ladda>
              </td>
            </tr>
          </tbody>
        </table>

        <component is="levels" :object="product"></component>

      </div>

    </div>

  </div>
</template>

<script>
  var querystring = require('querystring')

  export default {
    mounted() {
      var vm = this
      window.wyvern.http.get(wp.root + 'api/products/' + vm.$route.meta.postId).then((response) => {
        vm.product = response.data
        vm.product_gallery_preview = vm.product.images.large[0]

        vm.product.available_variations.forEach((variation) => {
          for ( let key in variation.attributes ) {
            let attribute = variation.attributes[key]
            if ( attribute == vm.product.default_attributes_variation[vm.getAttributeSlugByKey(key)] ) {
              vm.selectVariation(variation)
            }
          }
        })
      })
    },

    data() {
      return {
        product: {
          id: 0
        },
        product_gallery_preview: null,
        quantity: 1,
        added: false,
        wp: window.wp,
        lang: window.lang,
        selected_variation: null,
        variation: null,
        settings: window.settings
      }
    },

    methods: {
      showGallery(url) {
        this.product_gallery_preview = url
      },
      addToCart(product) {
        let vm = this
            this.added = false

        let query = querystring.stringify({
          'variation_id' : this.selected_variation,
          'quantity' : this.quantity,
          'variation' : JSON.stringify(this.variation)
        })

        window.wyvern.http.post(wp.root + 'api/cart/' + product.id + '/?' + query).then((response) => {
          window.eventHub.$emit('cart-add', vm.quantity)
          window.eventHub.$emit('message', {
            type: 'success',
            message: 'Zboží bylo úspěšně přidáno do košíku'
          })
          this.added = true
        })
      },
      addVariationToCart(product, variation) {
        this.selectVariation(variation)
        this.addToCart(product)
      },
      selectVariation(selected_variation) {
        this.selected_variation = selected_variation.variation_id

        let variation = {}

        for ( var key in selected_variation.attributes )
        {
          let item = selected_variation.attributes[key]
          variation[this.getAttributeByKey(key)] = item
        }

        if ( typeof selected_variation.image_src !== 'undefined' && selected_variation.image_src !== '' )
          this.showGallery(selected_variation.image_src)

        if ( typeof selected_variation.display_price !== 'undefined' )
          this.product.formatted_prices.regular = this.price(selected_variation.display_price)

        this.variation = variation
      },
      getAttributeByKey(key) {
        let attribute_key = key.replace('attribute_pa_', '')
        return this.wp.attributes[attribute_key].label
      },
      getAttributeSlugByKey(key) {
        return key.replace('attribute_pa_', '')
      },
      getAttributeClass(attributes) {
        return Object.keys(attributes).join(' variations__')
      },
      isNotVariationAttribute(main_attribute_key, attribute, available_variations) {
        let variated_attributes = [],
            attribute_woo_prefix = 'attribute_pa_'

        for ( let key in available_variations )
        {
          let keys = Object.keys(available_variations[key].attributes)
          for ( let i in keys )
          {
            let attribute_key = keys[i]
            variated_attributes[attribute_key] = attribute_key
          }
        }

        return typeof variated_attributes[attribute_woo_prefix + main_attribute_key] === 'undefined'
      }
    },

    route: {
      canReuse() {
        return false;
      }
    }
  }
</script>