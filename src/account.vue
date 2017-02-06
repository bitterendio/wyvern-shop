<style>

</style>

<template>
  <div class="page content account">

    <div class="cols container" v-if="logged_in">

      <div class="main tabs">

        <div v-show="tab == 'general'">

          <h2>{{ lang.account_general }}</h2>

          <div v-if="user.billing_address">
            <div class="form-group">
              <label for="first_name" class="control-label">{{ lang.first_name }}</label>
              <input type="text" id="first_name" class="form-control" v-model="user.billing_address.first_name" :placeholder="lang.first_name">
            </div>

            <div class="form-group">
              <label for="last_name" class="control-label">{{ lang.last_name }}</label>
              <input type="text" id="last_name" class="form-control" v-model="user.billing_address.last_name" :placeholder="lang.last_name">
            </div>

            <div class="form-group">
              <label for="phone" class="control-label">{{ lang.phone }}</label>
              <input type="text" id="phone" class="form-control" v-model="user.billing_address.phone" :placeholder="lang.phone">
            </div>

            <div class="form-group">
              <label for="email" class="control-label">{{ lang.email }}</label>
              <input type="text" id="email" class="form-control" v-model="user.billing_address.email" :placeholder="lang.email">
            </div>

            <div class="form-group">
              <label for="address" class="control-label">{{ lang.address }}</label>
              <textarea id="address" class="form-control" v-model="user.billing_address.address" :placeholder="lang.aaddress"></textarea>
            </div>

            <div class="form-group">
              <button type="button" class="btn" @click="updateCustomer">
                {{ lang.update }}
              </button>
            </div>
          </div>

        </div>

        <div v-show="tab == 'orders'">
          <h2>{{ lang.account_orders }}</h2>

          <div class="order__list">
            <div v-for="entry in user.orders" class="order__entry" @click="openOrder(entry)">
              <span class="pull-right">
                {{ entry.post_status }}
              </span>
              #{{ entry.id }}
              {{ getDate(entry.order_date) }}

              <div v-show="open == entry.id">
                <div v-if="order.billing_address">
                  <div class="cols">
                    <div>
                      <h4>{{ lang.billing_address }}</h4>
                      <div v-if="order.billing_address" v-html="order.billing_address">
                      </div>
                    </div>
                    <div>
                      <h4>{{ lang.shipping_address }}</h4>
                      <div v-if="order.shipping_address" v-html="order.shipping_address">
                      </div>
                    </div>
                  </div>
                  <div class="cols" v-if="order.notes.length > 0">
                    <div>
                      <h4>{{ lang.notes }}</h4>
                      <div v-for="note in order.notes">
                        {{ note.comment_content }}
                      </div>
                    </div>
                  </div>
                  <div class="cols">
                    <div>
                      <button type="button" @click="cancelOrder(entry)">
                        {{ lang.cancel_order }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="sidebar">

        <h2>{{ lang.account }}</h2>

        <ul class="nav nav--list">
          <li>
            <button type="button" @click="tab = 'general'" :class="{ 'active' : tab == 'general' }">
              {{ lang.account_general }}
            </button>
          </li>
          <li>
            <button type="button" @click="tab = 'orders'" :class="{ 'active' : tab == 'orders' }">
              {{ lang.account_orders }}
            </button>
          </li>
          <li v-if="user.userdata && user.userdata.roles.indexOf('administrator') > -1">
            <a href="/wp-admin">
              {{ lang.go_to_admin }}
            </a>
          </li>
          <li>
            <button type="button" @click="logout">
              {{ lang.logout }}
            </button>
          </li>
        </ul>

      </div>

    </div>

    <div class="cols container" v-if="!logged_in">

      <div></div>

      <div>

        <h2 v-if="mode == 'login'">{{ lang.sign_in }}</h2>

        <h2 v-if="mode == 'register'">{{ lang.sign_up }}</h2>

        <button class="btn btn__login btn--lg btn--block btn--facebook" v-if="mode == 'login'" @click="socialLogin('facebook')">
          {{ lang.sign_in_with }} Facebook
        </button>

        <button class="btn btn__login btn--lg btn--block btn--google" v-if="mode == 'login'" @click="socialLogin('google')">
          {{ lang.sign_in_with }} Google
        </button>

        <button class="btn btn__login btn--lg btn--block btn--facebook" v-if="mode == 'register'" @click="socialLogin('facebook')">
          {{ lang.sign_up_with }} Facebook
        </button>

        <button class="btn btn__login btn--lg btn--block btn--google" v-if="mode == 'register'" @click="socialLogin('google')">
          {{ lang.sign_up_with }} Google
        </button>

        <div class="or-line" v-if="mode != 'password'">
          <span>{{ lang.or }}</span>
        </div>

        <div class="form-group form-group--lg" v-if="mode == 'register'">
          <label for="first_name" class="control-label">{{ lang.first_name }}</label>
          <input type="text" id="first_name" v-model="first_name" class="form-control form-control--lg" :placeholder="lang.first_name">
        </div>

        <div class="form-group form-group--lg" v-if="mode == 'register'">
          <label for="last_name" class="control-label">{{ lang.last_name }}</label>
          <input type="text" id="last_name" v-model="last_name" class="form-control form-control--lg" :placeholder="lang.last_name">
        </div>

        <div class="form-group form-group--lg">
          <label for="user_login" class="control-label">{{ lang.username_or_email }}</label>
          <input type="text" id="user_login" v-model="user_login" class="form-control form-control--lg" :placeholder="lang.username_or_email">
        </div>

        <div class="form-group form-group--lg" v-if="mode == 'register' || mode == 'login'">
          <label for="user_password" class="control-label">{{ lang.password }}</label>
          <input type="password" id="user_password" v-model="user_password" class="form-control form-control--lg" :placeholder="lang.password">
        </div>

        <div class="cols form-group form-group--lg">

          <div>
            <label v-if="mode == 'login'">
              <input type="checkbox" v-model="remember">
              {{ lang.remember_me }}
            </label>
          </div>

          <div class="text-right" v-if="mode != 'password'">
            <button @click="mode = 'password'">
              {{ lang.forgot_password }}
            </button>
          </div>

        </div>

        <div class="form-group form-group--lg" v-if="mode == 'login'">
          <ladda @click="login"
                 :stop="authed"
                 color="green"
                 laddastyle="contract"
                 autostart="false">
            {{ lang.sign_in }}
          </ladda>
        </div>

        <div class="form-group form-group--lg" v-if="mode == 'register'">
          <ladda @click="register"
                 :stop="authed"
                 color="green"
                 laddastyle="contract"
                 autostart="false">
            {{ lang.sign_up }}
          </ladda>
        </div>

        <div class="form-group form-group--lg" v-if="mode == 'password'">
          <ladda @click="password"
                 :stop="authed"
                 color="green"
                 laddastyle="contract"
                 autostart="false">
            {{ lang.reset_password }}
          </ladda>
        </div>

        <div class="text-right">
          <button v-if="mode == 'login'" @click="mode = 'register'">
            {{ lang.create_account }}
          </button>
          <button v-if="mode == 'register'" @click="mode = 'login'">
            {{ lang.sign_in }}
          </button>
        </div>

      </div>

      <div></div>

    </div>

  </div>
</template>

<script>
  var querystring = require('querystring');

  var moment = require('moment');
  require('moment/locale/cs');

  export default {
    mounted() {
      let vm = this

      if ( vm.logged_in ) {
        vm.setUserData()
      }

      vm.setSocials()
    },

    data() {
      return {
        user_login: null,
        user_password: null,
        remember: 0,
        authed: false,
        wp: window.wp,
        user: {},
        tab: 'general',
        order: {},
        open: 0,
        mode: 'login', // (login|register|password)
        first_name: null,
        last_name: null,
        socials: {
          facebook: null,
          google: null
        },
        lang: window.lang
      }
    },

    computed: {
      logged_in() {
        return typeof this.wp.customer_id !== 'undefined' && this.wp.customer_id != 0
      }
    },

    methods: {
      login() {
        let vm = this

        vm.authed = false

        window.wyvern.http.post(wp.root + 'api/login/', querystring.stringify({
          user_login: vm.user_login,
          user_password: vm.user_password,
          remember: vm.remember
        })).then((response) => {
          vm.authed = true
          window.wp.customer_id = response.data.data.ID
          vm.wp.customer_id = response.data.data.ID
          vm.setUserData(response.data.data.ID)

          if ( response.data.status == 'error' ) {
            window.eventHub.$emit('message', {
              type   : 'error',
              message: 'Login incorrect'
            })
          }
        })
      },
      updateCustomer() {
        let vm = this

        window.wyvern.http.post(wp.root + 'api/customer/' + vm.wp.customer_id + '/', querystring.stringify({
          billing_address : JSON.stringify(vm.user.billing_address)
        })).then((response) => {
          console.log(response.data)
        })
      },
      getDate(date) {
        return moment(date).format('LL')
      },
      openOrder(order) {
        let vm = this

        if ( vm.open == order.id ) {
          vm.open = 0
          return
        }

        vm.open = order.id
        vm.order = {}

        window.wyvern.http.get(wp.root + 'api/order/?order_id=' + order.id).then((response) => {
          vm.order = response.data
        })
      },
      cancelOrder(order) {
        let vm = this
        window.wyvern.http.delete(wp.root + 'api/order/?order_id=' + order.id).then((response) => {
          vm.open = 0
        })
      },
      setUserData(customer_id) {
        let vm = this

        if ( typeof customer_id === 'undefined' )
          customer_id = vm.wp.customer_id

        if ( typeof customer_id === 'undefined' )
          return

        if ( customer_id === 0 )
          return

        window.wyvern.http.get(wp.root + 'api/customer/' + customer_id + '/').then((response) => {
          vm.user = response.data
        })
      },
      logout() {
        let vm = this

        window.wyvern.http.get(wp.root + 'api/logout/').then((response) => {
          window.wp.customer_id = 0
          vm.wp.customer_id = 0
        })
      },
      register() {
        let vm = this

        window.wyvern.http.post(wp.root + 'api/register/', querystring.stringify({
          email: vm.user_login,
          password: vm.user_password,
          first_name: vm.first_name,
          last_name: vm.last_name
        })).then((response) => {
          vm.authed = true
          window.wp.customer_id = response.data.user_id
          vm.wp.customer_id = response.data.user_id
          vm.setUserData(response.data.user_id)
        })
      },
      setSocials() {
        let vm = this
        window.wyvern.http.get(wp.root + 'api/socials/').then((response) => {
          vm.socials.facebook = response.data.facebook[0]
          vm.socials.google = response.data.google[0]
        })
      },
      socialLogin(provider) {
        window.location.href = this.socials[provider]
      },
      password() {
        let vm = this
        window.wyvern.http.get(wp.root + 'api/request-password/?' + querystring.stringify({ user_email: vm.user_login })).then((response) => {
          vm.authed = true
        })
      }
    },

    route: {

    }
  }
</script>