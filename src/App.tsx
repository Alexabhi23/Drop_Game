/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LootBoxPurchase } from './pages/LootBoxPurchase';
import { Inventory } from './pages/Inventory';
import { Rewards } from './pages/Rewards';
import { Leaderboard } from './pages/Leaderboard';
import { TransactionPending } from './pages/TransactionPending';
import { LootBoxReveal } from './pages/LootBoxReveal';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LootBoxPurchase />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
        <Route path="/pending" element={<TransactionPending />} />
        <Route path="/reveal" element={<LootBoxReveal />} />
      </Routes>
    </BrowserRouter>
  );
}
