<style>

</style>

<template>
  <div class="page content" :class="[page.slug, page.template]">

    <div v-show="page.id" class="container cols">

      <div class="main">

        <h1 class="entry-title">{{ page.title.rendered }}</h1>

        <div class="entry-content" v-html="page.content.rendered">
        </div>

        <div v-if="order.gateway">
          <div v-if="order.gateway.id === 'bacs'" v-for="account in order.gateway.account_details">
            <h4>{{ account.account_name }}</h4>
            <p>{{ lang.account_number }}: <strong>{{ account.account_number }}/{{ account.sort_code }}</strong></p>
            <p>{{ lang.payment_id }}: <strong>{{ $route.params.id }}</strong></p>
            <p>{{ lang.total }}: <strong>{{ price(order.prices.total) }}</strong></p>
            <p v-if="account.bank_name.length > 0">{{ lang.bank_name }}: {{ account.bank_name }}</p>
            <p v-if="account.iban.length > 0">{{ lang.iban }}: {{ account.iban }}</p>
            <p v-if="account.bic.length > 0">{{ lang.bic }}: {{ account.bic }}</p>
          </div>
        </div>

        <div v-if="order.shipping_methods">
          <div v-for="shipping in order.shipping_methods">
            <div v-if="shipping.name == 'Local Pickup' || shipping.name == 'Osobní vyzvednutí'">
              <h4>{{ lang.local_pickup_place }}</h4>
              <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Alias, dolore?</p>
            </div>
          </div>
        </div>

        <component is="levels" :object="page"></component>

      </div>

    </div>

  </div>
</template>

<script>
  var querystring = require('querystring')

  export default {
    mounted() {
      var vm = this

      vm.params = this.getSearchParameters()

      this.getPage((data) => {
        vm.page = data
        window.eventHub.$emit('page-title', vm.page.title.rendered)
        window.eventHub.$emit('track-ga')
      })

      let query = querystring.stringify({
        'order_id' : this.$route.params.id,
        'key' : vm.params.key
      })

      window.wyvern.http.get(wp.root + 'api/order/?' + query).then((response) => {
        vm.order = response.data
      })
    },

    data() {
      return {
        page: {
          id: 0,
          slug: '',
          title: { rendered: '' },
          content: { rendered: '' }
        },
        lang: window.lang,
        wp: window.wp,
        menu: [],
        params: {},
        order: {}
      }
    },

    methods: {
      // @todo: look if querystring could do that
      getSearchParameters() {
        var prmstr = window.location.search.substr(1);
        return prmstr != null && prmstr != "" ? this.transformToAssocArray(prmstr) : {};
      },
      transformToAssocArray( prmstr ) {
        var params = {};
        var prmarr = prmstr.split("&");
        for ( var i = 0; i < prmarr.length; i++) {
          var tmparr = prmarr[i].split("=");
          params[tmparr[0]] = tmparr[1];
        }
        return params;
      }
    },

    route: {
      canReuse() {
        return false;
      }
    }
  }
</script>