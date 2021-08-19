<template>
    <div style="width: 100%;">
        <div class="card__item">
            <div class="tabs">
                <div class="tab">
                    <button :class=" tab === 'add' ? 'active': ''" @click="tab = 'add'">Add</button>
                </div>
                <div class="tab">
                    <button :class=" tab === 'remove' ? 'active': ''" :disabled="$store.state.account==null" @click="tab = 'remove'">Remove
                    </button>
                </div>
            </div>
        </div>
        <div style="width: 100%;" v-if=" tab === 'add'">
            <CurrencyField title="Input" :coin="coinOne" :max="balanceFTM" :dataList="dataList" :readonly="coinTwo.value==undefined?true:false"
                @change="changeOne" @input="inputOne" v-model="valueOne"/>
            <q-btn color="secondary" unelevated round icon="add" size="lg" class="sync-btn" @click="addLiquidity"></q-btn>
            <CurrencyField title="Input" :coin="coinTwo" :max="balanceBQB" :dataList="dataList" :readonly="coinTwo.value==undefined?true:false"
                @change="changeTwo" @input="inputTwo" v-model="valueTwo"/>
            <div class="flex justify-between bg-secondary q-my-sm q-pa-sm items-center rounded-borders"
                 v-if="coinOne.value && coinTwo.value">
                <div>
                    <div>
                        {{parseFloat($store.state.liquidity.rateBQB2FTM).toFixed(3)}} 
                        {{coinOne.value}} per {{coinTwo.value}}
                    </div>
                    <div>
                        {{parseFloat($store.state.liquidity.rateFTM2BQB).toFixed(3)}} 
                        {{coinTwo.value}} per {{coinOne.value}}
                    </div>
                </div>
                <div class="text-right">
                    <div>{{shareOfPool}}%</div>
                    <div>Share of Pool</div>
                </div>
            </div>
            <button class="action" v-if="!isMetaMaskConnected" @click="connectWallet">Connect to wallet</button>
            <button class="action" v-if="isMetaMaskConnected" @click="addLiquidity">Add liquidity</button>
        </div>
        <div style="width: 100%;" v-else>
            <InputField title="Amount to Remove (%)" :disable="isApproved" v-model="removeValue" @input="inputRemove" :max="100"></InputField>
            <q-btn color="secondary" unelevated round icon="arrow_downward" size="lg" class="sync-btn"></q-btn>
            <div class="flex items-center justify-between bg-secondary rounded-borders q-pa-md">
                <div>
                    <div>You Will Recieve</div>
                    <div class="text-info"><small>Recieve WFTM</small></div>
                </div>
                <div class="flex">
                    <div class="flex bg-dark rounded-borders items-center q-ma-xs">
                        <div class="q-pa-sm">
                            <img :src="dataList[0].logo" width="35px">
                        </div>
                        <div class="q-pa-sm">
                            <div>{{receiveFTM}}</div>
                            <div>{{dataList[0].value}}</div>
                        </div>
                    </div>
                    <div class="flex bg-dark rounded-borders items-center q-ma-xs">
                        <div class="q-pa-sm">
                            <img :src="dataList[1].logo" width="35px">
                        </div>
                        <div class="q-pa-sm">
                            <div>{{receiveBQB}}</div>
                            <div>{{dataList[1].value}}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex">
                <div style="flex:1" class="q-pa-sm">
                    <button class="action" v-if="!isApproved" @click="approve">Approve</button>
                    <button class="action" v-if="isApproved" @click="removeLiquidity">Remove</button>
                </div>
                <div style="flex:1" class="q-pa-sm">
                    <button class="action" @click="enterAmount">Enter an Amount</button>
                </div>
            </div>
            <q-btn icon-right="chevron_right" size="md" class="q-my-md" @click="liqPos=true">
                View liquidity position
            </q-btn>
        </div>
        <q-dialog v-model="liqPos">
            <q-card style="width: 700px; max-width: 80vw;">
                <q-card-section class="row items-center q-pb-none">
                    <q-btn icon="chevron_left" flat round dense v-close-popup/>
                    <div>GO Back</div>
                </q-card-section>
                <q-card-section>
                    <div class="text-h5 q-mx-md">My Liquidity Position</div>
                </q-card-section>
                <q-card-section>
                    <q-banner dense inline-actions
                              class="text-white q-py-sm q-my-sm q-mx-sm flex rounded-borders"
                              v-if="liqBanner"
                              style="background: #0993ec60"
                    >
                        <div class="row">
                            <div class="col-11 text-h6 q-mb-sm">
                                Liquidity Provider Rewards
                            </div>
                            <div class="col-1 flex items-center justify-end">
                                <q-icon name="close" class="q-pa-xs cursor-pointer" @click="banner=false"></q-icon>
                            </div>
                        </div>
                        <div>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci at deleniti dolore
                            dolores ea, ex id illum minus modi molestias officiis possimus quo sed temporibus ullam
                            velit veniam. Atque et expedita non perspiciatis quae qui quis repellat, similique! A
                            aliquid commodi dolorum earum eius enim exercitationem explicabo
                        </div>
                    </q-banner>
                    <div v-if="!$store.state.liquidity.balance" class="flex items-center justify-center bg-black rounded-borders q-mx-sm"
                         style="min-height: 100px">
                        <div>
                            No Liquidity found
                        </div>
                    </div>
                    <div v-if="$store.state.liquidity.balance" class="flex items-center justify-center bg-black rounded-borders q-mx-sm"
                         style="min-height: 100px">
                        <div class="flex items-center no-wrap">
                            <q-img :src="require('@/assets/logo/ftm.png')" style="width:40px;height: 40px"
                                class="rounded-borders q-mr-sm"></q-img>
                            <q-img :src="require('@/assets/logo/bqb.png')" style="width:40px;height: 40px"
                                class="rounded-borders q-mr-sm"></q-img>
                            <div class="q-ml-xs">
                                <div class="q-mb-none q-mt-none text-bold">FTM/BQB</div>
                                <small class="text-grey">{{balancePair}}</small>
                            </div>
                        </div>
                    </div>
                    <div class="flex">
                        <div style="flex:1" class="q-pa-sm">
                            <button class="action">Add</button>
                        </div>
                        <div style="flex:1" class="q-pa-sm">
                            <button class="action">Import</button>
                        </div>
                    </div>
                </q-card-section>

            </q-card>
        </q-dialog>
    </div>

</template>

<script>

    import CurrencyField from '@/components/currency/CurrencyField';
    import InputField from "./InputField";
    import BigNumber from 'bignumber.js';

    export default {
        components: {
            InputField,
            CurrencyField,
        },
        data() {
            return {
                dataList: [
                    {id: 1, value: 'FTM', name: 'Fantom', logo: require('@/assets/logo/ftm.png')},
                    {id: 2, value: 'BQB', name: 'BloqBall', logo: require('@/assets/logo/bqb.png')}
                ],
                liqPos: false,
                liqBanner: true,
                coinOne: {},
                coinTwo: {},
                valueOne: null,
                valueTwo: null,
                tab: 'add',
                removeValue: null,
                approved: false
            }
        },
        computed: {
            isMetaMaskConnected() {
                return this.$store.state.account!=null
            },
            shareOfPool() {
                if(this.valueOne) {
                    try {
                        let totalPool = BigNumber(this.$store.state.liquidity.amountFTM)
                            .plus(BigNumber(this.valueOne).shiftedBy(18))
                        let sop = BigNumber(this.valueOne).shiftedBy(18).times(100).div(totalPool)
                        if(sop.isGreaterThan(0.01))
                            return sop.toFixed(3)
                    } catch(err) {
                        console.log(err)                        
                    }
                }
                return "< 0.01"
            },
            receiveFTM() {
                let liquidity = this.$store.state.liquidity;
                if(liquidity.balance && this.removeValue) {
                    var removeValue = parseFloat(this.removeValue)
                    if(removeValue>100)
                        removeValue = 100
                    else if(removeValue<0)
                        removeValue = 0
                    return BigNumber(liquidity.amountFTM)
                        .times(BigNumber(liquidity.balance).times(BigNumber(removeValue).div(100)))
                        .div(BigNumber(liquidity.totalSupply))
                        .shiftedBy(-18)
                        .toFixed(5)
                }
                return "-"
            },
            receiveBQB() {
                let liquidity = this.$store.state.liquidity;
                if(liquidity.balance && this.removeValue) {
                    var removeValue = parseFloat(this.removeValue)
                    if(removeValue>100)
                        removeValue = 100
                    else if(removeValue<0)
                        removeValue = 0
                    return BigNumber(liquidity.amountBQB)
                        .times(BigNumber(liquidity.balance).times(BigNumber(removeValue).div(100)))
                        .div(BigNumber(liquidity.totalSupply))
                        .shiftedBy(-18)
                        .toFixed(5)
                }
                return "-"
            },
            amountRemove() {
                let liquidity = this.$store.state.liquidity;
                if(liquidity.balance && this.removeValue) {
                    var removeValue = parseFloat(this.removeValue)
                    if(removeValue>100)
                        removeValue = 100
                    else if(removeValue<0)
                        removeValue = 0
                    return BigNumber(liquidity.balance)
                        .times(removeValue)
                        .div(100)
                        .shiftedBy(-18)
                }
                return "0"
            },
            balanceBQB() {
                return BigNumber(this.$store.state.balance.amountBQB).shiftedBy(-18)
            },
            balanceFTM() {
                return BigNumber(this.$store.state.balance.amountFTM).shiftedBy(-18)
            },
            isApproved() {
                return this.$store.state.approve!=null
            },
            balancePair() {
                return BigNumber(this.$store.state.liquidity.balance).shiftedBy(-18).toFormat(5)
            }
        },
        created() {
            this.coinOne = this.dataList[0]
            this.$emit('set-fee',0)
        },
        mounted() {
            this.$store.commit('read_liquidity')
            this.$store.commit('unapprove')
        },
        methods: {
            changeOne(item) {
                if (this.coinTwo === item) {
                    var position = 'top-';
                    this.$q.notify({
                        message: 'Coins can not be the same to swap!',
                        color: 'red',
                        position,
                        timeout: 5000
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
                        timeout: 5000
                    })
                } else {
                    this.coinTwo = item
                    this.$store.commit('read_liquidity')
                }
            },
            inputOne(value) {
                let rate = BigNumber(this.$store.state.liquidity.rateFTM2BQB);
                if(rate.isNaN())
                    rate = 1
                if(value) {
                    this.valueTwo = BigNumber(value).times(rate)
                } else 
                    this.valueTwo = ""
                this.$emit('set-fee',this.fee())
            },
            inputTwo(value) {
                let rate = BigNumber(this.$store.state.liquidity.rateBQB2FTM);
                if(rate.isNaN())
                    rate = 1
                if(value) {
                    this.valueOne = BigNumber(value).times(rate)
                } else
                    this.valueOne = ""
                this.$emit('set-fee',this.fee())
            },
            inputRemove(value) {
                if(value=="")
                    return
            },
            swap() {
                let itemOne = this.coinOne;
                let valueOne = this.valueOne;
                this.coinOne = this.coinTwo;
                this.valueOne = this.valueTwo;
                this.coinTwo = itemOne;
                this.valueTwo = valueOne;
            },
            addLiquidity() {
                this.$store.dispatch('add_liquidity',{
                    amountFTM: this.valueOne,
                    amountBQB: this.valueTwo,
                    timeDeadline: 2000000000
                });
            },
            fee() {
                if(this.valueTwo) {
                    return BigNumber(this.valueTwo).times(0.005).toFixed(3)
                }
                return 0
            },
            connectWallet() {
                this.$store.dispatch('connect')
            },
            approve() {
                if(parseFloat(this.amountRemove)>0)
                    this.$store.dispatch('approve1',this.amountRemove)
            },
            removeLiquidity() {
                if(this.isApproved)
                    this.$store.dispatch('removeLiquidity',this.amountRemove)
            },
            enterAmount() {
                this.$store.commit('unapprove')
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


    .card__item {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }

    .card__item:first-child {
        padding-bottom: 15px;
    }


    .tabs {
        width: 100%;
        display: flex;
        border-radius: 10px;
        padding: 2px;
        background: var(--q-color-secondary)
    }

    .tab {
        flex: 1;
        /* display: inline; */
    }

    .tab > button {
        background: transparent;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px;
        border-radius: 7px;
        margin: 2px;
        width: 100%;
        color: #999;
        border: none;
        cursor: pointer;
    }

    .tab > .active {
        background-image: linear-gradient(to right, var(--q-color-primary), var(--q-color-info));
        color: #fff;
        font-weight: 600;
    }
</style>