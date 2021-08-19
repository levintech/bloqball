<template>
    <div class="container ">
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
        <div class="row q-py-lg">
            <div class="col-xs-12 col-md-5 col-lg-3 filterSection">
                <button :class=" filter === 'all' ? 'active': ''" @click="filter = 'all'">
                    Current Farms
                </button>
            </div>
            <div class="col-xs-12 col-md-7 col-lg-9 q-py-md q-px-md">
                <div class="q-my-md">
                    <q-table
                            title="Farms"
                            class="transparent custom-table"
                            :data="filteredFarm"
                            :columns="columns"
                            row-key="id"
                    >
                        <template v-slot:body="props">
                            <q-tr :props="props" @click="isMetaMaskConnected ? props.expand = !props.expand : null" class="cursor-pointer">
                                <q-td>
                                    <div class="flex items-center no-wrap">
                                        <q-img :src="props.row.fromImage" style="width:40px;height: 40px"
                                               class="rounded-borders q-mr-sm"></q-img>
                                        <q-img :src="props.row.toImage" style="width:40px;height: 40px"
                                               class="rounded-borders q-mr-sm"></q-img>
                                        <div class="q-ml-xs">
                                            <div class="q-mb-none q-mt-none text-bold">{{props.row.pair}}</div>
                                            <small class="text-grey">{{props.row.farm}}</small>
                                        </div>
                                    </div>
                                </q-td>
                                <q-td class="text-bold">
                                    ${{props.row.volume}}
                                </q-td>
                                <!-- <q-td >
                                    <div class="flex items-center no-wrap">
                                        <q-img :src="props.row.img3" style="width:25px;height: 25px"
                                                class="rounded-borders q-mr-sm"></q-img>
                                        <div class="text-uppercase q-ml-sm">{{props.row.reward}} BQB/day</div>
                                    </div>
                                </q-td> -->
                                <q-td class="text-right">
                                    <div class="text-bold">{{props.row.apr}}%</div>
                                    <div class="text-grey">{{props.row.apr_type}}</div>
                                </q-td>
                            </q-tr>
                            <q-tr v-show="props.expand && isMetaMaskConnected" :props="props">
                                <q-td colspan="5">
                                    <div class="row justify-center">
                                         <div class="col-12 flex justify-between items-center q-pa-sm">
                                             <q-btn class="bg-blue">
                                                ${{amountPending}}
                                             </q-btn>
                                            <q-btn class="gradient-blue" @click="havest">
                                                Harvest
                                            </q-btn>
                                        </div>
                                        <div class="cols-12 col-sm-6 q-pa-sm">
                                            <div class="flex justify-between items-center q-mb-lg">
                                                <div></div>
                                                <div class="text-right">
                                                    <div class="box-outlined">Wallet Balance: {{balance.toFormat(5)}}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <q-input type="number" v-model="amountStake"
                                                    standout="bg-white text-white" placeholder="0.0"
                                                    :error-message="errorMessage1" :error="errorMessage1!=null" :bottom-slots="false" :hide-bottom-space="true">
                                                    <template v-slot:append>
                                                        <div>
                                                            <q-btn rounded outline color="blue" size="sm" @click="getMaxStake">
                                                                MAX
                                                            </q-btn>
                                                        </div>
                                                    </template>
                                                </q-input>
                                            </div>
                                            <div>
                                                <button class="action" @click="stake">Stake</button>
                                            </div>
                                        </div>
                                        <div class="cols-12 col-sm-6 q-pa-sm">
                                            <div class="flex justify-between items-center q-mb-lg">
                                                <div></div>
                                                <div class="text-right">
                                                    <div class="box-outlined">Your Staked: {{maxUnstake.toFormat(5)}}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <q-input type="number" v-model="amountUnstake"
                                                    standout="bg-white text-white" placeholder="0.0"
                                                    :error-message="errorMessage2" :error="errorMessage2!=null" :bottom-slots="false" :hide-bottom-space="true">
                                                    <template v-slot:append>
                                                        <div>
                                                            <q-btn rounded outline color="pink" size="sm" @click="getMaxUnstake">
                                                                MAX
                                                            </q-btn>
                                                        </div>
                                                    </template>
                                                </q-input>
                                            </div>
                                            <div>
                                                <button class="action text-pink" @click="unstake">Unstake</button>
                                            </div>
                                        </div>

                                    </div>
                                </q-td>
                            </q-tr>
                        </template>
                    </q-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import BigNumber from 'bignumber.js';
    export default {
        name: "Farm",
        data() {
            return {
                filter: 'all',
                banner: true,
                text: '',
                columns: [
                    {
                        name: 'pool',
                        field: 'pool',
                        label: 'Pool',
                        align: 'left',
                        sortable: true
                    },
                    {
                        name: 'tvl',
                        field: 'tvl',
                        label: 'TVL',
                        align: 'left',
                        sortable: true
                    },
                    // {
                    //     name: 'rewards',
                    //     label: 'Rewards',
                    //     align: 'left',
                    //     field: 'rewards',
                    //     sortable: false
                    // },
                    {
                        name: 'apr',
                        field: 'apr',
                        label: 'APR',
                        align: 'right',
                        sortable: true
                    },
                    // {
                    //     name: 'harvest',
                    //     field: 'harvest',
                    //     label: '',
                    //     align: 'right',
                    //     sortable: false
                    // },
                ],
                amountStake: null,
                amountUnstake: null
            }
        },
        computed: {
            isMetaMaskConnected() {
                return this.$store.state.account!=null
            },
            filteredFarm() {
                var rows = [];
                if (this.filter === 'all') {
                    rows = this.rows
                } else {
                    rows = this.rows.filter(item => item.farm_type === this.filter)
                }
                return rows
            },
            balance() {
                if(this.$store.state.account && this.$store.state.liquidity.balance) {
                    return BigNumber(this.$store.state.liquidity.balance)
                        .shiftedBy(-18)
                }
                return 0
            },
            errorMessage1() {
                if(BigNumber(this.amountStake).isGreaterThan(this.balance)) {
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
            amountPending() {
                return BigNumber(this.$store.state.farming.pendingBQB)
                    .shiftedBy(-18)
                    .toFormat(5)
            },
            rows() {
                return [{
                    id: 1,
                    farm: 'BloqBall Farm',
                    pair: 'FTM/BQB',
                    volume: BigNumber(this.$store.state.liquidity.amountFTM)
                        .times(this.$store.state.price.rateFTM)
                        .plus(
                            BigNumber(this.$store.state.liquidity.amountBQB)
                                .times(this.$store.state.price.rateBQB)
                        ).shiftedBy(-18).toFormat(2),
                    fromImage: require('@/assets/logo/ftm.png'),
                    toImage: require('@/assets/logo/bqb.png'),
                    img3: require('@/assets/logo/bqb.png'),
                    //reward: BigNumber(this.aprBQB).div(365).shiftedBy(-18).toFormat(5),
                    apr: BigNumber(1).shiftedBy(18).times(365*24*3600*60)
                        .div(
                            BigNumber(this.$store.state.liquidity.amountFTM)
                                .times(BigNumber(this.$store.state.liquidity.rateFTM2BQB))
                                .plus(this.$store.state.liquidity.amountBQB)
                                .times(this.$store.state.farming.totalSupply)
                                .div(this.$store.state.liquidity.totalSupply)
                        ).toFormat(1),
                    /*havest: BigNumber(this.$store.state.farming.pendingBQB)
                        .shiftedBy(-18)
                        .toFormat(2),*/
                    apr_type: 'annualized',
                    farm_type: 'BQB'
                }]
            },
            maxUnstake() {
                if(!this.$store.state.farming.balance)
                    return BigNumber(0)
                return BigNumber(this.$store.state.farming.balance)
                    .shiftedBy(-18)
            }            
        },
        methods: {
            getMaxStake() {
                this.amountStake = BigNumber(this.$store.state.liquidity.balance)
                    .shiftedBy(-18)
                    .toFixed(5)
            },
            getMaxUnstake() {
                this.amountUnstake = BigNumber(this.$store.state.farming.balance)
                    .shiftedBy(-18)
                    .toFixed(5)
            },
            stake() {
                this.$store.dispatch('deposit',{
                    index:0,
                    amount:this.amountStake
                })
            },
            unstake() {
                this.$store.dispatch('withdraw',{
                    index:0,
                    amount:this.amountUnstake
                })
            },
            havest() {
                this.$store.dispatch('havest',0)
            }
        }
    }
</script>

<style scoped>
    .filterSection button {
        background: black;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 20px 10px;
        border-radius: 7px;
        margin: 10px;
        width: 90%;
        color: white;
        border: none;
        cursor: pointer;
    }

    .filterSection button.active {
        background-image: linear-gradient(to right, var(--q-color-primary), var(--q-color-info));
        color: #fff;
        font-weight: 600;
    }

    .custom-table tbody td {
        padding: 20px 10px;
    }

    .gradient-blue {
        background-image: linear-gradient(to right, var(--q-color-primary), var(--q-color-info));
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