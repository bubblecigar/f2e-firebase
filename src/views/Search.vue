<template>
  <div class="search-wrapper">
    <div class="keyword-search">
      <div class="title">
        <span>Keyword&nbsp;</span>
        <input
          class="keyword-input"
          type="text"
          v-model="keyword"
          placeholder="Enter keyword"
          @keydown="keywordkeydown"
        />
        <i @click="search" class="fas fa-search search-btn"></i>
      </div>
      <div v-if="hasSearched || hasSearched === ''" class="result-keyword">
        &nbsp;Searching results for
        <span>{{hasSearched}}</span> :
      </div>
      <div
        v-if="result.name != 'folderInitDoc.txt'"
        class="link"
        v-for="result in searchResults"
        @dblclick="openFolder(result.location.path_)"
      >
        <i
          class="fas"
          :class="{'fa-file':result.type === 'file','fa-folder':result.type === 'folder'}"
        >&nbsp;{{result.name}}</i>
      </div>
    </div>
    <div v-if="favoriteInfo" class="favorites">
      <div class="title">
        <span>Bookmarks&nbsp;</span>
        <i class="fas fa-star"></i>
      </div>
      <div v-for="path in favoriteInfo.paths" class="link" @dblclick="openFolder(path)">
        <i
          class="fas"
          :class="{'fa-file':pathToInfo(path).type === 'file','fa-folder':pathToInfo(path).type === 'folder'}"
        >&nbsp;{{pathToInfo(path).name}}</i>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "@/firebaseConfig.js";
import { mapState } from "vuex";
import { mapGetters } from "vuex";
const firestore = firebase.firestore;
export default {
  created() {},
  computed: {
    ...mapState(["favoriteInfo", "searchResults", "hasSearched"]),
    ...mapGetters(["currentUserCollectionRef"])
  },
  data() {
    return {
      keyword: ""
    };
  },
  methods: {
    keywordkeydown(e) {
      if (e.keyCode === 13) {
        this.search();
      }
    },
    search() {
      this.$store.dispatch("traverseStorage", { keyword: this.keyword });
    },
    openFolder(path) {
      const segs = path.split("/");
      segs.shift();
      segs.shift();
      if (segs[segs.length - 1].includes(".")) {
        segs.pop();
      }
      this.$store.dispatch("setFolder", segs);
      this.$router.push("storage");
    },
    showInfo() {
      this.favoriteInfo.paths.forEach(path => {
        const ref = firebase.storage().ref;
      });
      console.log("hi");
    },
    pathToInfo(path) {
      const fileString = path.slice(path.lastIndexOf("/") + 1);
      if (fileString.includes(".")) {
        return {
          name: fileString,
          type: "file"
        };
      }
      return {
        name: fileString,
        type: "folder"
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.search-wrapper {
  padding: 20px;
  box-shadow: 0 0 3px black;
  background-color: var(--c-main);
  min-height: calc(100vh - 63px);
}
.keyword-search,
.favorites {
  background-color: white;
  width: auto;
  margin: var(--g-m) auto;
  padding: var(--g-m);
  border-radius: var(--g-l);
  box-shadow: 0 0 5px inset black;
  max-width: 1115px;
  margin-top: var(--g-l);
  display: flex;
  flex-flow: column;
}
.search-btn {
  color: var(--c-label);
  &:hover {
    cursor: pointer;
    color: gray;
  }
  &:active {
    color: black;
  }
}
.keyword-input {
  outline: none;
  border: 0;
  flex: 0;
  border-radius: 2em;
  box-shadow: 0 0 3px black inset;
  padding: var(--g-m) var(--g-l);
  margin: var(--g-m);
  transition: flex-grow 0.5s;
  &:focus {
    // flex-grow: 1;
    box-shadow: 0 0 5px black inset;
  }
  &::placeholder {
    color: var(--c-label);
  }
}
.result-keyword {
  color: var(--c-label);
  font-size: var(--fs-s);
  padding: var(--g-m);
  padding-left: var(--g-l);
  span {
    color: black;
    font-weight: bold;
    margin: 0 var(--g-s);
    text-decoration: underline;
  }
}
.title {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  padding-left: var(--g-l);
  position: relative;
  i {
    margin: var(--g-s) 0;
    padding: var(--g-s);

    font-size: var(--fs-l);
    font-weight: bold;
    text-align: center;
  }
  .fa-star {
    color: var(--c-highlight);
  }
  span {
    font-size: var(--fs-l);
    vertical-align: middle;
    color: var(--c-label);
  }
}
.link {
  margin: var(--g-s) var(--g-l);
  padding: var(--g-s);
  padding-left: var(--g-l);
  border-radius: var(--g-m);
  font-family: "font awesome 5 pro", var(--ff);
  font-size: var(--fs-s);
  &:hover {
    cursor: pointer;
    box-shadow: 0 0 3px black;
  }
  &:active {
    box-shadow: 0 0 3px black inset;
  }
  &.selected {
    box-shadow: 0 0 5px black inset;
  }
}
</style>