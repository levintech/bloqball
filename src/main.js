import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Web3 from 'web3/lib'

import './quasar'

import '@/assets/style.css'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  beforeCreate() {
    const { ethereum } = window;
    if(ethereum && ethereum.isMetaMask) {
      window.web3 = new Web3(ethereum);
      store.commit('init')
      store.commit('read_contract')
      store.commit('read_liquidity')
      store.commit('read_lottery')
      setInterval(()=>{
        store.commit('read_contract')
        store.commit('read_liquidity')
        store.commit('read_lottery')
      },10000)
    }
    this.$q.dark.set(true);
  },
  render: h => h(App)
}).$mount('#app')
