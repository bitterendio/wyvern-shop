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
              <tbody :summary="page.title.rendered">
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
                  <td>
                    <button type="button" @click="updateQuantity(key, 0)">
                      {{ lang.remove_from_cart }}
                    </button>
                  </td>
                  <td class="item__row__total">
                    {{ price(item.line_total) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals__subtotal">
                  <td colspan="2">
                    {{ lang.subtotal }}
                  </td>
                  <td colspan="3" class="text-right">
                    {{ price(cart.subtotal) }}
                  </td>
                </tr>
                <tr class="totals__delivery">
                  <td colspan="2">
                    {{ lang.shipping_total }}
                  </td>
                  <td colspan="3" class="text-right">
                    {{ price(cart.shipping_total) }}
                  </td>
                </tr>
                <tr class="totals__total">
                  <td colspan="2">
                    {{ lang.total }}
                  </td>
                  <td colspan="3" class="text-right">
                    {{ price(cart.total) }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <button type="button" @click="emptyCart()">
              {{ lang.empty_cart }}
            </button>

            <div class="entry-content" v-html="page.content.rendered">
            </div>

          </div>

          <div class="secondary">

            <div class="form-group">
              <input type="text" v-model="billing_address.name" class="form-control" :placeholder="lang.first_name_and_last_name">
            </div>

            <div class="form-group">
              <input type="text" v-model="billing_address.phone" class="form-control" :placeholder="lang.phone">
            </div>

            <div class="form-group">
              <input type="text" v-model="billing_address.email" class="form-control" :placeholder="lang.email">
            </div>

            <div class="form-group">
              <textarea rows="2" v-model="billing_address.address" class="form-control" :placeholder="lang.address"></textarea>
            </div>

            <div class="form-group">
              <textarea rows="2" v-model="note" class="form-control" :placeholder="lang.note"></textarea>
            </div>

            <div class="form-group">
              <label>
                <input type="checkbox" v-model="ship_to_different_address">
                {{ lang.ship_to_different_address }}
              </label>
            </div>

            <div v-show="ship_to_different_address">
              <div class="form-group">
                <input type="text" v-model="shipping_address.name" class="form-control" :placeholder="lang.first_name_and_last_name">
              </div>

              <div class="form-group">
                <textarea rows="2" v-model="shipping_address.address" class="form-control" :placeholder="lang.address"></textarea>
              </div>
            </div>

            <div class="form-group order__selection payment__selection">
              <label class="control-label">{{ lang.choose_payment }}</label>
              <div class="order_selection_options">
                <div class="order__option payment__option" v-for="payment in wp.gateways" :class="{ 'active' : isSelected('payment', payment.id) }" @click="select('payment', payment.id)">
                  <code class="order__option__code">{{ payment.id }}</code>
                  <h4 class="order__option__title">{{ payment.title }}</h4>
                  <p class="order__option__description">{{ payment.description }}</p>
                </div>
              </div>
            </div>

            <div class="form-group order__selection shipping__selection">
              <label class="control-label">{{ lang.choose_shipping }}</label>
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
                {{ lang.place_order }}
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

      vm.payment = vm.wp.wc_selected.payment_method
      if ( typeof vm.wp.wc_selected.shipping_methods[0] !== 'undefined' )
        vm.shipping = vm.wp.wc_selected.shipping_methods[0]

      this.updateCart()

      for ( var key in vm.wp.wc_user.billing ) {
        if ( typeof vm.wp.wc_user.billing[key] !== 'undefined' && vm.wp.wc_user.billing[key] !== false ) {
          vm.billing_address[key] = vm.wp.wc_user.billing[key]
        }
      }

      if ( ( typeof vm.wp.wc_user.billing['first_name'] !== 'undefined' || typeof vm.wp.wc_user.billing['last_name'] !== 'undefined' ) && vm.wp.wc_user.billing['first_name'] !== false && vm.wp.wc_user.billing['last_name'] !== false ) {
        vm.billing_address['name'] = vm.wp.wc_user.billing['first_name'] + ' ' + vm.wp.wc_user.billing['last_name']
      }

      if ( (typeof vm.wp.wc_user.billing['address_1'] !== 'undefined' || typeof vm.wp.wc_user.billing['address_2'] !== 'undefined') && vm.wp.wc_user.billing['address_1'] !== false && vm.wp.wc_user.billing['address_2'] !== false ) {
        vm.billing_address['address'] = vm.wp.wc_user.billing['address_1'] + "\n" + vm.wp.wc_user.billing['address_2']
      }
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
        lang: window.lang,
        cart: {},
        payment: null,
        shipping: null,
        shipping_total: 0,
        ship_to_different_address: false,
        shipping_address: {
          'name'   : '',
          'address': '',
        },
        billing_address: {
          'name'   : '',
          'company': '',
          'email'  : '',
          'phone'  : '',
          'address': '',
        },
        note: null
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
          'shipping' : vm.shipping,
          'payment' : vm.payment,
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
        let vm = this

        window.wyvern.http.post(wp.root + 'api/order/', querystring.stringify({
          'shipping_address' : JSON.stringify(vm.shipping_address),
          'billing_address' : JSON.stringify(vm.billing_address),
          'shipping' : vm.shipping,
          'payment' : vm.payment,
          'customer_id' : vm.wp.customer_id,
          'note' : vm.note
        })).then((response) => {
          vm.$set(vm, 'cart', response.data.cart)

          vm.shipping_address = {
            'name'   : '',
            'address': '',
          }

          vm.billing_address = {
            'name'   : '',
            'company': '',
            'email'  : '',
            'phone'  : '',
            'address': '',
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
      isPaymentChanged(property, value) {
        if ( property === 'payment' )
          this.paymentChanged(value)
      },
      shippingChanged(value) {
        if ( typeof value.cost !== 'undefined' )
          this.shipping_total = value.cost

        this.updateCart()
      },
      paymentChanged(value) {
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
      window.eventHub.$on('selected', this.isPaymentChanged)
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
