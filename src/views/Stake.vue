<template>
    <div class="container">
        <q-banner dense inline-actions
                  class="text-white q-py-sm q-my-sm q-mx-sm text-h6 text-center text-uppercase flex"
                  v-if="banner"
                  style="background: #00800063"
        >
            <div class="row">
                <div class="col-11">
                    <q-icon name="notification_important"></q-icon>
                    Using smart contracts, tokens and crypto has always its risks.
                    DYOR before using our beta.
                </div>
                <div class="col-1 flex items-center justify-end">
                    <q-icon name="close" class="q-pa-xs cursor-pointer" @click="banner=false"></q-icon>
                </div>
            </div>

        </q-banner>
        <div>
            <div class="row">
                <div class="col-md-6 col-12 q-px-md">
                    <h5>Stake BQB and Start Earning FTM and BQB</h5>
                    <div class="text-grey" style="font-size: 17px">
                        Our Pool has a fantastic new staking rewards tokenomics. Our top 100 stake holders will enjoy
                        FTM rewards in additional to the regular BQB staking rewards. So if you hold more BQB, you get
                        double
                        returns. Please check FAQ to learn more about the exclusive FTM rewards structure of FTM. Get
                        more BQB
                        and earn more FTM. Fantom (FTM) rewards are limited to the top 100 stakers of BQB.
                    </div>
                </div>
                <div class="col-md-6 col-12 flex items-center justify-center" style="padding-top:20px;">
                    <q-img :src="require(`@/assets/icon.png`)"
                           style="max-width: 200px;"></q-img>
                </div>
                <div class="col-md-7 col-12 q-px-md q-py-lg">
                    <div class="card q-my-md flex justify-between bg-blue-10">
                        <div class="text-center">
                            <div class="text-bold text-h6">Staking APR</div>
                            <div>
                                <q-btn class="q-mt-xs bg-blue-13 rounded-borders" @click="havest">Harvest</q-btn>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-bold text-h5">{{aprFTM}}%</div>
                            <div class="q-mt-xs">FTM APR</div>
                        </div>
                        <div class="text-right">
                            <div class="text-bold text-h5">{{aprBQB}}%</div>
                            <div class="q-mt-xs">BQB APR</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card__item">
                            <div class="tabs">
                                <div class="tab">
                                    <button :class=" tab === 'stake' ? 'active': ''"
                                            @click="tab = 'stake'">Stake BQB
                                    </button>
                                </div>
                                <div class="tab">
                                    <button :class=" tab === 'unstake' ? 'active': ''"
                                            @click="tab = 'unstake'">Unstake
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div>
                            <div v-if="tab === 'stake'">
                                <div class="flex justify-between items-center q-mb-lg">
                                    <div class="text-h4">Stake BQB</div>
                                    <div class="text-right">
                                        <div class="box-outlined">Total APR {{totalAprBQB}}%</div>
                                    </div>
                                </div>
                                <div>
                                    <q-input type="text" prefix="BQB" v-model="amountStake"
                                        standout="bg-white text-white" placeholder="0.0"
                                        :error-message="errorMessage1" :error="errorMessage1!=null" :bottom-slots="false" :hide-bottom-space="true">
                                        <template v-slot:append>
                                            <div>
                                                <small class="text-grey q-mr-sm">Balance: {{maxStake.toFixed(5)}}</small>
                                                <q-btn rounded outline color="blue" size="sm" @click="getMaxStake">
                                                    MAX
                                                </q-btn>
                                            </div>
                                        </template>
                                    </q-input>
                                </div>
                                <div>
                                    <button class="action" @click="connectWallet" v-if="!isMetaMaskConnected">Connect wallet</button>
                                    <button class="action" @click="stake" :disabled="errorMessage1!=null" v-if="isMetaMaskConnected">Stake</button>
                                </div>
                            </div>
                            <div v-if="tab === 'unstake'">
                                <div class="flex justify-between items-center q-mb-lg">
                                    <div class="text-h4">Unstake</div>
                                    <div class="text-right">
                                        <div class="box-outlined">Total APR {{totalAprBQB}}%</div>
                                    </div>
                                </div>
                                <div>
                                    <q-input type="text" prefix="BQB" v-model="amountUnstake"
                                        standout="bg-white text-white" placeholder="0.0"
                                        :error-message="errorMessage2" :error="errorMessage2!=null" :bottom-slots="false" :hide-bottom-space="true">
                                        <template v-slot:append>
                                            <div>
                                                <small class="text-grey q-mr-sm">Balance: {{maxUnstake.toFixed(5)}}</small>
                                                <q-btn rounded outline color="blue" size="sm" @click="getMaxUnstake">
                                                    MAX
                                                </q-btn>
                                            </div>
                                        </template>
                                    </q-input>
                                </div>
                                <div>
                                    <button class="action" @click="connectWallet" v-if="!isMetaMaskConnected">Connect wallet</button>
                                    <button class="action" @click="unstake" :disabled="errorMessage2!=null" v-if="isMetaMaskConnected">Unstake</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-5 col-12 q-px-md q-py-lg">
                    <div class="card q-my-md">
                        <div class="text-h5 q-mb-sm">FTM</div>
                        <div class="flex items-center">
                            <div>
                                <img :src="require(`@/assets/logo/ftm.png`)" style="width: 60px;height: 60px"/>
                            </div>
                            <div class="q-mx-md">
                                <div>{{pendingFTM.shiftedBy(-3).toFormat(2)}}k</div>
                                <div>Tokens Rewarded</div>
                            </div>
                        </div>
                        <div class="text-h5 q-mb-sm q-mt-xl">BQB</div>
                        <div class="flex items-center">
                            <div>
                                <img :src="require(`@/assets/logo/bqb.png`)" style="width: 60px;height: 60px"/>
                            </div>
                            <div class="q-mx-md">
                                <div>{{pendingBQB.shiftedBy(-3).toFormat(2)}}k</div>
                                <div>Tokens Rewarded</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BigNumber from 'bignumber.js'
    export default {
        components: {},
        data() {
            return {
                banner: true,
                tab: 'stake',
                img3: '/amg/ftm.png',
                img4: '/amg/bqb.png',
                amountStake: null,
                amountUnstake: null
            }
        },
        computed: {
            maxStake() {
                if(this.$store.state.account) {
                    return BigNumber(this.$store.state.balance.amountBQB)
                        .shiftedBy(-18)
                }
                return 0
            },
            maxUnstake() {
                return BigNumber(this.$store.state.staking.balance)
                    .shiftedBy(-18)
            },
            isMetaMaskConnected() {
                return this.$store.state.account!=null;
            },
            totalAprBQB() {
                return BigNumber(1).shiftedBy(18).times(365*24*3600*40)
                    .div(this.$store.state.staking.totalSupply)
                    .toFormat(1)
            },
            aprBQB() {
                console.log(this.$store.state.staking.balance.toString(),this.$store.state.staking.totalSupply.toString())
                if(BigNumber(this.$store.state.staking.balance).isGreaterThan(0))
                    return BigNumber(1).shiftedBy(18).times(365*24*3600*40)
                        .div(this.$store.state.staking.totalSupply)
                        .times(this.$store.state.staking.balance)
                        .div(this.$store.state.staking.totalSupply)
                        .toFormat(1)
                return 0
            },
            aprFTM() {
                if(BigNumber(this.$store.state.staking.dailyFTMRewards).isGreaterThan(0))
                    return BigNumber(this.$store.state.staking.dailyFTMRewards).times(365)
                        .div(this.$store.state.jumbotron.totalFTMRewards)
                        .times(this.$store.state.staking.balance)
                        .div(this.$store.state.staking.totalSupply)
                        .toFormat(1)
                return 0
            },
            errorMessage1() {
                if(BigNumber(this.amountStake).isGreaterThan(this.maxStake)) {
                    return "INSUFFICIENT ACCOUNT BALANCE"
                }
                return null
            },
            errorMessage2() {
                if(BigNumber(this.amountUnstake).isGreaterThan(this.maxUnstake)) {
                    return "INSUFFICIENT ACCOUNT BALANCE"
                }
                return null
            },
            pendingBQB() {
                if(this.$store.state.staking.pendingBQB)
                    return BigNumber(this.$store.state.staking.pendingBQB).shiftedBy(-18)
                return BigNumber(0)
            },
            pendingFTM() {
                if(this.$store.state.staking.pendingFTM)
                    return BigNumber(this.$store.state.staking.pendingFTM).shiftedBy(-18)
                return BigNumber(0)
            }
        },
        methods: {
            getMaxStake() {
                this.amountStake = this.maxStake
            },
            getMaxUnstake() {
                this.amountUnstake = this.maxUnstake
            },
            stake() {
                this.$store.dispatch('deposit',{
                    index:1,
                    amount:this.amountStake
                })
            },
            unstake() {
                this.$store.dispatch('withdraw',{
                    index:1,
                    amount:this.amountUnstake
                })
            },
            connectWallet() {                
                this.$store.dispatch('connect')              
            },
            havest() {
                this.$store.dispatch('havest',1)
            }    
        }
    }
</script>

<style scoped>

    .card {
        background: var(--q-color-cloud);
        border-radius: 10px;
        padding: 15px;
    }

    .card__item:first-child {
        padding-bottom: 15px;
    }

    /* .card__item:last-child{
      padding-top: 10px;
    } */

    .tabs {
        display: inline-flex;
        border-radius: 10px;
        padding: 2px;
        background: var(--q-color-secondary)
    }

    .tab {
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
        color: #999;
        border: none;
        cursor: pointer;
    }

    .tab > .active {
        background-image: linear-gradient(to right, var(--q-color-primary), var(--q-color-info));
        color: #fff;
        font-weight: 600;
    }

    .box-outlined {
        background-image: linear-gradient(to right, var(--q-color-primary), var(--q-color-info));
        background-clip: padding-box, border-box;
        background-origin: padding-box, border-box;
        padding: .125rem .875rem;
        border-radius: 1.5rem;
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

</style>