import Vue from 'vue'
import Vuex from 'vuex'

import * as ethUtil from 'ethereumjs-util'
import { BigNumber } from 'bignumber.js'

import abiERC20 from '@/abi/ERC20.json'
import abiBQB from '@/abi/BQBToken.json'
import abiMaster from '@/abi/MasterChef.json'
import abiRouter from '@/abi/BloqBallRouter.json'
import abiLottery from '@/abi/Lottery.json'
import abiFactory from '@/abi/PairFactory.json'

const ADDR_NULL = '0x0000000000000000000000000000000000000000';

let ADDR_TOKEN_PAIR_FTM_BQB = null;

const ADDR_TOKEN_FTM = '0xf1277d1Ed8AD466beddF92ef448A132661956621'
const ADDR_TOKEN_BQB = '0x6815ddf5Df340C59FD9299982fd620193705Ffd2'
const ADDR_MASTER = '0xe2CF2C74faEa554E129b8305dB34fD4aFE919fb6'
const ADDR_ROUTER = '0x5F47652b0C1c4AC484D00F15F9d6a9e8db4413e5'
//const ADDR_LOTTERY = '0xFEcA39bfeb4687064c2a61105E3924D41F260Cfa'
const ADDR_LOTTERY = '0x362B04Ac2001665a1cf60b380770473836CC6649' //test
const ADDR_FACTORY = '0xB5B14BAD66C649f5E333cb0a94a212f7a70Cbf45'
//const ADDR_REFEREL = '0xfA92d70BD240B109545Efc9718aBf5e1450d4289'

const ADDR_OWNER = '0x2C4C168A2fE4CaB8E32d1B2A119d4Aa8BdA377e7'
    
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    account:null,
    approve:null,
    liquidity: {
      amountBQB: BigNumber,
      amountFTM: BigNumber,
      rateBQB2FTM: BigNumber,
      rateFTM2BQB: BigNumber, 
      balance: BigNumber,
      totalSupply: BigNumber
    },
    balance: {
      amountBQB: BigNumber,
      amountFTM: BigNumber,
    },
    farming: {
      balance: BigNumber,
      pendingBQB: BigNumber,
      totalSupply: BigNumber,
    },
    staking: {
      balance: BigNumber,
      totalSupply: BigNumber,
      pendingBQB: BigNumber,
      pendingFTM: BigNumber,
      dailyFTMRewards: BigNumber
    },
    lottery: {
      currentLotteryId: 0, 
      currentLotteryState: 0,
      winningPrize: BigNumber,
      nextDraw: Date,
      myWinning: null,
      lastAllResult: null,
      lastAllResultId: 0,
      lastMyResult: null,
      myResultIndex: 0,
      myResultIds: null
    },
    price: {
      rateFTM: BigNumber,
      rateBQB: BigNumber
    },
    jumbotron: {
      totalSupply: BigNumber,
      totalFTMRewards: BigNumber,
      totalWinnings: BigNumber,
      totalPlayers: BigNumber,
      totalBQBRewards: BigNumber,
      totalBQBHolders: BigNumber,
    },
    contracts: {
      tokenBQB: null,
      tokenMaster: null,
      tokenRouter: null,
      tokenLottery: null,
      tokenFactory: null,
      tokenPair: null,
    },
    settings: {
      slippage: 0.5,
      deadline: 30,
      exoert: false,
      disable: false,
      dao: false
    },
    isOwner() {
      if(this.account==null)
        return false
      return this.account.address==ADDR_OWNER
    }
  },
  mutations: {
    init(state) {
      state.contracts.tokenBQB = new window.web3.eth.Contract(abiBQB, ADDR_TOKEN_BQB);
      state.contracts.tokenMaster = new window.web3.eth.Contract(abiMaster, ADDR_MASTER);
      state.contracts.tokenRouter = new window.web3.eth.Contract(abiRouter, ADDR_ROUTER);
      state.contracts.tokenLottery = new window.web3.eth.Contract(abiLottery, ADDR_LOTTERY);
      state.contracts.tokenFactory = new window.web3.eth.Contract(abiFactory, ADDR_FACTORY);
      if(ADDR_TOKEN_PAIR_FTM_BQB)
        state.contracts.tokenPair = new window.web3.eth.Contract(abiERC20, ADDR_TOKEN_PAIR_FTM_BQB);
    },
    set_account(state,account) {
      state.account = account
      window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: ADDR_TOKEN_BQB,
            symbol: 'BQB',
            decimals: 18,
            //image: tokenImage,
          },
        },
      });
    },
    read_contract(state) {
      state.contracts.tokenBQB.methods.totalSupply().call().then((ret)=>{
        state.jumbotron.totalSupply = BigNumber(ret);
      }).catch((error)=>{
        console.error("tokenBQB.totalSupply",error)
      });
      state.contracts.tokenMaster.methods.getTotalAmountofFTMFromFee().call().then((ret)=>{
        state.jumbotron.totalFTMRewards = BigNumber(ret);
      }).catch((error)=>{
        console.error("tokenMaster.getTotalAmountofFTMFromFee",error)
      });
      state.contracts.tokenMaster.methods.getTotalBQBRewardFromBlock().call().then(ret=>{
        state.jumbotron.totalBQBRewards = BigNumber(ret)
      })
      state.contracts.tokenLottery.methods.getTotalWinningPrizeOfLotteries().call().then((ret)=>{
        state.jumbotron.totalWinnings = BigNumber(ret);
      }).catch((error)=>{
        console.error("tokenLottery.getTotalWinningPrizeOfLotteries",error)
      });
      state.contracts.tokenLottery.methods.getTotalPlayersOfLottery().call().then((ret)=>{
        state.jumbotron.totalPlayers = BigNumber(ret);
      }).catch((error)=>{
        console.error("tokenLottery.getTotalPlayersOfLottery",error)
      });
      state.contracts.tokenBQB.methods._totalCountofBQBHolders().call().then((ret)=>{
        state.jumbotron.totalBQBHolders = ret;
      }).catch((error)=>{
        console.error("tokenBQB._totalCountofBQBHolders",error)
      });
    },
    read_liquidity(state) {
      if(!ADDR_TOKEN_PAIR_FTM_BQB) {
        state.contracts.tokenFactory.methods.getPair(
          ADDR_TOKEN_FTM, ADDR_TOKEN_BQB
        ).call().then(ret=>{
          if(ret!=ADDR_NULL) {
            ADDR_TOKEN_PAIR_FTM_BQB = ret
            state.contracts.tokenPair = new window.web3.eth.Contract(abiERC20, ADDR_TOKEN_PAIR_FTM_BQB);
          }
        })
      }
      state.contracts.tokenFactory.methods.allPairsLength().call().then(ret=>{
        if(ret==1) {
          state.contracts.tokenRouter.methods.getAmountsOut(BigNumber(1).shiftedBy(9),[ADDR_TOKEN_BQB,ADDR_TOKEN_FTM]).call().then((ret)=>{
            state.liquidity.rateBQB2FTM = BigNumber(ret[1]).shiftedBy(-9)
          })
          state.contracts.tokenRouter.methods.getAmountsOut(BigNumber(1).shiftedBy(9),[ADDR_TOKEN_FTM,ADDR_TOKEN_BQB]).call().then((ret)=>{
            state.liquidity.rateFTM2BQB = BigNumber(ret[1]).shiftedBy(-9)
          })
          state.contracts.tokenRouter.methods.getReservesOfLiquidity(ADDR_TOKEN_BQB,ADDR_TOKEN_FTM).call().then((ret)=>{
            state.liquidity.amountBQB = BigNumber(ret[0])
            state.liquidity.amountFTM = BigNumber(ret[1])
          })
        }
      })
      if(ADDR_TOKEN_PAIR_FTM_BQB)
        state.contracts.tokenPair.methods.totalSupply().call().then(ret=>{
          state.liquidity.totalSupply = BigNumber(ret)
        })
      state.contracts.tokenMaster.methods.poolLength().call().then(ret=>{
        if(ret>0)
          state.contracts.tokenMaster.methods.poolInfo(0).call().then(ret=>{
            if(ret)
              state.farming.totalSupply = ret.totalStakedTokens
          })
        if(ret>1)
          state.contracts.tokenMaster.methods.poolInfo(1).call().then(ret=>{
            if(ret)
              state.staking.totalSupply = ret.totalStakedTokens
          })
      })
      state.contracts.tokenMaster.methods.getRewardsFTMofDay().call().then(ret=>{
        state.staking.dailyFTMRewards = BigNumber(ret)
      })
      //!TODO calc rate
      state.price.rateFTM = 1
      state.price.rateBQB = 1
      if(state.account) {
        if(ADDR_TOKEN_PAIR_FTM_BQB)
          state.contracts.tokenPair.methods.balanceOf(state.account.address).call().then(ret=>{
            state.liquidity.balance = BigNumber(ret)
          })
        state.contracts.tokenMaster.methods.userInfo(0,state.account.address).call().then(poolinfo=>{
          state.farming.balance = poolinfo.amount
        })
        state.contracts.tokenMaster.methods.userInfo(1,state.account.address).call().then(poolinfo=>{
          state.staking.balance = poolinfo.amount
        })
        state.contracts.tokenBQB.methods.balanceOf(state.account.address).call().then(ret=>{
          state.balance.amountBQB = BigNumber(ret)
        })
        state.contracts.tokenMaster.methods.poolLength().call().then(ret=>{
          if(ret>0) {
            state.contracts.tokenMaster.methods.pendingBloqBall(0,state.account.address).call().then(ret=>{
              state.farming.pendingBQB = BigNumber(ret)
            })
          }
          if(ret>1) {
            state.contracts.tokenMaster.methods.pendingBloqBall(1,state.account.address).call().then(ret=>{
              state.staking.pendingBQB = BigNumber(ret)
            })
            state.contracts.tokenMaster.methods.pendingFTM(state.account.address).call().then(ret=>{
              state.staking.pendingFTM = BigNumber(ret)
            })
          }
        })
        // state.contracts.tokenFTM.methods.balanceOf(state.account.address).call().then(ret=>{
        //   console.log("ftm1",ret)
        //   state.balance.amountFTM = BigNumber(ret)
        // })
        window.web3.eth.getBalance(state.account.address).then(ret=>{
          console.log("ftm2",ret)
          state.balance.amountFTM = BigNumber(ret)
        })
      }
    },
    read_lottery(state) {
      state.contracts.tokenLottery.methods.viewCurrentLotteryId().call().then(ret=>{
        state.lottery.currentLotteryId = parseInt(ret)
        state.contracts.tokenLottery.methods.viewLottery(ret).call().then(lottery=>{
          state.lottery.currentLotteryState = parseInt(lottery.status)
          state.lottery.nextDraw = new Date//new Date(lottery.endTime*1000+300000)
          state.lottery.winningPrize = BigNumber(lottery.amountCollectedInBQB)
          if(state.account!=null) {
            if(state.lottery.currentLotteryId>0 && state.lottery.currentLotteryState==3) {
              state.contracts.tokenLottery.methods.getBracketsOfMatching(
                state.lottery.currentLotteryId,state.account.address
              ).call().then(ret=>{
                state.lottery.myWinning = ret
              })
            } else if(state.lottery.currentLotteryId>1) {
              state.contracts.tokenLottery.methods.viewLottery(state.lottery.currentLotteryId-1).call().then(lottery=>{
                if(parseInt(lottery.status)==3) {
                  state.contracts.tokenLottery.methods.getBracketsOfMatching(
                    state.lottery.currentLotteryId-1,state.account.address
                  ).call().then(ret=>{
                    state.lottery.myWinning = ret
                  })
                }            
              })
            }
            let addr = '0x2C4C168A2fE4CaB8E32d1B2A119d4Aa8BdA377e7'//state.account.address
            state.contracts.tokenLottery.methods.getUserLotteryIds(addr).call().then(ret=>{
              state.lottery.myResultIds = ret
              if(ret.length) {
                let id = state.lottery.myResultIds[state.lottery.myResultIds.length-state.lottery.myResultIndex-1]
                if(state.lottery.lastMyResult==null) {
                  state.contracts.tokenLottery.methods._userWiningRewardsPerLotteryId(addr,id).call().then(ret=>{
                    state.lottery.winningMine = ret
                  })
                  state.contracts.tokenLottery.methods.viewLottery(id).call().then(ret=>{
                    state.lottery.lastMyResult = ret
                  })
                }
              }
            })
          } 
        })
      })
      if(state.lottery.lastAllResult==null) {
        state.lottery.lastAllResultId = state.lottery.currentLotteryId
        if(state.lottery.lastAllResultId)
          state.contracts.tokenLottery.methods.viewLottery(state.lottery.lastAllResultId).call().then(ret=>{
            state.lottery.lastAllResult = ret
          })
      }   
    },
    unapprove(state) {
      state.approve = null
    },
    read_history(state,params) {
      if(params.tab=='all history') {
        if(params.id>0 && params.id<=state.lottery.currentLotteryId) {
          state.contracts.tokenLottery.methods.viewLottery(params.id).call().then(ret=>{
            state.lottery.lastAllResultId = params.id
            state.lottery.lastAllResult = ret
          })
        }
      } else if(state.account!=null) {
        if(state.lottery.myResultIds && params.id<state.lottery.myResultIds.length) {
          let id = state.lottery.myResultIds[state.lottery.myResultIds.length-params.id-1]
          state.contracts.tokenLottery.methods._userWiningRewardsPerLotteryId('0x2C4C168A2fE4CaB8E32d1B2A119d4Aa8BdA377e7',id).call().then(ret=>{
            state.lottery.winningMine = ret
          })
          state.contracts.tokenLottery.methods.viewLottery(id).call().then(ret=>{
            state.lottery.myResultIndex = params.id
            state.lottery.lastMyResult = ret
          })
        }
      }
    }
  },
  actions: {
    add_liquidity({state,commit},params) {
      let deadline = parseInt(new Date().getTime()/1000+state.settings.deadline*60)
      state.contracts.tokenRouter.methods.addLiquidityFTM(
        ADDR_TOKEN_BQB,
        BigNumber(params.amountBQB).shiftedBy(18).integerValue(),
        0,
        0,
        state.account.address,
        deadline
      ).send({
        from:state.account.address,
        value:BigNumber(params.amountFTM).shiftedBy(18).integerValue()
      }).then(ret=>{
        commit("read_liquidity")
        console.log(ret)
      })
    },
    swap({state,commit},params) {
      let deadline = parseInt(new Date().getTime()+state.settings.deadline*60000)
      if(params.baseCoin==1) {
        if(params.coinA=='FTM') {
          state.contracts.tokenRouter.methods.swapExactFTMForTokensSupportingFeeOnTransferTokens(
            BigNumber(params.amountB).times(BigNumber(100).minus(state.settings.slippage).div(100)).shiftedBy(18).integerValue(),
            [ADDR_TOKEN_FTM,ADDR_TOKEN_BQB],
            state.account.address,
            deadline
          ).send({
            from:state.account.address,
            value:BigNumber(params.amountA).shiftedBy(18).integerValue()
          }).then(()=>{
            commit("read_liquidity")
          })
        } else if(params.coinB=='FTM') {
          state.contracts.tokenRouter.methods.swapExactTokensForFTMSupportingFeeOnTransferTokens(
            BigNumber(params.amountA).shiftedBy(18).integerValue(),
            BigNumber(params.amountB).times(BigNumber(100).minus(state.settings.slippage).div(100)).shiftedBy(18).integerValue(),
            [ADDR_TOKEN_BQB,ADDR_TOKEN_FTM],
            state.account.address,
            deadline
          ).send({
            from:state.account.address,
          }).then(ret=>{
            commit("read_liquidity")
            console.log(ret)
          })
        }
      } else if(params.baseCoin==2) {
        if(params.coinA=='FTM') {
          state.contracts.tokenRouter.methods.swapFTMForExactTokens(
            BigNumber(params.amountB).shiftedBy(18).integerValue(),
            [ADDR_TOKEN_FTM,ADDR_TOKEN_BQB],
            state.account.address,
            deadline
          ).send({
            from:state.account.address,
            value:BigNumber(params.amountA).times(BigNumber(100).plus(state.settings.slippage).div(100)).shiftedBy(18).integerValue(),
          }).then(ret=>{
            commit("read_liquidity")
            console.log(ret)
          })
        } else if(params.coinB=='FTM') {
          state.contracts.tokenRouter.methods.swapExactTokensForFTMSupportingFeeOnTransferTokens(
            BigNumber(params.amountA).shiftedBy(18).integerValue(),
            BigNumber(params.amountB).times(BigNumber(100).minus(state.settings.slippage).div(100)).shiftedBy(18).integerValue(),
            [ADDR_TOKEN_BQB,ADDR_TOKEN_FTM],
            state.account.address,
            deadline
          ).send({
            from:state.account.address,
          }).then(ret=>{
            commit("read_liquidity")
            console.log(ret)
          })
          // state.contracts.tokenRouter.methods.swapTokensForExactFTM(
          //   BigNumber(params.amountB).shiftedBy(18).integerValue(),
          //   BigNumber(params.amountA).times(BigNumber(100).plus(state.settings.slippage).div(100)).shiftedBy(18).integerValue(),
          //   [ADDR_TOKEN_BQB,ADDR_TOKEN_FTM],
          //   state.account.address,
          //   deadline
          // ).send({
          //   from:state.account.address,
          // }).then(ret=>{
          //   commit("read_liquidity")
          //   console.log(ret)
          // })
        }
      }
    },
    connect({commit}) {
      window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      }).then((accounts) => {
          if(accounts.length==0) {
              console.log("No connected");
          } else {
            window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xfa2' }],
            }).then(() => {
              console.log("wallet_switchEthereumChain")
              const account = {
                address: accounts[0],
                //balance: BigNumber(balance,"ether")
              }
              commit('set_account',account)
              commit('read_liquidity')
              commit('read_lottery')
            }).catch(error => {
              console.log("error:wallet_switchEthereumChain",error)
              if (error.code==4902 || error.code==-32603) {
                window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{ 
                    chainId: '0xfa2', 
                    chainName: 'FantomNetwork',
                    rpcUrls: ['https://rpc.testnet.fantom.network'],
                    blockExplorerUrls: ['https://testnet.ftmscan.com'],
                    nativeCurrency: {
                      name: 'Fantom',
                      symbol: 'FTM',
                      decimals: 18
                    }
                  }],
                }).then(() => {
                  const account = {
                    address: accounts[0],
                    //balance: BigNumber(balance,"ether")
                  }
                  commit('set_account',account)
                  commit('read_liquidity')
                  commit('read_lottery')
                }).catch(() => {
                  console.log("error:wallet_switchEthereumChain")
                });
              }
            });
          }
      }).catch((err) => {
        if (err.code === 4001) {
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });  
    },
    disconnect({state}) {
      state.account = null
    },
    deposit({state,commit},params) {
      if(!ADDR_TOKEN_PAIR_FTM_BQB)
        return;
      state.contracts.tokenPair.methods.approve(
        ADDR_MASTER,
        BigNumber(params.amount).shiftedBy(18).integerValue()
      ).send({
        from: state.account.address
      }).then(ret=>{
        console.log(ret)
        this.state.contracts.tokenMaster.methods.deposit(
          params.index,
          BigNumber(params.amount).shiftedBy(18).integerValue(),
          ADDR_NULL
        ).send({
          from: state.account.address
        }).then(()=>{
          commit("read_liquidity")
        })
      })
    },
    withdraw({state,commit},params) {
      this.state.contracts.tokenMaster.methods.withdraw(
        params.index,
        BigNumber(params.amount).shiftedBy(18).integerValue()
      ).send({
        from: state.account.address
      }).then(()=>{
        commit("read_liquidity")
      })
    },
    removeLiquidity({state},amount) {
      let deadline = parseInt(new Date().getTime()/1000+state.settings.deadline*60)
      if(state.approve===true) {
        state.contracts.tokenRouter.methods.removeLiquidityFTMSupportingFeeOnTransferTokens(
          ADDR_TOKEN_BQB,
          BigNumber(amount).shiftedBy(18).integerValue(),
          0,
          0,
          state.account.address,
          deadline
        ).send({
          from: state.account.address
        }).then((amountBQB,amountFTM)=>{
          console.log(amountBQB,amountFTM)
        })
      } else if(state.approve) {
        state.contracts.tokenRouter.methods.removeLiquidityFTMWithPermit(
          ADDR_TOKEN_PAIR_FTM_BQB,
          BigNumber(amount).shiftedBy(18).integerValue(),
          0,
          0,
          state.account.address,
          deadline,
          false,
          state.approve.v,
          state.approve.r,
          state.approve.s
        ).send({
          from: state.account.address
        }).then((amountBQB,amountFTM)=>{
          console.log(amountBQB,amountFTM)
        })
      }
    },
    approve1({state},amount) {
      if(!ADDR_TOKEN_PAIR_FTM_BQB)
        return
      state.contracts.tokenPair.methods.approve(
        ADDR_ROUTER,
        BigNumber(amount).shiftedBy(18).integerValue()
      ).send({
        from: state.account.address
      }).then(ret=>{
        state.approve = true
        console.log("approve",ret)
      })
    },
    approve2({state},amount) {
      if(!ADDR_TOKEN_PAIR_FTM_BQB)
        return
      const data = JSON.stringify({
        domain: {
          chainId: 4002,
          name: 'BlogBall Router',
          verifyingContract: ADDR_TOKEN_PAIR_FTM_BQB,
          version: '1',
        },    
        message: {
          owner: state.account.address,
          spender: ADDR_ROUTER,
          value: BigNumber(amount).shiftedBy(18).integerValue(),
          deadline: 2000000000,
        },
        primaryType: 'Permit',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            //{ name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
      });
      window.ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [state.account.address,data]
      }).then(signature=>{
        state.approve = ethUtil.fromRpcSig(signature)
      })
    },
    buyTicket({state,commit},numbers,callback) {
      let code = ""
      for(let i = 0;i<6;i++) {
        code += (numbers[i]<10?'0':'')+numbers[i]
      }
      state.contracts.tokenLottery.methods.buyTickets(
        state.lottery.currentLotteryId,
        [code]
      ).send({
        from: state.account.address
      }).then(ret=>{
        callback.apply(ret)
        commit('read_lottery')
        commit('read_liquidity')
      })
    },
    havest({state,commit},pid) {
      state.contracts.tokenMaster.methods.deposit(
        pid,
        BigNumber(0),
        ADDR_NULL
      ).send({
        from: state.account.address
      }).then(()=>{
        commit('read_liquidity')
      })
      if(pid)
        state.contracts.tokenMaster.methods.havestFTM(pid,state.account.address).send({
          from: state.account.address
        }).then(()=>{
          commit('read_liquidity')
        })
    },
    claim({state,commit}) {
      if(state.lottery.currentLotteryId==0 || state.lottery.currentLotteryState!=3)
        return;
      if(state.lottery.myWinning==null || !BigNumber(state.lottery.myWinning.pendingRewards).isGreaterThan(0))
        return;
      state.contracts.tokenLottery.methods.claimTickets(
        state.lottery.currentLotteryId,
        state.lottery.myWinning.new_ticketIds,
        state.lottery.myWinning.new_brackets
      ).send({
        from: state.account.address
      }).then(()=>{
        commit('read_liquidity')
        commit('read_lottery')
      })
    }
  },
  modules: {
  }
})
