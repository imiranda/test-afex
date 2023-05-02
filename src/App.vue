<template>
  <header>
  </header>

  <div class="container">
    <ui-grid class="">
      <ui-grid-cell class="demo-cell" :columns="{default:12, tablet:12, phone:12}">
        <h2>Añadir nuevo video</h2>
        <ui-textfield outlined v-model="videoKey" fullwidth>
          Añadir
          <template #after>
            <ui-button raised="true" class="t-field-btn" @click="findVideo">Añadir</ui-button>
          </template>
        </ui-textfield>
        
      </ui-grid-cell>
    </ui-grid>
    <div v-if="isLoading">
      <figure>
        <figcaption>Cargando</figcaption>
        <ui-progress indeterminate></ui-progress>
      </figure>
    </div>
    <div v-else>
      <template v-if="videos.length > 0">
        <ui-grid class="">
          <ui-grid-cell class="demo-cell p-relative p-cell" colums="4" v-for="(video, index) in videos" :key="index">
            <ui-fab mini="true" class="float-close-btn" icon="clear" @click="detele_video(video.id)"></ui-fab>
            <img :src=video.thumbnail class="youtb-thumbnail" alt="" @click="selectVideo(video.id)"/>
          </ui-grid-cell>
        </ui-grid>
      </template>
      <template v-else>
        <h2>No hay videos para mostrar, favor agregue</h2>
      </template>
    </div>    
  </div>
  <ui-dialog v-model="isModalOpen" fullscreen>
    <ui-dialog-title></ui-dialog-title>
    <ui-dialog-content>
      <ui-grid class="">
        <ui-grid-cell class="demo-cell" :columns="{default:5, tablet:12, phone:12}">
            <iframe
              v-bind:key="selectedVideo.width"
              v-bind:width="selectedVideo.width"
              v-bind:height="selectedVideo.height"
              v-bind:src="selectedVideo.src"
              v-bind:frameborder="selectedVideo.frameborder"
              v-bind:allow="selectedVideo.allow"
              allowfullscreen>
            </iframe>
        </ui-grid-cell>
        <ui-grid-cell class="demo-cell" :columns="{default:7, tablet:12, phone:12}">
          <h2>{{ selectedVideo.title }}</h2>
          <div>
            {{ selectedVideo.description }}
          </div>
        </ui-grid-cell>
      </ui-grid>
    </ui-dialog-content>
  </ui-dialog>
</template>

<script setup>

  import { onMounted, ref } from "vue";
  import { useConfirm, useAlert } from 'balm-ui';
  import { query, orderBy, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore/lite';
  import { db } from "./utils/firebase";

  const $confirm = useConfirm();
  const $alert = useAlert();

  const videos = ref([])
  const isLoading = ref(false)
  const isModalOpen = ref(false)
  const videoKey = ref('')
  const selectedVideo = ref({
    id: '',
    title: '',
    description: '',
    thumbnail: '',
    addDate: new Date(),
  })
  const yt_api_key = 'AIzaSyCnTXyzMPN1eWNLtXwllEpLw6kfbveuTw0';

  onMounted(() => {
    document.title = 'Afex test video stack'
    fillVideos();
  });

  const fillVideos = async () => {
    isLoading.value = true;
    videos.value = [];
    const q = await query(collection(db, "videos"), orderBy("addDate", "desc"));
    const qs = await getDocs(q);
    qs.forEach((doc) => {
      videos.value.push(doc.data());
    });
    isLoading.value = false;
  }

  const findVideo = async () => {
    isLoading.value = true;
    setTimeout(async () => {
      const vkey = youtube_parser(videoKey.value);
      if (vkey !== null) {
        await youtube_finder(vkey)
        videoKey.value = '';
      } else {
        $alert('codigo de Video no encontrado');
      }

    }, 700)
  }

  const youtube_parser = (url) => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match&&match[7].length==11)? match[7] : false;
  }

  const youtube_finder = async (vkey) => {
    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${vkey}&key=${yt_api_key}&part=snippet`)
      .then(response => response.json())
      .then(async (data) => {

        if (data.items.length === 0) {
          throw new Error('Video no Encontrado');
        }

        const vData = { 
          id: data.items[0].id,
          title: data.items[0].snippet.title,
          description: data.items[0].snippet.description,
          thumbnail: data.items[0].snippet.thumbnails.standard.url,
          addDate: new Date(),
        };

        const docRef = doc(db, "videos", vData.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          $alert('Video ya existe en los registros');

          isLoading.value = false;
        } else {
          await setDoc(doc(db, "videos", vData.id), vData);
          $alert('Video Exitosamente agregado a los registros');
          fillVideos();
        }
      })
      .catch(error => {
        isLoading.value = false;
        $alert('Lo sentimos, ha ocurrifo un error: ' + error.message);
        return error;
      });
  }

  const detele_video = async (vKey) => {
    $confirm({
      message: ' Seguro quieres eliminar este registro?',
      state: 'help',
      acceptText: 'Aceptar',
      cancelText: 'Cancelar'
    }).then(async (result) => {
      if (result) {
        await deleteDoc(doc(db, "videos", vKey));
        fillVideos();
        $alert('Registro Eliminado!!');
      }
    });    
  }

  const selectVideo = (vkey) => {
    const video = videos.value.find((w) => w.id === vkey);
    selectedVideo.value = {
      width:"100%",
      height:"400",
      src: `https://www.youtube.com/embed/${video.id}`,
      frameborder:"0",
      allow:"accelerometer; autoplay; encrypted-media; gyroscope;  picture-in-picture",
      allowfullscreen:"",
      title: video.title,
      description: video.description
    };
    isModalOpen.value = true;
  }

</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}


/* custom */

.container {
  padding: 2em 10%;
}

.p-relative {
  position: relative;
}

.p-cell {
  padding: 2em;
}

.float-close-btn {
  position: absolute;
  right: 3em;
  top: 3em;
  background: #000000;
  border-radius: 4px !important;
}

.youtb-thumbnail {
  width: 100%;
  height: auto;
}

.t-field-btn {
  width: 20em;
  height: 56px;
  border-radius: 0 14px 14px 0;
  border: 0;
}
</style>
