<template>
  <div class="root">
      <div class="unlock">
        <div class="unlock__item" v-if="!isMetaMaskConnected">
          <div class="text-area">Connect wallet to check the results!</div>
        </div>
        <div class="unlock__item">
          <button v-if="!isMetaMaskConnected" @click="connectWallet">Check Your Winnings - Connect Wallet</button>
          <button v-if="isMetaMaskConnected && myWinning" @click="havestWinning">CLAIM YOUR {{myWinning}}BQB</button>
          <button v-if="isMetaMaskConnected && !myWinning">NO WINNINGS</button>
        </div>
      </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js';
export default {
  computed: {
    isMetaMaskConnected() {
      return this.$store.state.account!=null;
    },
    myWinning() {
      if(this.$store.state.lottery.myWinning!=null && BigNumber(this.$store.state.lottery.myWinning.pendingRewards).isGreaterThan(0)) {
        return BigNumber(this.$store.state.lottery.myWinning.pendingRewards).shiftedBy(-18).toFormat(2)
      }
      return null
    }
  },
  methods: {
    connectWallet() {
      this.$store.dispatch('connect')
    },
    havestWinning() {
      this.$store.dispatch('claim')
    }
  }
}
</script>

<style scoped>
.unlock{
  display: flex;
  flex-direction: column;
  padding: 100px 0;
  background-color: #1e1a317a;
}
.unlock__item{
  display: flex;
  justify-content: center;
  margin: 15px 0;
}

.unlock__item button{
  padding: 10px 25px;
  border: none;
  background-color: var(--q-color-info);
  color: #fff;
  border-radius: 10px;
  box-shadow: 1px 1px 2px .5px black;
  cursor: pointer;
}

.text-area{
  width: 100%;
  max-width: 200px;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
}

</style>