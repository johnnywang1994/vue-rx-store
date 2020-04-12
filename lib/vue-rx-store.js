import vueRouter from 'vue-router';
import initVueRxStore from './executor';

function VueRxStore() {
  this.$router = vueRouter;
}

VueRxStore.create = function(options) {
  return new initVueRxStore(options);
};

export default VueRxStore;
