import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Wallet, 
  Coins, 
  Eye, 
  Newspaper, 
  ShoppingBag, 
  TrendingUp, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Compass,
  DollarSign,
  UserCheck,
  Globe,
  Share2,
  ListFilter,
  CheckCircle,
  Activity,
  History,
  Plus,
  Moon,
  Sun,
  AlertCircle
} from 'lucide-react';
import { INITIAL_CAMPAIGNS } from './data/campaigns';
import { WebsiteCampaign, WithdrawalRequest, ActivityLog, UserStats } from './types';
import BrowserSimulator from './components/BrowserSimulator';
import GCashCashout from './components/GCashCashout';
import ReferralPanel from './components/ReferralPanel';

export default function App() {
  // --- CORE STATE ENGINE ---
  const [stats, setStats] = useState<UserStats>({
    balance: 25.00, // Initial free bonus of ₱25.00
    lifetimeEarnings: 25.00,
    completedTasksCount: 0,
    dailyCheckInDate: null
  });

  const [campaigns, setCampaigns] = useState<WebsiteCampaign[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activeTab, setActiveTab] = useState<'earn' | 'cashout' | 'guide'>('earn');
  
  // Custom Campaign Inputs
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customTimer, setCustomTimer] = useState(15);
  const [customCategory, setCustomCategory] = useState<'Shopping' | 'Balita' | 'Teknolohiya' | 'E-Services' | 'Kultura'>('Teknolohiya');
  
  // Active Browser Simulator Overlay View
  const [currentViewingCampaign, setCurrentViewingCampaign] = useState<WebsiteCampaign | null>(null);

  // Success Claim Animation State
  const [floatingCoinReward, setFloatingCoinReward] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Feedback Notification banner state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // --- INITIAL LOAD & SYNC SYSTEM ---
  useEffect(() => {
    // 1. Load Stats
    const savedStats = localStorage.getItem('gcash_click_earn_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (err) {
        console.error('Error loading stats', err);
      }
    }

    // 2. Load Campaigns (Merge initial campaigns with custom saved ones)
    const savedCampaigns = localStorage.getItem('gcash_click_earn_campaigns');
    if (savedCampaigns) {
      try {
        const parsed = JSON.parse(savedCampaigns) as WebsiteCampaign[];
        // Filter campaigns to avoid duplicate default items
        const defaultIds = INITIAL_CAMPAIGNS.map(c => c.id);
        const customOnly = parsed.filter(c => !defaultIds.includes(c.id));
        setCampaigns([...INITIAL_CAMPAIGNS, ...customOnly]);
      } catch (err) {
        setCampaigns(INITIAL_CAMPAIGNS);
      }
    } else {
      setCampaigns(INITIAL_CAMPAIGNS);
    }

    // 3. Load Withdrawals
    const savedWithdrawals = localStorage.getItem('gcash_click_earn_withdrawals');
    if (savedWithdrawals) {
      try {
        setWithdrawals(JSON.parse(savedWithdrawals));
      } catch (err) {
        console.error('Error loading withdrawals', err);
      }
    }

    // 4. Load Logs
    const savedLogs = localStorage.getItem('gcash_click_earn_logs');
    if (savedLogs) {
      try {
        setActivityLogs(JSON.parse(savedLogs));
      } catch (err) {
        console.error('Error loading logs', err);
      }
    } else {
      // Setup initial welcome log
      const welcomeLog: ActivityLog = {
        id: 'log-welcome',
        type: 'bonus',
        title: 'Salamat sa pagre-register! Libreng Pang-umpisang Pera',
        amount: 25.00,
        timestamp: new Date().toLocaleString('en-US', { hour12: true }),
        details: 'Nakatanggap ka ng libreng ₱25.00 bilang Welcome Gift.'
      };
      setActivityLogs([welcomeLog]);
    }
  }, []);

  // --- PERSISTENCE SYNCHRONIZER WRAPPERS ---
  const saveStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem('gcash_click_earn_stats', JSON.stringify(newStats));
  };

  const saveCampaigns = (newCampaigns: WebsiteCampaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('gcash_click_earn_campaigns', JSON.stringify(newCampaigns));
  };

  const saveWithdrawals = (newWithdrawals: WithdrawalRequest[]) => {
    setWithdrawals(newWithdrawals);
    localStorage.setItem('gcash_click_earn_withdrawals', JSON.stringify(newWithdrawals));
  };

  const saveLogs = (newLogs: ActivityLog[]) => {
    setActivityLogs(newLogs);
    localStorage.setItem('gcash_click_earn_logs', JSON.stringify(newLogs));
  };

  // Trigger brief alert notifications
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // --- GCASH AUTO-PROCESSOR SIMULATION ENGINE ---
  // Periodically check and advance pending/processing withdrawals to make backend feel real and dynamic
  useEffect(() => {
    const interval = setInterval(() => {
      let isChanged = false;
      const updatedWithdrawals = withdrawals.map((w) => {
        if (w.status === 'pending') {
          isChanged = true;
          return { ...w, status: 'processing' as const };
        } else if (w.status === 'processing') {
          isChanged = true;
          // Randomly succeed
          return { ...w, status: 'success' as const };
        }
        return w;
      });

      if (isChanged) {
        saveWithdrawals(updatedWithdrawals);
        
        // Find if we just finished one and log it
        const pendingW = withdrawals.find(w => w.status === 'pending');
        const processingW = withdrawals.find(w => w.status === 'processing');

        if (processingW) {
          const newLog: ActivityLog = {
            id: 'log-status-' + Date.now(),
            type: 'withdraw',
            title: `Ang GCash Out na nagkakahalaga ng ₱${processingW.amount.toFixed(2)} ay ganap nang Pumasok!`,
            amount: processingW.amount,
            timestamp: new Date().toLocaleString('en-US', { hour12: true }),
            details: `Tagumpay na naipadala sa GCash Ni ${processingW.accountName} (${processingW.gcashNumber}). Reference No: ${processingW.referenceNo}`
          };
          saveLogs([newLog, ...activityLogs]);
          triggerNotification(`🎉 GCash Transfer na ₱${processingW.amount.toFixed(2)} ay Success na!`, 'success');
        } else if (pendingW) {
          triggerNotification(`🔄 Sumusulong ang GCash queue: Pinoproseso na ang withdrawal mo...`, 'info');
        }
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [withdrawals, activityLogs]);

  // --- CORE SYSTEM CONTROLLER ACTIONS ---

  // 1. Daily Bonus Check-In
  const handleDailyCheckIn = () => {
    const todayStr = new Date().toDateString();
    
    if (stats.dailyCheckInDate === todayStr) {
      triggerNotification('⚠️ Nakuha mo na ang iyong Araw-araw na Bonus ngayon! Bumalik muli bukas.', 'error');
      return;
    }

    const reward = 5.00;
    const newStats: UserStats = {
      ...stats,
      balance: stats.balance + reward,
      lifetimeEarnings: stats.lifetimeEarnings + reward,
      dailyCheckInDate: todayStr
    };
    saveStats(newStats);

    const newLog: ActivityLog = {
      id: 'checkin-' + Date.now(),
      type: 'bonus',
      title: 'Araw-araw na Bonus Claimed!',
      amount: reward,
      timestamp: new Date().toLocaleString('en-US', { hour12: true }),
      details: 'Gantimpala para sa araw-araw na pag-bisita at pagsuporta sa app.'
    };
    saveLogs([newLog, ...activityLogs]);

    // Show visual coin rewards
    setFloatingCoinReward(reward);
    setShowConfetti(true);
    triggerNotification('💰 +₱5.00 Instant GCash Bonus idinagdag sa iyong Wallet!', 'success');

    setTimeout(() => {
      setFloatingCoinReward(null);
      setShowConfetti(false);
    }, 4000);
  };

  // 2. Open Website homepage for earning
  const handleOpenCampaign = (campaign: WebsiteCampaign) => {
    setCurrentViewingCampaign(campaign);
  };

  // 3. Complete browser simulator task
  const handleCompleteCampaignView = (id: string, reward: number) => {
    const updatedCampaigns = campaigns.map((c) => {
      if (c.id === id) {
        return { ...c, completed: true };
      }
      return c;
    });
    saveCampaigns(updatedCampaigns);

    const matchCampaign = campaigns.find(c => c.id === id);
    const label = matchCampaign ? matchCampaign.title : 'Web Homepage View';

    const newStats: UserStats = {
      ...stats,
      balance: stats.balance + reward,
      lifetimeEarnings: stats.lifetimeEarnings + reward,
      completedTasksCount: stats.completedTasksCount + 1
    };
    saveStats(newStats);

    const newLog: ActivityLog = {
      id: 'view-reward-' + Date.now(),
      type: 'reward',
      title: `Natapos panoorin ang ${label}`,
      amount: reward,
      timestamp: new Date().toLocaleString('en-US', { hour12: true }),
      details: `Salamat sa pag-open at pananatili sa homepage ng ${label} nang ${matchCampaign?.timer} segundo.`
    };
    saveLogs([newLog, ...activityLogs]);
    
    // Animate Coin Floating
    setFloatingCoinReward(reward);
    setShowConfetti(true);

    // Close browser overlay
    setCurrentViewingCampaign(null);
    triggerNotification(`💰 Matagumpay! Naka-ipon ka ng +₱${reward.toFixed(2)}`, 'success');

    setTimeout(() => {
      setFloatingCoinReward(null);
      setShowConfetti(false);
    }, 4000);
  };

  // 4. Submit GCash Withdrawal
  const handleWithdrawalRequest = (accountName: string, gcashNumber: string, amount: number) => {
    if (amount > stats.balance) {
      return { success: false, message: 'Hindi sapat ang inyong active balance.' };
    }

    const randomRef = 'REF' + Math.floor(10000000 + Math.random() * 90000000);
    const newRequest: WithdrawalRequest = {
      id: 'withdraw-' + Date.now(),
      accountName,
      gcashNumber,
      amount,
      status: 'pending',
      createdAt: new Date().toLocaleString('en-US', { hour12: true }),
      referenceNo: randomRef
    };

    const newWithdrawalsList = [...withdrawals, newRequest];
    saveWithdrawals(newWithdrawalsList);

    const newStats: UserStats = {
      ...stats,
      balance: stats.balance - amount
    };
    saveStats(newStats);

    const newLog: ActivityLog = {
      id: 'log-withdraw-' + Date.now(),
      type: 'withdraw',
      title: `Sumite ng Cashout (Binubuo)`,
      amount,
      timestamp: new Date().toLocaleString('en-US', { hour12: true }),
      details: `Nag-request ng cashout sa pangalang ${accountName} (${gcashNumber}). Ang iyong hiling ay naitabi sa database para sa automatic verification.`
    };
    saveLogs([newLog, ...activityLogs]);

    return { 
      success: true, 
      message: `Ang transaksyon ay ipapadala lunas sa iyong GCash number ${gcashNumber}. Ang reference ID mo ay ${randomRef}.` 
    };
  };

  // 5. Add Custom Website Campaign
  const handleCreateCustomCampaign = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customTitle.trim()) {
      triggerNotification('⚠️ Pakilagay ang pamagat (Website Title).', 'error');
      return;
    }

    if (!customUrl.trim()) {
      triggerNotification('⚠️ Pakilagay ang URL ng website.', 'error');
      return;
    }

    // URL format patch
    let finalUrl = customUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    // Dynamic Reward Calculation: Longer timer = bigger payout simulator value!
    // We provide a baseline pay formula: seconds * 0.75
    const computedReward = parseFloat((customTimer * 0.75).toFixed(2));

    const newCampaignId = 'custom-' + Date.now();
    const newCampaign: WebsiteCampaign = {
      id: newCampaignId,
      title: customTitle.trim(),
      url: finalUrl,
      reward: computedReward,
      timer: customTimer,
      logo: 'Globe',
      category: customCategory,
      description: `Espesyal na custom homepage campaign para sa ${customTitle.trim()}. Interaktibong basahin ang balita o portal upang kumita.`,
      completed: false,
      mockPageContent: {
        heroTitle: `🌐 Welcome sa Link: ${customTitle.trim()}`,
        heroSubtitle: `Digital landing page guide para sa domain na ${finalUrl.replace('https://', '').replace('http://', '').split('/')[0]}`,
        primaryColor: '#0F172A', // Premium Slate Dark
        accentColor: '#3B82F6',
        paragraphs: [
          `Salamat sa pag-open ng webpage na ito. Ang sponsor ng link na ito ay nagnanais na i-promote ang kanilang mga digital homepage services, magbasa ng balita, o ipakita ang kanilang tech reviews sa ating mga partner mobile affiliates.`,
          `Ikaw ay binabayaran ng ₱${computedReward.toFixed(2)} pesos sapagkat nire-record ng aming analytical system ang tyaga mo rito nang humigit-kumulang sa ${customTimer} segundo.`
        ],
        features: [
          `💡 Pangalan ng Domain: ${finalUrl}`,
          `⌚ Oras na itatagal: Panoorin ng saktong ${customTimer} seconds`,
          `💵 Halagang matatanggap: ₱${computedReward.toFixed(2)} PHP`,
          `🤖 Captcha safe secure: Piliting sagutan ng tama pagkatapos ng takdang segundo.`
        ],
        offers: [
          `Advertiser Verified Status - Active`,
          `Reward System Score - 100% Quality Output`
        ]
      }
    };

    const newCampaignsList = [...campaigns, newCampaign];
    saveCampaigns(newCampaignsList);

    // Reset Form Fields
    setCustomTitle('');
    setCustomUrl('');
    setCustomTimer(15);
    triggerNotification(`🎉 Matagumpay! Naidagdag ang "${customTitle.trim()}" na nagbibigay ng ₱${computedReward.toFixed(2)} reward!`, 'success');
  };

  // 6. Earn Referral Link Milestones Invite Bonus
  const handleAddReferralReward = (amount: number, logTitle: string, logDetails: string) => {
    const newStats: UserStats = {
      ...stats,
      balance: stats.balance + amount,
      lifetimeEarnings: stats.lifetimeEarnings + amount
    };
    saveStats(newStats);

    const newLog: ActivityLog = {
      id: 'referral-bonus-' + Date.now(),
      type: 'bonus',
      title: logTitle,
      amount: amount,
      timestamp: new Date().toLocaleString('en-US', { hour12: true }),
      details: logDetails
    };
    saveLogs([newLog, ...activityLogs]);

    // Show visual floating animation
    setFloatingCoinReward(amount);
    setShowConfetti(true);
    triggerNotification(`💰 Matagumpay! Nakuha mo ang +₱${amount.toFixed(2)} referral reward!`, 'success');

    setTimeout(() => {
      setFloatingCoinReward(null);
      setShowConfetti(false);
    }, 4000);
  };

  // --- RENDERING HANDLERS FOR CATEGORY ICONS ---
  const renderCampaignIcon = (logoName: string) => {
    switch (logoName) {
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-orange-500" />;
      case 'Newspaper':
        return <Newspaper className="w-5 h-5 text-blue-500" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5 text-indigo-500" />;
      case 'Globe':
      default:
        return <Globe className="w-5 h-5 text-emerald-500" />;
    }
  };

  return (
    <div id="application-root" className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-300">
      
      {/* 🔔 Floating Alerts & Toast Notification Feed */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-full px-4"
          >
            <div className={`p-4 rounded-xl border-2 shadow-xl flex items-center gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900' 
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-900'
                : 'bg-blue-50 border-blue-400 text-blue-900'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Activity className="w-5 h-5 text-blue-500 shrink-0" />
              )}
              <span className="text-xs font-bold leading-normal">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🪙 FLOATING COIN ANIMATION LAYER */}
      <AnimatePresence>
        {floatingCoinReward !== null && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            
            {/* Darken backing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900" 
            />

            {/* Glowing gold medal/coin floating up */}
            <motion.div
              initial={{ scale: 0.2, y: 200, opacity: 0 }}
              animate={{ scale: [1, 1.3, 1], y: -50, opacity: 1 }}
              exit={{ scale: 0.5, y: -250, opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="relative bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-full w-40 h-40 flex flex-col items-center justify-center shadow-2xl border-4 border-yellow-200"
            >
              <Coins className="w-16 h-16 text-yellow-950 animate-bounce" />
              <span className="text-3xl font-black text-yellow-950 tracking-tighter mt-1">
                +₱{floatingCoinReward.toFixed(2)}
              </span>
              <span className="text-[10px] font-black text-amber-900 tracking-wider uppercase bg-white/40 px-2 py-0.5 rounded-full mt-1.5">
                Saved! & Claimed
              </span>

              {/* Little simulated particle shapes */}
              <div className="absolute top-1/4 -left-10 text-2xl animate-pulse">💵</div>
              <div className="absolute top-3/4 -right-10 text-2xl animate-pulse">✨</div>
              <div className="absolute -top-10 right-1/4 text-2xl">💰</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 MAIN HEADER DASHBOARD BRAND BLOCK */}
      <div id="dashboard-brand-header" className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-lg overflow-hidden relative">
        
        {/* Subtle glowing abstract shape backgrounds */}
        <div className="absolute -right-16 -top-16 w-60 h-60 bg-blue-500/20 rounded-full blur-2xl"></div>
        <div className="absolute left-1/3 -bottom-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-xl"></div>

        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 relative">
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
            
            {/* Title / User profile info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 border-2 border-slate-900 rounded-full" title="Active"></span>
                <div className="bg-blue-600 border-2 border-blue-400 h-14 w-14 rounded-2xl flex items-center justify-center font-black text-xl text-yellow-300 shadow-inner">
                  🇵🇭
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-500 text-[10px] font-extrabold uppercase text-slate-950 px-1.5 py-0.5 rounded tracking-wide">
                    Live Simulator
                  </span>
                  <span className="text-slate-200 text-xs flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-blue-300" />
                    <span>GCash Affiliate ID: a97ac-6ad</span>
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  Visitor Rewards Pera Hub
                </h1>
                <p className="text-xs text-blue-150 mt-0.5 font-medium"> Kumita ng Pera sa GCash sa pamamagitan ng pag-view ng mga Web Homepage!</p>
              </div>
            </div>

            {/* WALLET AND REWARDS CENTER STATUS */}
            <div className="flex items-center gap-4 self-center md:self-auto">
              
              {/* CURRENT BALANCE */}
              <div className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 min-w-[170px] backdrop-blur-sm transition">
                <div className="flex items-center justify-between gap-3 text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                  <span>Kasalukuyang Balance</span>
                  <Coins className="w-4 h-4 text-yellow-300 animate-spin-slow" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mt-1 tracking-tight">
                  <span className="text-yellow-300 mr-0.5">₱</span>
                  {stats.balance.toFixed(2)}
                </div>
                <p className="text-[10px] text-emerald-300 mt-1 font-semibold flex items-center gap-1">
                  <span>● Ligtas at Pwedeng i-GCash</span>
                </p>
              </div>

              {/* DAILY CHECK IN ACTION */}
              <button
                id="daily-bonus-checking-btn"
                onClick={handleDailyCheckIn}
                className="bg-gradient-to-b from-yellow-300 to-amber-500 hover:from-yellow-200 hover:to-amber-450 text-slate-950 font-black px-5 py-3 rounded-2xl h-full shadow-md text-sm transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center gap-1 shrink-0"
              >
                <Sparkles className="w-5 h-5 text-yellow-950 animate-pulse" />
                <span>₱5.00 Araw Bonus</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* 🧭 NAVIGATION TABS CONTROL BAR */}
      <div id="dashboard-navigation-tabs" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          
          <div className="flex gap-1 py-3 overflow-x-auto shrink-0">
            {[
              { id: 'earn', label: '🌐 Mag-ipon ng Pera (Website Lists)', icon: Globe },
              { id: 'cashout', label: '💳 GCash Cash-Out (Withdraw)', icon: Wallet },
              { id: 'guide', label: '📖 Gabay sa Paggamit (FAQs)', icon: HelpCircle }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4.5 py-2.5 rounded-xl font-extrabold text-sm transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="w-4.5 h-4.5 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-slate-500 font-bold border-l border-slate-200 pl-4 py-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Server Time: Jun 2026</span>
          </div>

        </div>
      </div>

      {/* 🖥️ MAIN BODY WORKSPACE */}
      <div id="main-content-layout" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* TAB SHEETS ZONE (LHS - 3 COLUMNS) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* TAB 1: EARN CONTENT (VISITOR AD BLOCK) */}
            {activeTab === 'earn' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Intro Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Compass className="w-5 h-5 text-blue-600" />
                      <span>Mga Pinagtitiwalaang Web Campaigns ngayong araw</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Mag-click at manatili sa target homepage para makuha ang automated GCash bonus.</p>
                  </div>
                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/50 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Naka-ipon ngayon: {stats.completedTasksCount} Website Views</span>
                  </div>
                </div>

                {/* Grid Lists of Campaigns */}
                <div id="campaigns-grid-layout" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      id={`campaign-card-${camp.id}`}
                      className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition group hover:shadow-md ${
                        camp.completed 
                          ? 'border-emerald-200/60 shadow-inner bg-emerald-50/20' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Categories & High-visual payouts badge */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wide scale-95 origin-left ${
                            camp.completed 
                              ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                              : camp.category === 'Shopping'
                              ? 'bg-orange-50 border-orange-200 text-orange-700'
                              : camp.category === 'Balita'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : camp.category === 'E-Services'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {camp.category}
                          </span>

                          <div className="flex items-center gap-1.5 font-sans font-black text-sm text-slate-900">
                            <span className="text-[10px] text-slate-400 font-bold">Payout:</span>
                            <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5">
                              ₱{camp.reward.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Title and Logo */}
                        <div className="flex gap-2.5 items-start">
                          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:scale-105 transition shrink-0">
                            {renderCampaignIcon(camp.logo)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-extrabold text-slate-900 text-sm md:text-base leading-tight group-hover:text-blue-700 transition truncate">
                              {camp.title}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{camp.url}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-650 mt-3 leading-relaxed line-clamp-2">
                          {camp.description}
                        </p>
                      </div>

                      {/* Card Lower actions footer */}
                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Dapat manatili: <strong className="text-slate-700 font-bold">{camp.timer}s</strong></span>
                        </div>

                        {camp.completed ? (
                          <button
                            id={`campaign-view-btn-${camp.id}`}
                            onClick={() => handleOpenCampaign(camp)}
                            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-black px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done (Open again)</span>
                          </button>
                        ) : (
                          <button
                            id={`campaign-view-btn-${camp.id}`}
                            onClick={() => handleOpenCampaign(camp)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4.5 py-2.5 rounded-xl transition shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <span>🔍 Bisitahin ang Homepage</span>
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

                {/* 🔗 STUNNING CUSTOM HOMEPAGE CREATOR FORM BOX */}
                <div id="custom-homepage-creator-box" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-indigo-600"></div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                      <PlusCircle className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Magdagdag ng Iyong Personal na Website Homepage</h3>
                      <p className="text-xs text-slate-500">Subukang i-paste ang iyong paboritong website upang i-simulate ang real-world visitors view reward.</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateCustomCampaign} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    
                    {/* Campaign Title */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label htmlFor="custom-campaign-title" className="text-xs font-bold text-slate-700 block">Website Title (Pamagat)</label>
                      <input
                        id="custom-campaign-title"
                        type="text"
                        required
                        placeholder="Hal. Aking Personal na Blog"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs transition outline-none font-semibold"
                      />
                    </div>

                    {/* URL link */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label htmlFor="custom-campaign-url" className="text-xs font-bold text-slate-700 block">Homepage URL</label>
                      <input
                        id="custom-campaign-url"
                        type="text"
                        required
                        placeholder="Hal. www.mywebblog.com"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs transition outline-none font-mono"
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-1.5">
                      <label htmlFor="custom-campaign-cat" className="text-xs font-bold text-slate-700 block">Kategorya</label>
                      <select
                        id="custom-campaign-cat"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="Teknolohiya">💻 Teknolohiya</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Balita">📰 Balita</option>
                        <option value="E-Services">⚡ E-Services</option>
                        <option value="Kultura">🍲 Kultura</option>
                      </select>
                    </div>

                    {/* Timer selector */}
                    <div className="space-y-1.5">
                      <label htmlFor="custom-campaign-timer" className="text-xs font-bold text-slate-700 block">Dapat Manatili (Segundo)</label>
                      <select
                        id="custom-campaign-timer"
                        value={customTimer}
                        onChange={(e) => setCustomTimer(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-700 cursor-pointer"
                      >
                        <option value="10">10 segundo (Payout: ₱7.50)</option>
                        <option value="15">15 segundo (Payout: ₱11.25)</option>
                        <option value="20">20 segundo (Payout: ₱15.00)</option>
                        <option value="30">30 segundo (Payout: ₱22.50)</option>
                      </select>
                    </div>

                    {/* Action button */}
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        id="add-custom-btn"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>I-create at Idagdag sa Labada</span>
                      </button>
                    </div>

                  </form>
                  <p className="text-[10px] text-slate-400 mt-2">
                    💡 Paalaala: Atin itong binibigyan ng simulated rate na <strong>₱0.75 kada segundo</strong> ng pagpanatili bilang gantimpala ng system.
                  </p>
                </div>

              </div>
            )}

            {/* TAB 2: CASHOUT SECTION */}
            {activeTab === 'cashout' && (
              <div className="animate-fadeIn">
                <GCashCashout
                  stats={stats}
                  withdrawals={withdrawals}
                  onWithdrawSubmit={handleWithdrawalRequest}
                />
              </div>
            )}

            {/* TAB 3: USER GUIDE (FAQS) */}
            {activeTab === 'guide' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 animate-fadeIn">
                
                <div className="flex items-center gap-3 border-b border-slate-150 pb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-lg">Gabay at Patakaran sa Pag-ipon</h2>
                    <p className="text-xs text-slate-500">Magsimula nang wasto at alamin kung paano kumita gamit ang simulation.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      q: "1. Paano eksaktong gumagana ang app na ito?",
                      a: "Ang app na ito ay isang simulator kung paano makakuha ng pera sa pamamagitan ng pagbisita o pag-view sa homepages ng mga kakontratang websites. Ang bawat website listahan ay nagtataglay ng kaukulang reward sa PHP at takdang segundo na kailangang manatili rito upang maingat na ma-verify ang view."
                    },
                    {
                      q: "2. Ano ang Captcha Verification pagkatapos ng countdown?",
                      a: "Ito ay idinisenyo upang patunayan na ikaw ay isang totoong tao at hindi robotic automated script. Piliin lamang ang tamang larawan (hal. mangga, o pera) na hinihingi ng captcha instruction upang matagumpay na pumasok ang rewards sa iyong active balance."
                    },
                    {
                      q: "3. Gaano kabilis maproseso ang aking GCash withdrawal?",
                      a: "Napakabilis! Dahil idinisenyo ito bilang isang interactive simulated application, ang iyong withdrawal ay agad na mapupunta sa listahan bilang 'pending'. Ito ay susuriin at magbabagong status bilang 'processing' at kalaunan ay magiging ganap na 'success' na may reference number, na katulad ng totoong proseso ng payout."
                    },
                    {
                      q: "4. Pwede ba akong maglagay ng aking sariling website?",
                      a: "Oo naman! Naglaan kami ng seksyon na may pamagat na 'Magdagdag ng Iyong Personal na Website'. Dito maaari mong i-paste ang kahit anong custom website homepage link, maglaan ng segundo, at magbibigay ito ng calculated reward base sa haba ng oras ng panonood."
                    },
                    {
                      q: "5. Mayroon bang Limitasyon sa Pag-withdraw?",
                      a: "Ang naitakdang minimum withdrawal threshold ay nagkakahalaga ng ₱100.00 pesos. Ito ay upang mapanatiling kapaki-pakinabang at maayos ang transportasyong simulated system sa GCash."
                    }
                  ].map((faq, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl">
                      <h4 className="font-extrabold text-slate-900 text-sm md:text-base">{faq.q}</h4>
                      <p className="text-xs md:text-sm text-slate-650 mt-1.5 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <span className="text-xs font-bold text-blue-800">
                    💡 Paalaala: Lahat ng transaksyon, pera, at earnings sa application na ito ay bahagi ng isang ligtas na simulator upang maipakita ang mabilis at eleganteng software structure na binuo sa React.
                  </span>
                </div>

              </div>
            )}

          </div>

          {/* QUICK SIDEBAR COLUMNS (RHS - 1 COLUMN) */}
          <div className="space-y-6">
            
            {/* STATS OVERVIEW HEADER CARDS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Ang Aking Stats</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Kabuuang Kita</span>
                  <span className="text-base font-black text-slate-800 mt-1 block">
                    ₱{stats.lifetimeEarnings.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Na-open na Web</span>
                  <span className="text-base font-black text-slate-800 mt-1 block">
                    {stats.completedTasksCount} Views
                  </span>
                </div>
              </div>

              {/* Progress target goal bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-1">
                  <span>Araw-araw na Target (₱100)</span>
                  <span>{Math.min(100, Math.floor((stats.balance / 100) * 100))}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.balance / 100) * 100)}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1 text-center font-medium">May natitira pang ₱{Math.max(0, 100 - stats.balance).toFixed(2)} upang mapunuan.</p>
              </div>

            </div>

            {/* 🔗 REFERRALS & INVITE FRIENDS SECTION */}
            <ReferralPanel
              stats={stats}
              onAddReward={handleAddReferralReward}
              triggerNotification={triggerNotification}
            />

            {/* LIVE NOTIFICATIONS / AUDIT ACTIVITY LOG */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col max-h-[355px]">
              
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span>Mga Pag-asenso (Activity Logs)</span>
                </h3>
                <span className="text-[9px] font-mono text-slate-400 font-bold">Live Feed</span>
              </div>

              {/* Logs loop */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1" style={{ maxHeight: '280px' }}>
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                        log.type === 'bonus' 
                          ? 'bg-amber-100 text-amber-800'
                          : log.type === 'reward'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {log.type.toUpperCase()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{log.timestamp.split(', ')[1] || log.timestamp}</span>
                    </div>

                    <h5 className="font-bold text-slate-900 leading-snug">{log.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-normal">{log.details}</p>
                    
                    <div className="text-right text-[11px] font-black font-mono">
                      {log.type === 'withdraw' ? (
                        <span className="text-red-600">-₱{log.amount.toFixed(2)}</span>
                      ) : (
                        <span className="text-emerald-600">+₱{log.amount.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Simulated SMS Alert Preview screen mock for GCash users */}
            <div className="bg-slate-950 text-white rounded-2xl p-4.5 shadow-xl border border-slate-800 font-mono relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <span>📱 Simulated GCash SMS Monitor</span>
              </p>
              <div className="border border-slate-800 rounded bg-slate-900 p-2 text-[10px] text-slate-300 leading-relaxed max-h-[140px] overflow-y-auto">
                {withdrawals.some(w => w.status === 'success') ? (
                  <div>
                    <p className="text-slate-400 text-[9px]">Just Now • Globe Network</p>
                    <p className="text-white mt-1">
                      "You have received <strong className="text-emerald-400 font-extrabold">₱{withdrawals.find(w => w.status === 'success')?.amount.toFixed(2)}</strong> of GCash from VisitorRewards on {new Date().toLocaleDateString()}. Ref: {withdrawals.find(w => w.status === 'success')?.referenceNo}."
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center py-4">Naghihintay ng matagumpay na simulated withdrawal request...</p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 🌐 VIRTUAL BROWSER SIMULATOR CORE IFRAME PORTAL MODAL OVERLAY */}
      <AnimatePresence>
        {currentViewingCampaign && (
          <BrowserSimulator
            campaign={currentViewingCampaign}
            onComplete={handleCompleteCampaignView}
            onClose={() => setCurrentViewingCampaign(null)}
          />
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer id="dashboard-footer" className="bg-white border-t border-slate-200 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs font-bold text-slate-500">
            © 2026 Website Visitor and GCash Rewards Simulation.
          </p>
          <p className="text-[10px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            Ito ay isang interactive gamified web interface upang i-simulate ang pagbisita sa mga homepages bilang kasanayan at pagsuporta sa modernong React techniques. Walang tunay na bank accounts o GCash integrated APIs ang pwedeng mawalan o maubusan ng totoong pondo.
          </p>
        </div>
      </footer>

    </div>
  );
}
