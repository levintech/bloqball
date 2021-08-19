<template>
  <div>
    <get-tickets/>
    <how-to-play />
  </div>
</template>

<script>
import GetTickets from '@/components/lottery/GetTickets.vue'
import HowToPlay from '@/components/lottery/HowToPlay.vue'
export default {
  components: {
    GetTickets,
    HowToPlay
  },
  mounted() {
    this.$store.commit('read_lottery')
  }
}
</script>

<style scoped>


</style>