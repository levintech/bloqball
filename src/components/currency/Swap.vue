<template>
    <div style="width: 100%;">
        <CurrencyField title="Swap From" :coin="coinOne" :dataList="dataList" :focused="baseCoin==1"
            :readonly="coinOne.value==undefined || coinTwo.value==undefined?true:false"
            @change="changeOne" @input="inputOne" v-model="valueOne" :max="balanceOne"/>
        <q-btn color="secondary" unelevated round icon="import_export" size="lg" class="sync-btn" @click="inverse"></q-btn>
        <CurrencyField title="Swap to (est)" :coin="coinTwo" :dataList="dataList" :focused="baseCoin==2"
            :readonly="coinOne.value==undefined || coinTwo.value==undefined?true:false"
            @change="changeTwo" @input="inputTwo" v-model="valueTwo" :max="balanceTwo"/>
        <div class="flex justify-between bg-secondary q-my-sm q-pa-sm items-center rounded-borders"
        v-if="coinOne.value && coinTwo.value">
            <div>Exchange Rate</div>
            <div>
                <span>1 {{coinTwo.value}}</span>
                =
                <span>{{parseFloat(coinOne.value=='FTM'?$store.state.liquidity.rateBQB2FTM:$store.state.liquidity.rateFTM2BQB).toFixed(3)}} {{coinOne.value}}</span>
                <span class="q-mx-sm">
                    <q-btn color="secondary" unelevated round icon="sync_alt" size="sm" @click="inverse"></q-btn>
                </span>
            </div>
        </div>
        <button class="action" v-if="!isMetaMaskConnected" @click="connectWallet">Connect to wallet</button>
        <button class="action" v-if="isMetaMaskConnected" @click="swap">Swap</button>
    </div>
</template>

<script>
    import CurrencyField from '@/components/currency/CurrencyField'
    import { BigNumber } from 'bignumber.js'

    export default {
        components: {
            CurrencyField,
        },
        data() {
            return {
                dataList: [
                    {id: 1, value: 'FTM', name: 'Fantom', logo: require('@/assets/logo/ftm.png')},
                    {id: 2, value: 'BQB', name: 'BloqBall', logo: require('@/assets/logo/bqb.png')}
                ],
                coinOne: {},
                coinTwo: {},
                valueOne: null,
                valueTwo: null,
                baseCoin: 0,
            }
        },
        computed: {
            isMetaMaskConnected() {
                return this.$store.state.account!=null
            },
            balanceOne() {
                return this.getBalance(this.coinOne.value)
            },
            balanceTwo() {
                return null//this.getBalance(this.coinTwo.value)
            }
        },
        created() {
            this.coinOne = this.dataList[0]
            this.$emit('set-fee',0)
        },
        methods: {
            changeOne(item) {
                if (this.coinTwo === item) {
                    var position = 'top-';
                    this.$q.notify({
                        message: 'Coins can not be the same to swap!',
                        color: 'red',
                        position,
                        timeout:  5000
                    })
                } else {
                    this.coinOne = item
                }
            },
            changeTwo(item) {
                if (this.coinOne === item) {
                   var position = 'top';
                    this.$q.notify({
                        message: 'Coins can not be the same to swap!',
                        color: 'red',
                        position,
                        timeout:  5000
                    })
                } else {
                    this.coinTwo = item
                }
            },
            inputOne(value) {
                if(value) {
                    var rate = BigNumber(
                        this.coinOne.value=='FTM'?this.$store.state.liquidity.rateFTM2BQB:this.$store.state.liquidity.rateBQB2FTM
                    )
                    this.valueTwo = BigNumber(value).times(rate)
                    this.baseCoin = 1
                } else 
                    this.valueTwo = ""
                this.$emit('set-fee',this.fee())
            },
            inputTwo(value) {
                if(value) {
                    var rate = BigNumber(
                        this.coinTwo.value=='FTM'?this.$store.state.liquidity.rateFTM2BQB:this.$store.state.liquidity.rateBQB2FTM
                    )
                    this.valueOne = BigNumber(value).times(rate)
                    this.baseCoin = 2
                } else
                    this.valueOne = ""
                this.$emit('set-fee',this.fee())
            },
            getBalance(coin) {
                if(this.$store.state.account!=null) {
                    if(coin=='FTM')
                        return BigNumber(this.$store.state.balance.amountFTM).shiftedBy(-18)
                    else if(coin=='BQB')
                        return BigNumber(this.$store.state.balance.amountBQB).shiftedBy(-18)
                }
                return "0"
            },
            inverse() {
                let itemOne = this.coinOne;
                let valueOne = this.valueOne;
                this.coinOne = this.coinTwo;
                this.valueOne = this.valueTwo;
                this.coinTwo = itemOne;
                this.valueTwo = valueOne;
                if(this.coinOne.value && this.coinTwo.value) {
                    if(this.baseCoin==2) {
                        this.inputOne(this.valueOne)
                    } else if(this.baseCoin==1) {
                        this.inputTwo(this.valueTwo)
                    }
                }
            },
            swap() {
                console.log({
                    baseCoin: this.baseCoin,
                    coinA: this.coinOne.value,
                    coinB: this.coinTwo.value,
                    amountA: this.valueOne,
                    amountB: this.valueTwo,
                    timeDeadline: 2000000000
                })
                this.$store.dispatch('swap',{
                    baseCoin: this.baseCoin,
                    coinA: this.coinOne.value,
                    coinB: this.coinTwo.value,
                    amountA: this.valueOne,
                    amountB: this.valueTwo,
                    timeDeadline: 2000000000
                });
            },
            fee() {
                if(this.coinOne.value=='BQB') {
                    let fee = BigNumber(this.valueOne).times(0.005)
                    return fee.toFixed(3)
                } else if(this.coinTwo.value=='BQB') {
                    let fee = BigNumber(this.valueTwo).times(0.005)
                    return fee.toFixed(3)
                }
                return 0
            },
            connectWallet() {
                this.$store.dispatch('connect')
            }
        }

    };
</script>

<style scoped>
    .sync-btn {
        margin: -10px 0 -10px 10px;
        border: 3px solid var(--q-color-dark);
        z-index: 10;
    }

    .action {
        background: #0993ec33;
        width: 100%;
        margin-top: 15px;
        border: none;
        border-radius: 10px;
        padding: 15px;
        font-size: 1rem;
        color: #0993ec;
        cursor: pointer;
    }

    .action:hover {
        background-color: #0993ec60;
    }

    .field {
        display: flex;
    }

    .field__item {
        width: 100%;
        display: flex;
    }
</style>