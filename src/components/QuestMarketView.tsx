import React, { useEffect, useState } from 'react';
import { Coins, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import { InabelHeaderStrip } from './InabelHeaderStrip';
import { QUEST_MARKET_ITEMS } from '../data/questMarket';
import { questGame, type QuestBuyResponse, type QuestMarketState, type QuestPowerUp } from '../services/questGameService';

const emptyMarket: QuestMarketState = { balance: 0, inventory: [], transactions: [] };

export const QuestMarketView: React.FC = () => {
  const [market, setMarket] = useState<QuestMarketState>(emptyMarket);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<QuestPowerUp | null>(null);
  const [message, setMessage] = useState('');

  const refresh = async () => {
    setLoading(true);
    try { setMarket(await questGame<QuestMarketState>('market')); setMessage(''); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load the Quest Market.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);

  const buy = async (kind: QuestPowerUp) => {
    const item = QUEST_MARKET_ITEMS.find(entry => entry.kind === kind)!;
    if (busy) return;
    if (market.balance < item.cost) { setMessage('Insufficient Quest Coins'); return; }
    if (!window.confirm(`Exchange ${item.cost} Quest Coins for 1 ${item.label}? Purchases are final.`)) return;
    setBusy(kind);
    try {
      const purchased = await questGame<QuestBuyResponse>('buy', { kind });
      const latest = await questGame<QuestMarketState>('market');
      setMarket(latest);
      setMessage(`${item.label} added to inventory. Balance: ${purchased.balance} Quest Coins.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Purchase failed. Coins were not deducted.'); }
    finally { setBusy(null); }
  };

  const quantity = (kind: QuestPowerUp) => market.inventory.find(entry => entry.kind === kind)?.quantity ?? 0;
  const transactionName = (key: string) => {
    if (key.startsWith('market:')) return QUEST_MARKET_ITEMS.find(item => key.endsWith(`:${item.kind}`))?.label ?? 'Market purchase';
    if (key.startsWith('correct:')) return 'Correct answer';
    if (key.startsWith('game:')) return 'Completed game';
    if (key.startsWith('perfect:')) return 'Perfect game';
    if (key.startsWith('daily:')) return 'First daily game';
    if (key.startsWith('module:')) return 'Module completion';
    if (key.startsWith('badge:')) return 'Achievement badge';
    return 'Quest Coins activity';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-7 space-y-6">
      <section className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-[3px_4px_0_#1c1917]">
        <InabelHeaderStrip variant="royal" label="Quest Market • Coin Exchange" />
        <div className="bg-gradient-to-r from-[#07192F] via-[#0F3460] to-[#0F766E] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-widest text-sky-200">Spendable balance</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-black"><Coins className="h-7 w-7 text-amber-300" />{market.balance} Quest Coins</h1></div>
            <button type="button" onClick={() => void refresh()} disabled={loading || Boolean(busy)} className="inline-flex items-center gap-2 rounded-xl border border-sky-300 px-3 py-2 text-sm font-bold hover:bg-white/10 disabled:opacity-50"><RefreshCw className="h-4 w-4" />Refresh balance</button>
          </div>
          <p className="mt-4 max-w-3xl text-sm text-sky-100">XP stays permanent and cannot be spent or converted. Quest Coins buy in-game power-ups only. No cash purchases, withdrawals, transfers, or coin-to-XP exchange.</p>
        </div>
      </section>

      {message && <p role="status" className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-950">{message}</p>}

      <section aria-label="Quest Market items" className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-[3px_4px_0_#1c1917]">
        <InabelHeaderStrip variant="emerald" label="Power-Ups • Buy Now, Use Later" />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {QUEST_MARKET_ITEMS.map(item => <article key={item.kind} className="lq-woven-card lq-woven-pad-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-white to-sky-50 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2"><div><h2 className="text-lg font-black text-slate-950">{item.label}</h2><p className="mt-1 text-sm text-slate-700">{item.detail}</p></div><ShoppingBag className="h-5 w-5 shrink-0 text-sky-700" /></div>
            <div className="mt-5 flex items-center justify-between gap-2"><span className="text-sm font-bold text-emerald-800">Owned: {quantity(item.kind)}</span><span className="text-sm font-black text-sky-900">{item.cost} coins</span></div>
            <button type="button" disabled={loading || Boolean(busy) || market.balance < item.cost} onClick={() => void buy(item.kind)} className="mt-3 w-full rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 disabled:cursor-not-allowed disabled:opacity-50">{busy === item.kind ? 'Exchanging…' : `Buy 1 ${item.label}`}</button>
          </article>)}
        </div>
        <p className="px-5 pb-5 text-xs text-slate-600">Items remain in inventory until activated during a game. One activation of each type is allowed per game. Purchases are final; failed transactions do not deduct coins.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-[3px_4px_0_#1c1917]"><InabelHeaderStrip variant="indigo" label="Your Inventory" /><div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">{QUEST_MARKET_ITEMS.map(item => <div key={item.kind} className="rounded-xl border border-sky-100 bg-slate-50 p-3"><PackageCheck className="mb-2 h-5 w-5 text-emerald-700" /><p className="text-sm font-bold text-slate-900">{item.label}</p><p className="text-sm text-slate-700">{quantity(item.kind)} available</p></div>)}</div></section>
        <section className="overflow-hidden rounded-2xl border-2 border-slate-900 bg-white shadow-[3px_4px_0_#1c1917]"><InabelHeaderStrip variant="royal" label="Transaction History" /><div className="max-h-80 overflow-y-auto p-5">{market.transactions.length === 0 ? <p className="text-sm text-slate-600">No Quest Coins transactions yet.</p> : <ol className="space-y-2">{market.transactions.map(transaction => <li key={`${transaction.event_key}-${transaction.created_at}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm"><div><p className="font-bold text-slate-900">{transactionName(transaction.event_key)}</p><time className="text-xs text-slate-600">{new Date(transaction.created_at).toLocaleString()}</time></div><div className="text-right"><p className={transaction.amount > 0 ? 'font-black text-emerald-700' : 'font-black text-rose-700'}>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</p><p className="text-xs text-slate-600">Balance {transaction.balance_after}</p></div></li>)}</ol>}</div></section>
      </div>
    </div>
  );
};
