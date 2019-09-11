<template>
  <div id="app">
    <nav class="nav">
      <router-link to="/">User</router-link>
      <router-link to="/storage">Storage</router-link>
      <router-link to="/search">Search</router-link>
      <div class="userStatus" v-if="currentUser">{{ currentUser.email }}</div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["currentUser"])
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700&display=swap");
* {
  box-sizing: border-box;
}
html {
  font-family: "Source Sans Pro", "Avenir", Helvetica, Arial, sans-serif;
  --g-s: 5px;
  --g-m: 10px;
  --g-l: 15px;

  --ff: "Source Sans Pro", "Avenir", Helvetica, Arial, sans-serif;
  --fs-xs: 12px;
  --fs-s: 16px;
  --fs-m: 20px;
  --fs-l: 24px;
  --fs-xl: 28px;

  --c-main: rgb(160, 185, 233);
  --c-minor: rgb(255, 250, 187);

  --c-hover: rgb(225, 232, 243);
  --c-active: gray;
  --c-selected: rgb(248, 253, 180);
  --c-rest: rgba(255, 255, 255, 0.5);
  --c-label: rgb(160, 160, 160);
  --c-highlight: rgb(255, 187, 0);

  --c-error: rgb(187, 74, 22);
  --c-safe: steelblue;
}
button {
  outline: 0;
  border-radius: var(--g-s);
  &:hover {
    cursor: pointer;
  }
}
#app {
  min-height: 100vh;
  line-height: 1.1em;
  font-size: var(--fs-m);
}
.nav {
  display: flex;
  flex: row wrap;
  align-items: center;
  background-color: white;
  font-weight: bold;

  a,
  .userStatus {
    margin: var(--g-m);
    padding: var(--g-m);
    text-decoration: none;
    color: black;
  }
  a {
    padding: var(--g-m);
    display: row;
    align-items: center;
    border-radius: var(--g-s);
    &:hover {
      cursor: pointer;
    }
  }
  .userStatus {
    margin-left: auto;
  }
  .router-link-exact-active {
    text-decoration: underline;
  }
}
.currentUser {
  margin-left: auto;
}
</style>
