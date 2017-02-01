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

            <h1 class="entry-title">{{ product.title }}</h1>

            <ladda @click="addToCart(product)"
                   :stop="added"
                   color="green"
                   laddastyle="contract"
                   autostart="false">
              Add to cart
            </ladda>

          </div>

        </div>

        <div class="entry-content" v-html="product.content">
        </div>

        <component is="levels" :object="product"></component>

      </div>

    </div>

  </div>
</template>

<script>

  export default {
    mounted() {
      var vm = this
      window.wyvern.http.get(wp.root + 'api/products/' + vm.$route.meta.postId).then((response) => {
        vm.product = response.data
        vm.product_gallery_preview = vm.product.images.large[0]
      })
    },

    data() {
      return {
        product: {
          id: 0
        },
        product_gallery_preview: null,
        lang: wp.lang,
        amount: 1,
        added: false
      }
    },

    methods: {
      showGallery(url) {
        this.product_gallery_preview = url
      },
      addToCart(product) {
        let vm = this
            this.added = false

        window.wyvern.http.post(wp.root + 'api/cart/' + product.id).then((response) => {
          window.eventHub.$emit('cart-add', vm.amount)
          window.eventHub.$omit('message', {
            type: 'success',
            message: 'Zbozi bylo uspesne pridano do kosiku'
          })
          this.added = true
        })
      }
    },

    route: {
      canReuse() {
        return false;
      }
    }
  }
</script>