// Tiny paper-trading bot for the bars-replay/v1 hello/batch/orders protocol.
//
// Strategy: mean reversion on hourly bar closes, sized small.
// - Track a slow EMA(24) of each symbol's bar close and its recent closes.
// - Buy a dip: the close sits at least DIP under the slow EMA, i.e. the
//   coin was sold off hard against its own recent trend. Each position
//   is 1/SIZE_DIV of equity, so no single coin can hurt the account much.
// - Sell the whole position when the close reverts to the slow EMA, or
//   the position is up TP over its cost (take profit), or down STOP
//   under its cost (stop loss), or it has been held MAXHOLD bars.
// - Otherwise send no orders for that batch: sitting in USDC between
//   dips keeps fees and drawdown low.
//
// Deterministic: no clock, no randomness, no network. Orders decided on
// one bar fill at the next bar's open under the harness fee/slippage model.

import { runBars, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SLOW = 24;
const DIP = 0.03;
const TP = 0.03;
const STOP = 0.04;
const SLIP = 1000;
const SIZE_DIV = 8;
const MAXHOLD = 48;

const seen = new Map<string, number>();
const slow = new Map<string, number>();
const heldBars = new Map<string, number>();

function ema(prev: number | undefined, price: number, n: number): number {
  if (prev === undefined) return price;
  const k = 2 / (n + 1);
  return price * k + prev * (1 - k);
}

await runBars({
  onBatch(state) {
    if (state.warmingUp) return [];
    const orders: (BuyInput | SellInput)[] = [];
    for (const { symbol } of state.hello.symbols) {
      const price = state.close(symbol);
      if (price === null) continue;
      const p = Number(price);
      seen.set(symbol, (seen.get(symbol) ?? 0) + 1);
      slow.set(symbol, ema(slow.get(symbol), p, SLOW));
      if ((seen.get(symbol) ?? 0) < SLOW) continue;
      const s = slow.get(symbol)!;
      const held = state.positions.get(symbol);
      if (held !== undefined) {
        const bars = (heldBars.get(symbol) ?? 0) + 1;
        heldBars.set(symbol, bars);
        const value = state.value(symbol, held.qty);
        const up = value * 1000n >= held.cost * BigInt(Math.round((1 + TP) * 1000));
        const down = value * 1000n <= held.cost * BigInt(Math.round((1 - STOP) * 1000));
        if (p >= s || up || down || bars >= MAXHOLD) {
          orders.push({ side: 'sell', symbol, qty: held.qty, max_slippage_bps: SLIP });
          heldBars.delete(symbol);
        }
      } else if (p < s * (1 - DIP)) {
        let spend = state.weightRoom(symbol);
        if (state.cash < spend) spend = state.cash;
        const slice = state.equity / BigInt(SIZE_DIV);
        if (slice < spend) spend = slice;
        if (spend >= BigInt(state.hello.fees.min_notional_quote_units)) {
          orders.push({ side: 'buy', symbol, notional_quote_units: spend, max_slippage_bps: SLIP });
          heldBars.set(symbol, 0);
        }
      }
    }
    return orders;
  },
});
