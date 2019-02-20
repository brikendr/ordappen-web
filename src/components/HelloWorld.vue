<template>
  <div class="hello">
    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <div>
      <article v-for="(type, idx) in types" :key="idx">
        <h1>{{ type.name }}</h1>
      </article>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { db } from '../main'

@Component
export default class HelloWorld extends Vue {
  types: Array<any> = []

  mounted () {
    this.firestore();
  }
  async firestore () {
    console.log('--------------- Calling firestore');
    db.collection("types").get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log('DOC ID: ', doc.id, ', DOC DATA: ', doc.data())
        });
      }).catch((error) => {
        console.log('------ error!');
      });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
