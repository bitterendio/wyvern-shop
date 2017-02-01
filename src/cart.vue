<style lang="sass">
  @import './../_variables.scss';

  .table--cart {
    .product__title {
      margin-bottom: 0;
    }
    p {
      margin-top: 0;
      font-size: 14px;
    }
  }

  .item__row__thumbnail {
    width: 60px;
  }

  .item__row__info {
    padding-left: 40px;
  }

  .cols {
    & > .secondary {
      max-width: 590px;
      padding-left: 40px;
    }
  }
</style>

<template>
  <div class="page content" :class="[page.slug, page.template]">

    <div v-show="page.id">

      <component is="levels" :object="page"></component>

      <div class="container">

        <div class="cols">

          <div class="primary">

            <h1 class="entry-title">{{ page.title.rendered }}</h1>

            <table class="table table--cart" v-if="cart.cart_contents">
              <tbody summary="Nákupní košík">
                <tr v-for="(item, key) in cart.cart_contents">
                  <td class="item__row__thumbnail">
                    <img v-if="item.thumbnail"
                          :src="item.thumbnail"
                          width="60"
                          height="60"
                          :alt="item.data.post.post_title">
                  </td>
                  <td class="item__row__info">
                    <h3 class="product__title">{{ item.data.post.post_title }}</h3>
                    <p class="product_description">
                      <span v-for="(value, label) in item.variation">
                        <span class="product__variation__label">{{ label }}</span>
                        <span class="product__variation__value">{{ value }}</span>
                      </span>
                    </p>
                  </td>
                  <td class="item__row__quantity">
                    <input type="number" v-model="item.quantity" @change="updateQuantity(key, item.quantity)">
                  </td>
                  <td class="item__row__total">
                    {{ price(item.line_total) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals__subtotal">
                  <td colspan="2">
                    Zboží celkem
                  </td>
                  <td colspan="2" class="text-right">
                    {{ price(cart.subtotal) }}
                  </td>
                </tr>
                <tr class="totals__delivery">
                  <td colspan="2">
                    Doprava
                  </td>
                  <td colspan="2" class="text-right">
                    {{ price(cart.shipping_total) }}
                  </td>
                </tr>
                <tr class="totals__total">
                  <td colspan="2">
                    Cena celkem
                  </td>
                  <td colspan="2" class="text-right">
                    {{ price(cart.total) }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <button type="button" @click="emptyCart()">
              Vyprázdnit košík
            </button>

            <div class="entry-content" v-html="page.content.rendered">
            </div>

          </div>

          <div class="secondary">

            <div class="form-group">
              <input type="text" v-model="address.shipping.name" class="form-control" placeholder="Jméno a příjmení">
            </div>

            <div class="form-group">
              <input type="text" v-model="address.shipping.phone" class="form-control" placeholder="Telefon">
            </div>

            <div class="form-group">
              <input type="text" v-model="address.shipping.email" class="form-control" placeholder="E-mail">
            </div>

            <div class="form-group">
              <textarea rows="2" v-model="address.shipping.address" class="form-control" placeholder="Adresa"></textarea>
            </div>

            <div class="form-group order__selection payment__selection">
              <label class="control-label">Platba</label>
              <div class="order_selection_options">
                <div class="order__option payment__option" v-for="payment in wp.gateways" :class="{ 'active' : isSelected('payment', payment.id) }" @click="select('payment', payment.id)">
                  <code class="order__option__code">{{ payment.id }}</code>
                  <h4 class="order__option__title">{{ payment.title }}</h4>
                  <p class="order__option__description">{{ payment.description }}</p>
                </div>
              </div>
            </div>

            <div class="form-group order__selection shipping__selection">
              <label class="control-label">Doprava</label>
              <div class="order_selection_options">
                <div class="order__option shipping__option" v-for="shipping in wp.shipping" :class="{ 'active' : isSelected('shipping', shipping.id) }" @click="selectShipping(shipping)">
                  <code class="order__option__code">{{ shipping.id }}</code>
                  <h4 class="order__option__title">{{ shipping.title }}</h4>
                  <p  class="order__option__description">{{ shipping.description }}</p>
                  <span>{{ price(shipping.cost) }}</span>
                </div>
              </div>
            </div>

            <div class="form-group">
              <button type="button" @click="order()">
                Objednat
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>

<script>
  var querystring = require('querystring')

  export default {
    mounted() {
      var vm = this;
      this.getPage(function(data){
        vm.page = data
        window.eventHub.$emit('page-title', vm.page.title.rendered)
        window.eventHub.$emit('track-ga')
      })

      this.updateCart()
    },

    data() {
      return {
        page: {
          id: 0,
          slug: '',
          title: { rendered: '' },
          content: { rendered: '' }
        },
        wp: window.wp,
        lang: wp.lang,
        cart: {},
        payment: null,
        shipping: null,
        shipping_total: 0,
        address: {
          billing : {
            'name'   : '',
            'company': '',
            'email'  : '',
            'phone'  : '',
            'address': '',
          },
          shipping: {
            'name'   : '',
            'company': '',
            'email'  : '',
            'phone'  : '',
            'address': '',
          }
        }
      }
    },

    methods: {
      emptyCart() {
        let vm = this
        window.wyvern.http.get(wp.root + 'api/empty-cart/').then((response) => {
          vm.cart = {}

          window.eventHub.$emit('empty-cart')
        })
      },
      updateCart() {
        let vm = this

        let params = querystring.stringify({
          'shipping_total' : vm.shipping_total,
          'shipping' : vm.shipping
        })

        window.wyvern.http.get(wp.root + 'api/cart/?' + params).then((response) => {
          vm.cart = response.data

          // Set images for all items
          for( let key in vm.cart.cart_contents ) {
            let item = vm.cart.cart_contents[key]

            window.wyvern.http.get(wp.root + 'api/thumbnails/' + item.data.post.ID).then((response) => {
              vm.$set(vm.cart.cart_contents[key], 'thumbnail', response.data)
            })
          }
        })
      },
      updateQuantity(id, quantity) {
        let vm = this
        window.wyvern.http.post(wp.root + 'api/quantity/', querystring.stringify({
          'id' : id,
          'quantity' : quantity
        })).then((response) => {
          vm.$set(vm, 'cart', response.data.cart)

          window.eventHub.$emit('update-cart', response.data.cart, response.data.cart_total)
        })
      },
      order() {
        let vm = this,
            address = JSON.stringify(vm.address)

        window.wyvern.http.post(wp.root + 'api/order/', querystring.stringify({
          'address' : address,
          'shipping' : vm.shipping,
          'payment' : vm.payment
        })).then((response) => {
          vm.$set(vm, 'cart', response.data.cart)

          vm.address = {
            billing : {
              'name'   : '',
              'company': '',
              'email'  : '',
              'phone'  : '',
              'address': '',
            },
            shipping: {
              'name'   : '',
              'company': '',
              'email'  : '',
              'phone'  : '',
              'address': '',
            }
          }

          window.eventHub.$emit('update-cart', response.data.cart, response.data.cart_total)

          if ( typeof response.data.redirect === 'undefined' )
            return;

          if ( response.data.redirect === '' )
            return;

          window.location.href = response.data.redirect
        })
      },
      isShippingChanged(property, value) {
        if ( property === 'shipping' )
          this.shippingChanged(value)
      },
      shippingChanged(value) {
        if ( typeof value.cost !== 'undefined' )
          this.shipping_total = value.cost

        this.updateCart()
      },
      selectShipping(shipping) {
        this.shipping = shipping.id
        window.eventHub.$emit('selected', 'shipping', shipping)
      },
      select(property, value) {
        this[property] = value
        window.eventHub.$emit('selected', property, value)
      },
      isSelected(property, value) {
        return this[property] == value
      }
    },

    created() {
      window.eventHub.$on('selected', this.isShippingChanged)
    },

    beforeDestroy() {
      window.eventHub.$off('selected')
    },

    route: {
      canReuse() {
        return false;
      }
    }
  }
</script>
