<template>
  <div class="ui-page-home fullscreen f-center">
    <div class="container">
      <ui-title>💣</ui-title>
      <ui-title>The Bombermann</ui-title>
      <ui-subtitle>What's your player name?</ui-subtitle>
      <ui-name-form></ui-name-form>
      <p class="info">Development in progress...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { UiTitle, UiSubtitle, UiNameForm } from '../components'

export default defineComponent({
  name: 'ui-page-home',
  components: {
    UiTitle,
    UiSubtitle,
    UiNameForm,
  },
  setup() {
    // socket.on('player-list', (list) => {
    //   console.log(list)
    // })
  },
})
</script>

<style lang="sass" scoped>
@import '../style'
.ui-page-home
  background-color: $background
  color: $font

.container
  text-align: center

.info
  color: $btn
  font-weight: bold
</style>
