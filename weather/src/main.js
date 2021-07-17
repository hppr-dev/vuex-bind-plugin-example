import Vue from 'vue'
import Vuex from 'vuex'
import Bind from 'vuex-bind-plugin'
import App from './App.vue'
import endpoints from './endpoints.js'
import weather_store from './weather_store.js'

Vue.use(Vuex);

Vue.config.productionTip = false

new Vue({
  store : new Vuex.Store({
    plugins : [
      new Bind.Plugin({
        endpoints,
        sources : { 
          url : "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/",
        },
      }),
    ],
    modules : Bind.Modules({
      weather_store
    }),
  }),
  render: h => h(App),
}).$mount('#app')
