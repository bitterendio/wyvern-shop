import { routes, Vue, VueRouter, capitalize, getTemplateHierarchy } from '../../wyvern/src/app'

// Override component example
import Header from './theme-header.vue'
Vue.component('theme-header', Header)

import Page from './page.vue'
Vue.component('Page', Page)

import Cart from './cart.vue'
Vue.component('Cart', Cart)

import Product from './product.vue'
Vue.component('Product', Product)

import Woocommerce from './levels/woocommerce.vue'
Vue.component('woocommerce', Woocommerce)

routes.refresh()

import Select from './components/select.vue'
Vue.component('select-component', Select)

import Ladda from './components/ladda.vue'
Vue.component('ladda', Ladda)

import Sidebar from './sidebar.vue'
Vue.component('sidebar', Sidebar)

// Import styles
import './../style.scss'

// Create router instance
var router = new VueRouter({
  mode: 'history',
  routes: routes.get()
});

// Start app
const App = new Vue({
  el: '#app',

  template: '<div class="template-wrapper">' +
    '<theme-header></theme-header>' +
    '<router-view></router-view>' +
    '<theme-footer></theme-footer>' +
    '<div id="messages" class="messages">' +
      '<transition-group name="list" tag="ul">' +
        '<li v-for="message in messages" :class="message.type" v-bind:key="message.message" class="message list-item">{{ message.message }}</li>' +
      '</transition-group>' +
    '</div>' +
  '</div>',

  router: router,

  data() {
    return {
      messages: []
    }
  },

  mounted() {
    this.updateTitle('')
    this.trackGA()
  },

  methods: {
    updateTitle(pageTitle) {
      document.title = (pageTitle ? pageTitle + ' - ' : '') + wp.site_name
    },
    trackGA() {
      if ( typeof ga == 'function' ) {
        ga('set', 'page', '/' + window.location.pathname.substr(1))
        ga('send', 'pageview')
      }
    },
    /**
     * Show alert
     * @param configuration {
     *  'type' : 'success',
     *  'message' : 'Action succesfully completed'
     * }
     */
    message(configuration) {
      var self = this;

      // Add message to notification center
      self.messages.push({
        type: configuration.type,
        message: configuration.message
      })

      // Hide message after timeout
      setTimeout(function(){
        self.messages.splice(0,1)
      }, 2000)
    }
  },

  // Create listeners
  created: function () {
    window.eventHub.$on('page-title', this.updateTitle)
    window.eventHub.$on('track-ga', this.trackGA)
    window.eventHub.$on('message', this.message)
  },

  // It's good to clean up event listeners before
  // a component is destroyed.
  beforeDestroy: function () {
    window.eventHub.$off('page-title', this.updateTitle)
    window.eventHub.$off('track-ga', this.trackGA)
    window.eventHub.$off('message')
  },

  watch: {
    // Changed route
    '$route' (to, from) {
      window.eventHub.$emit('changed-route')
      window.eventHub.$emit('filters-changed', {})
    }
  }
});