import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { Landing } from '@/pages/Landing'
import { Login } from '@/pages/Login'
import { Signup } from '@/pages/Signup'
import { Settings } from '@/pages/Settings'

import { SellerDashboard } from '@/pages/seller/Dashboard'
import { SellerInventory } from '@/pages/seller/Inventory'
import { SellerListings } from '@/pages/seller/Listings'
import { SellerRequests } from '@/pages/seller/Requests'
import { SellerTrades } from '@/pages/seller/Trades'
import { SellerQCA } from '@/pages/seller/QCA'

import { BuyerDashboard } from '@/pages/buyer/Dashboard'
import { BuyerWallet } from '@/pages/buyer/Wallet'
import { BuyerMarketplace } from '@/pages/buyer/Marketplace'
import { BuyerRFQ } from '@/pages/buyer/RFQ'
import { BuyerTrades } from '@/pages/buyer/Trades'
import { BuyerSamples } from '@/pages/buyer/Samples'

import { LabDashboard } from '@/pages/lab/Dashboard'
import { LabRequests } from '@/pages/lab/Requests'
import { LabConduct } from '@/pages/lab/Conduct'
import { LabHistory } from '@/pages/lab/History'
import { LabWallet } from '@/pages/lab/Wallet'
import { LabNotifications } from '@/pages/lab/Notifications'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/seller" element={<AppShell role="seller" />}>
          <Route index element={<SellerDashboard />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="listings" element={<SellerListings />} />
          <Route path="requests" element={<SellerRequests />} />
          <Route path="trades" element={<SellerTrades />} />
          <Route path="qca" element={<SellerQCA />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/buyer" element={<AppShell role="buyer" />}>
          <Route index element={<BuyerDashboard />} />
          <Route path="wallet" element={<BuyerWallet />} />
          <Route path="marketplace" element={<BuyerMarketplace />} />
          <Route path="rfq" element={<BuyerRFQ />} />
          <Route path="trades" element={<BuyerTrades />} />
          <Route path="samples" element={<BuyerSamples />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/lab" element={<AppShell role="lab" />}>
          <Route index element={<LabDashboard />} />
          <Route path="requests" element={<LabRequests />} />
          <Route path="conduct" element={<LabConduct />} />
          <Route path="history" element={<LabHistory />} />
          <Route path="wallet" element={<LabWallet />} />
          <Route path="notifications" element={<LabNotifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
