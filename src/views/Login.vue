<template>
  <div class="wrapper">
    <form>
      <label>Email</label>
      <input v-model="email" type="email" />
      <label>Password</label>
      <input v-model="password" type="password" />
      <div class="btns">
        <button @click="createAccount">Sign up</button>
        <button @click="logIn">Log in</button>
        <button @click="signOut">Sign out</button>
      </div>
    </form>
    <div class="loginMsg-wrapper">
      <div
        v-if="loginMsgs.length"
        v-for="msg in loginMsgs"
        class="loginMsg"
        :class="loginMsg.type"
      >{{msg.msg}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["currentUser", "loginMsg", "loginMsgs"])
  },
  data() {
    return {
      email: null,
      password: null
    };
  },
  methods: {
    createAccount() {
      this.$store.dispatch("createAccount", {
        email: this.email,
        password: this.password
      });
    },
    logIn() {
      this.$store.dispatch("logIn", {
        email: this.email,
        password: this.password
      });
    },
    signOut() {
      this.$store.dispatch("signOut");
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  box-shadow: 0 0 3px black;
  padding: var(--g-l);
  min-height: calc(100vh - 62px);
  background-color: var(--c-main);
}
form {
  display: flex;
  width: 66%;
  min-width: 300px;
  max-width: 500px;
  margin: 0px auto 0 auto;
  flex-flow: column;
  padding: var(--g-l);
  border-radius: var(--g-m);

  label,
  input,
  button {
    text-align: center;
    padding: var(--g-m);
    border-radius: var(--g-s);
    outline: none;
    border: none;
    font-size: var(--fs-m);
    color: var(--c-main);
  }
  label {
    color: white;
    font-weight: bold;
  }
  input {
    margin-bottom: var(--g-l);
    box-shadow: 0 0 3px black inset;
  }
  .btns {
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
    align-items: center;
    padding: var(--g-m);
    button {
      box-shadow: 0 0 3px black inset;
      &:hover {
        cursor: pointer;
        box-shadow: 0 0 6px black inset;
      }
      &:active {
        box-shadow: 0 0 3px black inset;
      }
    }
  }
}
.loginMsg-wrapper {
  position: relative;
}
.loginMsg {
  position: absolute;
  left: 50%;
  transform: translate3d(-50%, 0, 0);
  text-align: center;
  padding: var(--g-m);
  font-weight: bold;
  animation: float 0.3s;
}
@keyframes float {
  0% {
    transform: translate3d(-50%, 100%, 0);
  }
  100% {
    transform: translate3d(-50%, 0%, 0);
  }
}
.error {
  color: var(--c-error);
}
.success {
  color: var(--c-safe);
}
</style>