import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

// fire base
import firebase from '@/firebaseConfig.js'

const store = new Vuex.Store({
  state: {
    currentUser: null,
    loginMsg: null,
    loginMsgs: [],
    currentFolder: [],
    contentWithinFolder: null,
    selectedNode: null,
    uploadingProgress: 0,
    favoriteInfo: null,
    searchResults: [],
    hasSearched: false
  },
  getters: {
    rootFolderRef: state => {
      if (!state.currentUser) {
        return null
      }
      const root = `users/${state.currentUser.uid}`;
      const rootFolderRef = firebase.storage().ref(root);
      return rootFolderRef
    },
    currentFolderRef: (state,
      getters) => {
      if (!state.currentUser) {
        return null
      }

      const rootFolderRef = getters.rootFolderRef;
      if (!state.currentFolder.length) {
        return rootFolderRef
      }

      const folderPath = state.currentFolder.join('/');
      const currentFolderRef = rootFolderRef.child(folderPath);
      return currentFolderRef
    },
    currentUserCollectionRef: state => {
      if (!state.currentUser) {
        return null
      }
      const collectionRef = firebase.firestore().collection(`${state.currentUser.uid}`)
      return collectionRef
    }
  },
  mutations: {
    INITIALIZE(state) {
      state.currentUser = null;
      state.loginMsg = null;
      state.loginMsgs = [];
      state.currentFolder = [];
      state.contentWithinFolder = null;
      state.selectedNode = null;
      state.uploadingProgress = 0;
      state.favoriteInfo = null;
      state.searchResults = [];
      state.hasSearched = false
    },
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
    },
    SET_CONTENT_WITHIN_FOLDER(state, content) {
      state.contentWithinFolder = content;
    },
    CLEAR_CONTENT_WITHIN_FOLDER(state, content) {
      state.contentWithinFolder = null;
    },
    PUSH_FOLDER(state, folder) {
      state.currentFolder.push(folder)
    },
    POP_FOLDER(state, index) {
      state.currentFolder.splice(index + 1)
    },
    SET_FOLDER(state, folders) {
      state.currentFolder = [...folders];
    },
    SET_LOGIN_MSG(state, {
      msg,
      type
    }) {
      state.loginMsg = {
        msg,
        type
      };
      state.loginMsgs.push({
        msg,
        type
      });
      setTimeout(() => {
        state.loginMsgs.shift();
      }, 2000)
    },
    SET_NODE_INFO(state, info) {
      state.selectedNode = info;
    },
    CLEAR_NODE_INFO(state) {
      state.selectedNode = null
    },
    UPDATE_LOADING_PROGRESS(state, percentage) {
      state.uploadingProgress = percentage;
    },
    SET_FAVORITE_INFO(state, info) {
      state.favoriteInfo = info;
    },
    SORT_FAVORITE_PATHS(state) {
      const func = (a, b) => {
        const segs_a = a.split('/');
        const name_a = segs_a[segs_a.length - 1];
        let score_a = name_a.charCodeAt(0);
        const segs_b = b.split('/');
        const name_b = segs_b[segs_b.length - 1];
        let score_b = name_b.charCodeAt(0);

        // seperate file and folder
        if (name_a.includes('.')) {
          score_a += 1000;
        }
        if (name_b.includes('.')) {
          score_b += 1000;
        }
        return score_a - score_b
      }
      state.favoriteInfo.paths.sort(func);
    },
    PUSH_SEARCH_RESULT(state, item) {
      state.searchResults.push(item);
    },
    CLEAR_SEARCH_RESULT(state) {
      state.searchResults.splice(0);
    }
  },
  actions: {
    deleteFavoritePath(context, targetPath) {

      const paths = context.state.favoriteInfo.paths;

      paths.forEach((path, i) => {
        if (path === targetPath) {
          paths.splice(i, 1);
        }
      })

      const collectionRef = context.getters.currentUserCollectionRef;
      collectionRef.doc('favorite').update({
        paths
      }).then(() => {
        console.log('sync with cloud');
      })
    },
    toggleFavoritePath(context, targetPath) {

      const paths = context.state.favoriteInfo.paths;

      let include = false;
      paths.forEach((path, i) => {
        if (path === targetPath) {
          paths.splice(i, 1);
          include = true;
        }
      })
      if (include === false) {
        paths.push(targetPath);
      }
      context.commit('SORT_FAVORITE_PATHS');

      const collectionRef = context.getters.currentUserCollectionRef;
      collectionRef.doc('favorite').update({
        paths
      }).then(() => {
        console.log('sync with cloud');
      })
    },
    getFavoriteInfo(context) {
      const collectionRef = context.getters.currentUserCollectionRef;
      collectionRef.doc('favorite').get().then(doc => {
        if (!doc.data()) {
          collectionRef.doc('favorite').set({
            paths: []
          }).then(() => {
            console.log('initialize doc')
          })
          context.commit('SET_FAVORITE_INFO', {
            paths: []
          });
        } else {
          context.commit('SET_FAVORITE_INFO', doc.data());
          context.commit('SORT_FAVORITE_PATHS');
        }
      })
    },
    popFolder(context, index) {
      context.commit('POP_FOLDER', index);
    },
    pushFolder(context, prefix) {
      context.commit('PUSH_FOLDER', prefix.name);
    },
    setFolder(context, folders) {
      context.commit('SET_FOLDER', folders);
    },
    getContentWithinFolder(context) {
      context.getters.currentFolderRef.listAll().then(res => {
          context.commit('SET_CONTENT_WITHIN_FOLDER', res)
          // get download links
          res.items.forEach(item => {
            firebase.storage().ref(item.fullPath).getDownloadURL().then(url => {
              const xhr = new XMLHttpRequest();
              xhr.responseType = 'blob';
              xhr.onload = function (event) {
                const blob = xhr.response;
                const blobURL = window.URL.createObjectURL(blob);
                Vue.set(item, 'downloadLink', blobURL);
              };
              xhr.open('GET', url);
              xhr.send();
            })
          })
        })
        .catch(err => {
          console.log(err);
        }).then(() => {
          context.commit('CLEAR_NODE_INFO');
        })
    },
    createAccount(context, {
      email,
      password
    }) {
      firebase.auth().createUserWithEmailAndPassword(email, password).then((res) => {
          context.commit('SET_LOGIN_MSG', {
            msg: 'Account  has been successfully created!',
            type: 'success'
          })
        })
        .catch(err => {
          context.commit('SET_LOGIN_MSG', {
            msg: err.message,
            type: 'error'
          });
        })
    },
    logIn(context, {
      email,
      password
    }) {
      firebase.auth().signInWithEmailAndPassword(email, password).then((res) => {
          context.commit('SET_LOGIN_MSG', {
            msg: 'Successfully sign in!',
            type: 'success'
          });
        })
        .catch(err => {
          context.commit('SET_LOGIN_MSG', {
            msg: err.message,
            type: 'error'
          });
        })
    },
    signOut(context) {
      firebase.auth().signOut().then(res => {
        context.commit('SET_LOGIN_MSG', {
          msg: 'Successfully sign out.',
          type: 'success'
        });
      }).catch(err => {
        context.commit('SET_LOGIN_MSG', {
          msg: err.message,
          type: 'error'
        });
      })
    },
    uploadFile(context, file) {
      const currentFolderRef = context.getters.currentFolderRef;
      const fileRef = currentFolderRef.child(`/${file.name}`)
      const uploadTask = fileRef.put(file);

      uploadTask.on('state_changed', snapshot => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        context.commit('UPDATE_LOADING_PROGRESS', percentage);
        switch (snapshot.state) {
          case 'paused':
            console.log('upload is paused');
            break;
          case 'running':
            console.log('upload is running');
            break;
        }
      }, err => {
        context.commit('UPDATE_LOADING_PROGRESS', 0);
        switch (err.code) {
          case 'storage/unauthorized':
            console.log(err.code);
            break;
          case 'storage/canceled':
            console.log(err.code);
            break;
          case 'storage/unknown':
            console.log(err.code);
            break;
        }
      }, () => {
        store.dispatch('getContentWithinFolder');
        context.commit('UPDATE_LOADING_PROGRESS', 0);
      })
    },
    deleteItem(context, item) {
      const fileRef = firebase.storage().ref(item.location.path_);
      store.dispatch('deleteFavoritePath', item.location.path_);
      fileRef.delete().then(() => {
        console.log('file deleted');
        store.dispatch('getContentWithinFolder');
      }).catch(err => {
        console.log(err);
      })
    },
    createFolder(context, newFolderName) {
      const ref = context.getters.currentFolderRef.child(
        `${newFolderName}/folderInitDoc.txt`);
      ref.putString('init new folder').then(snapshot => {
        console.log(snapshot);
        store.dispatch('getContentWithinFolder');
      }).catch(err => {
        console.log(err);
      })
    },
    deleteFolder(context, prefix) {
      context.dispatch('deleteFavoritePath', prefix.location.path_);
      prefix.listAll().then(res => {
        res.items.forEach(item => {
          context.dispatch('deleteItem', item);
        })
        res.prefixes.forEach(prefix => {
          context.dispatch('deleteFolder', prefix);
        })
      }).catch(err => {
        console.log(err);
      })
    },
    traverseStorage(context, {
      keyword,
      searchingRoot
    }) {
      context.state.hasSearched = keyword;
      if (!searchingRoot) {
        context.commit('CLEAR_SEARCH_RESULT');
        searchingRoot = context.getters.rootFolderRef;
      }
      searchingRoot.listAll().then(res => {
        res.items.forEach(item => {
          if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
            item.type = 'file';
            context.commit('PUSH_SEARCH_RESULT', item);
          }
        })
        res.prefixes.forEach(prefix => {
          if (prefix.name.toLowerCase().includes(keyword.toLowerCase())) {
            prefix.type = 'folder';
            context.commit('PUSH_SEARCH_RESULT', prefix);
          }
          const nextSearchingRoot = firebase.storage().ref(prefix.location.path_);
          context.dispatch('traverseStorage', {
            keyword,
            searchingRoot: nextSearchingRoot
          });
        })
      }).catch(err => {
        console.log(err);
      })
    },
    selectNode(context, {
      node,
      type
    }) {
      if (type === 'file') {
        const nodeRef = firebase.storage().ref(node.fullPath);
        nodeRef.getMetadata().then(metadata => {
          const nodeInfo = {
            node,
            type,
            metadata
          }
          context.commit('SET_NODE_INFO', nodeInfo)
        })
      } else if (type === 'folder') {
        const nodeRef = firebase.storage().ref(node.fullPath);
        nodeRef.listAll().then(res => {
          const nodeInfo = {
            node,
            type,
            subFolders: res.prefixes,
            subFiles: res.items
          }
          context.commit('SET_NODE_INFO', nodeInfo)
        })
      }
    },
  },
});

firebase.auth().onAuthStateChanged(user => {
  store.commit('SET_CURRENT_USER', user);
  if (store.state.currentUser) {
    store.dispatch('getFavoriteInfo');
  } else {
    store.commit('INITIALIZE')
  }
})

store.watch(state => {
  return state.currentFolder
}, () => {
  if (!store.state.currentUser) {
    return
  }
  store.commit('CLEAR_CONTENT_WITHIN_FOLDER')
  store.dispatch('getContentWithinFolder');
})

export default store
