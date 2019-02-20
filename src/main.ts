import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';

import VueFire from 'vuefire';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { config } from './../config/firestore_config';

Vue.config.productionTip = false;

Vue.use(VueFire)
firebase.initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: config.databaseURL,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId
})
export const db = firebase.firestore()

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
