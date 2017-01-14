import { routes, Vue, VueRouter, capitalize, getTemplateHierarchy } from '../../wyvern/src/app'

// Override component example
// import Post from './post.vue'
// Vue.component('Post', Post)

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
  '</div>',

  router: router,

  data() {
    return {
      fullscreen: false,
      fullvideo: false
    }
  },

  mounted() {
    this.updateTitle('');
    this.trackGA();
  },

  methods: {
    updateTitle(pageTitle) {
      document.title = (pageTitle ? pageTitle + ' - ' : '') + wp.site_name;
    },
    trackGA() {
      if ( typeof ga == 'function' ) {
        ga('set', 'page', '/' + window.location.pathname.substr(1));
        ga('send', 'pageview');
      }
    },
    toggleVideo(show_video) {
      this.fullvideo = show_video;
    }
  },

  // Create listeners
  created: function () {
    window.eventHub.$on('page-title', this.updateTitle)
    window.eventHub.$on('track-ga', this.trackGA)
    window.eventHub.$on('toggle-video', this.toggleVideo)
  },

  // It's good to clean up event listeners before
  // a component is destroyed.
  beforeDestroy: function () {
    window.eventHub.$off('page-title', this.updateTitle)
    window.eventHub.$off('track-ga', this.trackGA)
    window.eventHub.$off('toggle-video', this.toggleVideo)
  },

  watch: {
    // Changed route
    '$route' (to, from) {
      window.eventHub.$emit('changed-route')

      this.fullvideo = false;
      this.fullscreen = false;
      this.show_search = false;

      console.log('Changed route', to, from);
    }
  }
});