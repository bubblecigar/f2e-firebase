<template>
  <div @click="dropNode">
    <div class="wrapper-2">
      <input id="file-input" type="file" @change="uploadFile" />
      <div class="content-panel">
        <div class="path">
          <div
            class="path-folder fas fa-folder"
            :class="{'fa-folder':currentFolder.length>0,'fa-folder-open':currentFolder.length===0}"
            @click="popFolder(-1)"
          >&nbsp;root</div>
          <div
            v-for="(folder,i) in currentFolder"
            class="path-folder fas"
            :class="{'fa-folder':i<currentFolder.length-1,'fa-folder-open':i===currentFolder.length-1}"
            @click="popFolder(i)"
          >&nbsp;{{folder}}</div>
        </div>
        <h1 class="title-label">Folders</h1>
        <div class="folders" v-if="contentWithinFolder">
          <div
            v-for="prefix in contentWithinFolder.prefixes"
            @dblclick="pushFolder(prefix)"
            @click="selectNode(prefix,'folder')"
            :class="{selected:isSelected(prefix)}"
            class="folder node"
          >
            <i class="fas fa-folder">
              <i
                class="fas fa-star btn"
                v-if="favoriteInfo && favoriteInfo.paths.includes(prefix.location.path_)"
              ></i>
            </i>
            <span class="label">{{prefix.name}}</span>
          </div>
          <div class="new-folder-wrapper node-btn">
            <div @click="newFolder" class="file node" :style="{opacity:showNewFolderInput? 0:1}">
              <i class="fas fa-folder-plus"></i>
              <span class="folder-upload-hint">new folder</span>
            </div>
            <div class="input-wrapper file node selected" v-if="showNewFolderInput">
              <i @click="createFolder" class="fas fa-folder-plus folder-create-btn"></i>
              <input
                :class="{showNewFolderInput:showNewFolderInput}"
                type="text"
                class="new-folder-name"
                v-model="newFolderName"
                id="new-folder-input"
                placeholder="folder name"
                @keydown="newFolderInputKeydown"
              />
            </div>
          </div>
        </div>
        <h1 class="title-label">Files</h1>
        <div class="files" v-if="contentWithinFolder">
          <div
            v-for="item in contentWithinFolder.items"
            v-if="item.name != 'folderInitDoc.txt'"
            @click="selectNode(item,'file')"
            class="file node"
            :class="{selected:isSelected(item)}"
          >
            <i class="fas fa-file">
              <i
                class="fas fa-star btn"
                v-if="favoriteInfo && favoriteInfo.paths.includes(item.location.path_)"
              ></i>
            </i>
            <span class="label">{{item.name}}</span>
          </div>
          <div @click="pickFile" class="file node node-btn">
            <i class="fas fa-file-upload"></i>
            <div class="progress-bar">
              <div class="bar" v-if="uploadingProgress" :style="{width:uploadingProgress+'%'}"></div>
              <div class="file-upload-hint" v-else>upload file</div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-wrapper" :class="{rest:!selectedNode}">
        <div class="info-panel" v-if="selectedNode && selectedNode.type==='file'">
          <div class="operation-panel">
            <i
              class="far fa-star btn"
              :class="{'fas':favoriteInfo && favoriteInfo.paths.includes(selectedNode.node.location.path_)}"
              @click="toggleFavoritePath"
            ></i>
            <a :href="selectedNode.node.downloadLink" target="_BLANK">
              <i class="fas fa-eye"></i>
            </a>
            <a
              :href="selectedNode.node.downloadLink"
              target="_BLANK"
              :download="selectedNode.node.name"
            >
              <i class="fas fa-cloud-download-alt"></i>
            </a>
            <button @click="deleteItem(selectedNode.node)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <table>
            <tr>
              <th class="info-label">Type</th>
              <td class="info-value">{{selectedNode.metadata.type}}</td>
            </tr>
            <tr>
              <th class="info-label">Name</th>
              <td class="info-value">{{selectedNode.metadata.name}}</td>
            </tr>
            <tr>
              <th class="info-label">Size (kb)</th>
              <td class="info-value">{{selectedNode.metadata.size}}</td>
            </tr>
            <tr>
              <th class="info-label">Created</th>
              <td class="info-value">{{selectedNode.metadata.timeCreated.slice(0,10)}}</td>
            </tr>
          </table>
        </div>
        <div class="info-panel" v-if="selectedNode && selectedNode.type==='folder'">
          <div class="operation-panel">
            <i
              class="far fa-star btn"
              :class="{'fas':favoriteInfo && favoriteInfo.paths.includes(selectedNode.node.location.path_)}"
              @click="toggleFavoritePath"
            ></i>
            <button @click="deleteFolder(selectedNode.node)">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <table>
            <tr>
              <th class="info-label">Type</th>
              <td class="info-value">folder</td>
            </tr>
            <tr>
              <th class="info-label">Name</th>
              <td class="info-value">{{selectedNode.node.name}}</td>
            </tr>
            <tr>
              <th>Contents</th>
              <td class="flex-col">
                <i
                  v-for="subFolder in selectedNode.subFolders"
                  class="fas fa-folder content"
                >&nbsp;{{subFolder.name}}</i>
                <i
                  v-for="subFile in selectedNode.subFiles"
                  class="fas fa-file content"
                  v-if="subFile.name != 'folderInitDoc.txt'"
                >&nbsp;{{subFile.name}}</i>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { mapGetters } from "vuex";
import { setTimeout } from "timers";
export default {
  created() {
    this.$store.dispatch("getContentWithinFolder");
  },
  data() {
    return {
      fileInput: undefined,
      newFolderInput: undefined,
      selectedFile: null, // uploading file
      newFolderName: "",
      showNewFolderInput: false
    };
  },
  watch: {
    showNewFolderInput() {
      setTimeout(() => {
        const dom = document.querySelector("#new-folder-input");
        if (dom) {
          dom.focus();
        }
      }, 10);
    }
  },
  mounted() {
    // bind DOM
    this.fileInput = document.querySelector("#file-input");
  },
  computed: {
    ...mapState([
      "currentFolder",
      "contentWithinFolder",
      "selectedNode",
      "uploadingProgress",
      "favoriteInfo"
    ])
  },
  methods: {
    newFolderInputKeydown(e) {
      if (e.keyCode === 13) {
        this.createFolder();
      }
    },
    toggleFavoritePath() {
      this.$store.dispatch(
        "toggleFavoritePath",
        this.selectedNode.node.location.path_
      );
    },
    dropNode(e) {
      let preserve = false;
      let focus = false;
      e.path.forEach(el => {
        if (el.classList) {
          if (
            el.classList.contains("node") ||
            el.classList.contains("info-wrapper")
          ) {
            preserve = true;
          }
          if (el.classList.contains("new-folder-wrapper")) {
            focus = true;
          }
        }
      });
      if (preserve) {
        if (!focus) {
          this.showNewFolderInput = false;
        }
        return;
      } else {
        this.$store.commit("CLEAR_NODE_INFO");
        this.showNewFolderInput = false;
      }
    },
    newFolder() {
      this.showNewFolderInput = !this.showNewFolderInput;
    },
    selectNode(node, type) {
      this.$store.dispatch("selectNode", { node, type });
    },
    isSelected(node) {
      if (!this.selectedNode) {
        return false;
      }
      return node.fullPath === this.selectedNode.node.fullPath;
    },
    createFolder() {
      if (!this.newFolderName) {
        return;
      }

      // "/" slash is invalid
      this.newFolderName = this.newFolderName.split("/").join(" ");
      this.newFolderName = this.newFolderName.split(".").join(" ");

      this.$store.dispatch("createFolder", this.newFolderName);
      this.newFolderName = "";
      this.showNewFolderInput = false;
    },
    popFolder(index) {
      this.$store.dispatch("popFolder", index);
    },
    prevFolder() {
      this.$store.dispatch("popFolder", this.currentFolder.length - 2);
    },
    pushFolder(prefix) {
      this.$store.dispatch("pushFolder", prefix);
    },
    getContentWithinFolder() {
      this.$store.dispatch("getContentWithinFolder");
    },
    selectFile(e) {
      this.selectedFile = e.target.files[0];
    },
    uploadFile(e) {
      this.selectedFile = e.target.files[0];
      this.$store.commit("UPDATE_LOADING_PROGRESS", 1);
      this.$store.dispatch("uploadFile", this.selectedFile);
      this.selectedFile = null;
      this.fileInput.value = null;
    },
    pickFile() {
      if (this.uploadingProgress === 0) {
        this.fileInput.click();
      }
    },
    deleteItem(item) {
      this.$store.dispatch("deleteItem", item);
      this.$store.commit("CLEAR_NODE_INFO");
    },
    deleteFolder(prefix) {
      this.$store.dispatch("deleteFolder", prefix);
    },
    getMetadata(item) {
      this.$store.dispatch("getMetadata", item);
    }
  }
};
</script>

<style lang="scss" scoped>
* {
  white-space: pre-wrap;
  word-break: break-all;
}
.path {
  display: flex;
  flex-flow: row wrap;
  padding: var(--g-m);
  font-size: var(--fs-s);
  justify-content: flex-start;
}

.wrapper-2 {
  padding: 20px;
  display: flex;
  flex-flow: row;
  justify-content: center;
  box-shadow: 0 0 3px black;
  background-color: var(--c-main);
  min-height: calc(100vh - 62px);
  .content-panel,
  .info-wrapper {
    flex-grow: 1;
    margin: var(--g-l) 0;
  }
  .content-panel {
    max-width: 800px;
    display: flex;
    flex-flow: column wrap;
    overflow: hidden;
    border-radius: var(--g-l) 0 0 var(--g-l);
    margin-right: var(--g-l);
    background: white;
    box-shadow: 0 0 5px black inset;
  }
  .info-wrapper {
    width: 300px;
    flex-shrink: 0;
    flex-grow: 0;
    background-color: white;
    overflow: hidden;
    box-shadow: 0 0 5px black inset;
    border-radius: 0 var(--g-l) var(--g-l) 0;
    &.rest {
      background-color: var(--c-rest);
    }
  }
}
@media (max-width: 700px) {
  .wrapper-2 {
    display: flex;
    flex-flow: column;
  }
}
.info-panel {
  overflow: hidden;
  .operation-panel {
    padding: var(--g-m);
  }
}
.folders,
.files {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  padding: var(--g-m);
}
.tools {
  display: flex;
  flex-flow: row wrap;
  padding-right: 15px;
  justify-content: flex-end;
}
#file-input {
  height: 0;
  width: 0;
}

.wrapper {
  display: flex;
  flex-flow: row;
  align-items: center;
  position: relative;
}
.new-folder-wrapper {
  position: relative;
  > i {
    text-align: center;
    font-size: 40px;
  }
}
div.input-wrapper {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  .folder-create-btn {
    // color: var(--c-label);
  }
  input {
    outline: 0;
    color: var(--c-main);
    border: none;
    border-radius: var(--g-s);
    box-shadow: 0 0 3px black inset;
    padding: var(--g-s);
    width: 80%;
    text-align: center;
    margin-top: 5px;
  }
  ::placeholder {
    color: var(--c-main);
    opacity: 0.5;
  }
}
.path-folder {
  padding: var(--g-m);
  margin: var(--g-m);
  margin-right: 0;
  border-radius: var(--g-m);
  &:hover {
    cursor: pointer;
  }
}
.folder,
.file,
.btn {
  line-height: 1.2em;
  border-radius: var(--g-m);
  margin: var(--g-m);
  display: flex;
  flex-flow: column;
  justify-content: center;
}
.folder,
.file {
  display: flex;
  position: relative;
  flex-flow: column;
  justify-content: center;
  width: 100px;
  height: 100px;
  .fas.fa-star {
    position: absolute;
    margin: 0;
    padding: 0;
    bottom: 15%;
    left: 45%;
    transform: translate3d(-50%, -50%, 0);
    // color: white;
    font-size: var(--fs-xs);
  }
  i {
    text-align: center;
    position: relative;
    font-size: 40px;
  }
  i,
  span {
    padding: var(--g-s);
  }
  span {
    display: block;
    width: 100%;
    white-space: nowrap;
    font-size: var(--fs-xs);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
  }
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
.btn,
a,
button {
  padding: var(--g-m);
  color: black;
  transition: transform 0.13s;
  &:hover {
    cursor: pointer;
    transform: translateY(-10%);
  }
  &:active {
    color: black;
    transform: translateY(0);
  }
}
.return-btn {
  margin-right: auto;
}
.folder-wrapper {
  position: relative;
}
.delete-btn {
  border: 0;
  outline: 0;
  width: var(--g-l);
  height: var(--g-l);
  // background-color: var(--c-error);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 100%;
  bottom: 100%;
  transform: translate3d(-50%, 50%, 0);
}
.flex-col {
  display: flex;
  flex-flow: column;
}
table {
  width: 80%;
  margin: 0px auto;
  margin-bottom: 30px;
  tr {
    display: flex;
    flex-flow: column;
    margin: var(--g-l) 0;
  }
  th,
  td {
    padding: var(--g-s);
    font-size: var(--fs-s);
    text-align: left;
  }
  th {
    color: var(--c-label);
  }
  td {
    border-bottom: 1px solid black;
  }
}
.operation-panel {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  a,
  button {
    padding: var(--g-m);
    margin: var(--g-m);
    border-radius: var(--g-s);
    border: none;
    font-size: var(--fs-m);
    &:hover {
      cursor: pointer;
    }
  }
}
.content {
  margin: var(--g-s) 0;
}
.title-label {
  color: var(--c-label);
  align-self: flex-start;
  font-size: var(--fs-l);
  margin-top: var(--g-l);
  padding: 0 30px;
}
.node-btn {
  color: var(--c-main);
}
.progress-bar {
  align-self: center;
  width: 70%;
  display: flex;
  justify-content: flex-start;
  margin: var(--g-m);
  font-size: var(--fs-xs);
  .bar {
    height: 5px;
    margin: 9.5px 0;
    background-color: var(--c-main);
    border-radius: var(--g-m);
  }
  .file-upload-hint {
    margin: 0 auto;
  }
}
.folder-upload-hint {
  font-size: var(--fs-xs);
}
#new-folder-input {
  font-family: var(--ff);
}
.fas.fa-star {
  color: var(--c-highlight);
}
</style>