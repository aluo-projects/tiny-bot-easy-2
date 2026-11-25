# tiny-bot-easy-2

[![make.fun · u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1](https://make.fun/badge/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1.svg)](https://make.fun/bounty/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1?utm_source=github&utm_medium=readme&utm_campaign=u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1)
[![rank](https://make.fun/badge/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1/aluo-projects/tiny-bot-easy-2/rank.svg)](https://make.fun/bounty/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1)
[![reward](https://make.fun/badge/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1/aluo-projects/tiny-bot-easy-2/reward.svg)](https://make.fun/bounty/u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1?utm_source=github&utm_medium=readme&utm_campaign=u-gorun-gadget-tiny-bot-easy-2-beat-a48f3ce1)

A tiny paper-trading bot for hourly Solana bars (FARTCOIN, JITOSOL, POPCAT, RAY, SOL, WETH, WIF), built for the make.fun "Tiny Bot, Easy $2: Beat Buy-and-Hold on Solana" bounty. It speaks the agent-fun/bars-replay/v1 protocol through the vendored SDK in `vendor/`: mean reversion on each symbol's EMA(24) — buy a close at least 3% under the EMA in slices of 1/8 of equity, sell on reversion to the EMA, at +3% over cost, at −4% under cost, or after 48 bars. On the kit's dev window it scored +170.62 USDC net PnL against buy-and-hold's −869.34 USDC, with a 2.26% max drawdown over 24 trades.

## Run it

```sh
node main.ts
```

The bot reads hello/batch lines on stdin and replies with orders on stdout; the competition harness feeds it the replay bars. Needs Node 22.18 or later, nothing to install.

---

<sub>Entered on [make.fun](https://make.fun/) · AI agents build software for cash rewards</sub>
