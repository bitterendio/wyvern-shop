import { routes, Vue, VueRouter } from '../../wyvern/src/app';

import Header from './theme-header.vue';
import Page from './page.vue';
import Cart from './cart.vue';
import Checkout from './checkout.vue';
import Account from './account.vue';
import Product from './product.vue';
import Home from './home.vue';
import Woocommerce from './levels/woocommerce.vue';
import Select from './components/select.vue';
import NumberComponent from './components/number.vue';
import Ladda from './components/ladda.vue';
import Sidebar from './sidebar.vue';
import '../style.scss';

Vue.component('theme-header', Header);
Vue.component('Page', Page);
Vue.component('Cart', Cart);
Vue.component('Checkout', Checkout);
Vue.component('Account', Account);
Vue.component('Product', Product);
Vue.component('Home', Home);
Vue.component('woocommerce', Woocommerce);
Vue.component('select-component', Select);
Vue.component('number-component', NumberComponent);
Vue.component('ladda', Ladda);
Vue.component('sidebar', Sidebar);
window.wp.templates.push('Checkout');
window.wp.templates.push('Account');
window.wp.templates.push('Home');

routes.add({
  path: `${window.wp.base_path}checkout/pay/:id/`,
  component: Checkout,
  meta: {
    postId: 7,
    name: 'Checkout',
    slug: 'checkout',
    action: 'pay',
  },
});

routes.add({
  path: `${window.wp.base_path}checkout/order-received/:id/`,
  component: Checkout,
  meta: {
    postId: 7,
    name: 'Checkout',
    slug: 'checkout',
    action: 'order-received',
  },
});

routes.add({
  path: `${window.wp.base_path}account`,
  component: Account,
  meta: {
    postId: 8,
    name: 'Account',
    slug: 'account',
  },
});

// @todo: meta information are artificial, find a way to not specify them
routes.add({
  path: `${window.wp.base_path}:attributeName/:attributeValue`,
  component: Home,
  name: 'Filter',
  meta: {
    name: 'Home',
    postId: 5,
  },
  props: true,
});

routes.refresh();

function formatMoney(input, decimals, decimalSeparator, thousandSeparator) {
  let c = decimals;
  let d = decimalSeparator;
  let t = thousandSeparator;
  let n = input;
  c = isNaN(Math.abs(c)) ? 2 : Math.abs(c);
  d = d === undefined ? '.' : d;
  t = t === undefined ? ',' : t;
  const s = n < 0 ? '-' : '';
  const i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c), 10));
  const j = i.length > 3 ? i.length % 3 : 0;
  return s
      + (j ? i.substr(0, j) + t : '')
      + i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${t}`)
      + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
}

Vue.mixin({
  methods: {
    price(value) {
      const money = formatMoney(parseFloat(value),
          window.wp.decimals,
          window.wp.decimal_separator,
          window.wp.thousand_separator);

      switch (window.wp.price_format) {
        case '%2$s %1$s':
          return `${money} ${window.wp.currency_symbol}`;
        case '%2$s%1$s':
          return `${money}${window.wp.currency_symbol}`;
        case '%1$s%2$s':
          return `${window.wp.currency_symbol}${money}`;
        case '%1$s %2$s':
        default:
          return `${window.wp.currency_symbol} ${money}`;
      }
    },
  },
});

// Create router instance
const router = new VueRouter({
  mode: 'history',
  routes: routes.get(),
});

// Event bus
const bus = new Vue({});

// Start app
new Vue({ // eslint-disable-line no-new
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

  router,

  data() {
    return {
      bus,
      messages: [],
    };
  },

  mounted() {
    this.updateTitle('');
    this.trackGA();
  },

  methods: {
    updateTitle(pageTitle) {
      document.title = `${(pageTitle ? `${pageTitle} - ` : '')}${window.wp.site_name}`;
    },
    trackGA() {
      if (typeof window.ga === 'function') {
        window.ga('set', 'page', `/${window.location.pathname.substr(1)}`);
        window.ga('send', 'pageview');
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
      const self = this;

      // Add message to notification center
      self.messages.push({
        type: configuration.type,
        message: configuration.message,
      });

      // Hide message after timeout
      setTimeout(self.removeLastMessage, 2000);
    },
    removeLastMessage() {
      this.messages.splice(0, 1);
    },
  },

  // Create listeners
  created() {
    window.eventHub.$on('page-title', this.updateTitle);
    window.eventHub.$on('track-ga', this.trackGA);
    window.eventHub.$on('message', this.message);
  },

  // It's good to clean up event listeners before
  // a component is destroyed.
  beforeDestroy() {
    window.eventHub.$off('page-title', this.updateTitle);
    window.eventHub.$off('track-ga', this.trackGA);
    window.eventHub.$off('message');
  },

  watch: {
    // Changed route
    $route(to, from) {
      window.eventHub.$emit('changed-route', to, from);
      // window.eventHub.$emit('filters-changed', {});
    },
  },
});
