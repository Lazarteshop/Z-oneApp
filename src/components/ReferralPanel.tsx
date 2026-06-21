import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  Link, 
  Copy, 
  Check, 
  UserPlus, 
  Award,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Info
} from 'lucide-react';
import { ReferralFriend, UserStats } from '../types';

interface ReferralPanelProps {
  stats: UserStats;
  onAddReward: (amount: number, logTitle: string, logDetails: string) => void;
  triggerNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

const MOCK_NAMES = [
  'Juan Dela Cruz',
  'Maria Clara Santos',
  'Arnel Pineda',
  'Sarah Geronimo',
  'Christian Bautista',
  'Angel Locsin',
  'Jose Rizal Mercado',
  'Ramon Magsaysay'
];

const MOCK_AVATARS = [
  '👨‍💻', '👩‍⚕️', '🧑‍🚀', '👩‍🎤', '🧑‍🍳', '👨‍🎓', '👩‍💼', '👨‍🎨'
];

export default function ReferralPanel({
  stats,
  onAddReward,
  triggerNotification
}: ReferralPanelProps) {
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [referredFriends, setReferredFriends] = useState<ReferralFriend[]>([]);

  // 1. Initialize referral code and load referred friends list on mount
  useEffect(() => {
    // Determine or generate unique referral code
    let code = localStorage.getItem('gcash_click_earn_ref_code');
    if (!code) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let randomCode = 'REF-';
      for (let i = 0; i < 6; i++) {
        randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      localStorage.setItem('gcash_click_earn_ref_code', randomCode);
      code = randomCode;
    }
    setReferralCode(code);

    // Load saved referred friends
    const savedFriends = localStorage.getItem('gcash_click_earn_referred_friends');
    if (savedFriends) {
      try {
        setReferredFriends(JSON.parse(savedFriends));
      } catch (e) {
        console.error('Error loading referred friends', e);
      }
    } else {
      // Add a default referred friend to make the screen gorgeous and teach the user instantly!
      const initialFriend: ReferralFriend = {
        id: 'ref-friend-default-1',
        name: 'Maria Clara Santos',
        avatar: '👩‍⚕️',
        currentEarnings: 380.00,
        bonusClaimed: false,
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })
      };
      const initialList = [initialFriend];
      setReferredFriends(initialList);
      localStorage.setItem('gcash_click_earn_referred_friends', JSON.stringify(initialList));
    }
  }, []);

  // Save friends list helper
  const saveFriends = (newList: ReferralFriend[]) => {
    setReferredFriends(newList);
    localStorage.setItem('gcash_click_earn_referred_friends', JSON.stringify(newList));
  };

  // Generate unique referral link
  const getReferralLink = () => {
    const origin = window.location.origin || 'https://ais-dev-3ztivd55eegu63xdj47ngy-124896488866.asia-southeast1.run.app';
    return `${origin}/?ref=${referralCode}`;
  };

  // Copy handler
  const handleCopy = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      triggerNotification('📋 Referral link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback
      setCopied(true);
      triggerNotification('📋 Naka-kopya ang Referral link!', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Simulate inviting a friend
  const simulateInviteFriend = () => {
    const unusedNames = MOCK_NAMES.filter(
      name => !referredFriends.some(f => f.name === name)
    );
    const chosenName = unusedNames.length > 0 
      ? unusedNames[Math.floor(Math.random() * unusedNames.length)] 
      : `User ${Math.floor(100 + Math.random() * 900)}`;

    const randomAvatar = MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)];
    const startingEarnings = Math.floor(Math.random() * 150); // Friends start with some random simulation activity

    const newFriend: ReferralFriend = {
      id: 'mock-ref-' + Date.now(),
      name: chosenName,
      avatar: randomAvatar,
      currentEarnings: startingEarnings,
      bonusClaimed: false,
      joinedAt: new Date().toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    const updated = [newFriend, ...referredFriends];
    saveFriends(updated);
    triggerNotification(`🎉 Simula: Sinuportahan ka ni ${chosenName}! Pumasok siya gamit ang referral link mo.`, 'success');
  };

  // Simulate friend earning 
  const addFriendEarnings = (friendId: string, amount: number) => {
    const updated = referredFriends.map(f => {
      if (f.id === friendId) {
        const nextEarnings = Math.min(500, f.currentEarnings + amount);
        if (nextEarnings >= 500 && f.currentEarnings < 500) {
          triggerNotification(`⭐ Milestones! Naabot ni ${f.name} ang ₱500.00! Pwede mo nang kolektahin ang iyong ₱5.00 bonus.`, 'success');
        }
        return {
          ...f,
          currentEarnings: nextEarnings
        };
      }
      return f;
    });
    saveFriends(updated);
  };

  // Claim ₱5.00 reward bonus
  const claimBonus = (friendId: string) => {
    const friend = referredFriends.find(f => f.id === friendId);
    if (!friend) return;
    if (friend.currentEarnings < 500) {
      triggerNotification('⚠️ Hindi pa naabot ng kaibigan ang ₱500.00 na kita upang ma-withdraw ang reward.', 'error');
      return;
    }
    if (friend.bonusClaimed) {
      triggerNotification('⚠️ Nakuha mo na ang bonus para sa kaibigang ito.', 'error');
      return;
    }

    // Mark as claimed
    const updated = referredFriends.map(f => {
      if (f.id === friendId) {
        return { ...f, bonusClaimed: true };
      }
      return f;
    });
    saveFriends(updated);

    // Call parents to award free bonus
    onAddReward(
      5.00,
      `Na-claim ang Referral Bonus (${friend.name})`,
      `Salamat sa matagumpay na pag-imbita kay ${friend.name}! Dahil nakuha na niya ang kanyang unang ₱500.00, may gantimpala kang ₱5.00.`
    );
  };

  return (
    <div id="referrals-panel-sidebar" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase flex items-center gap-1.5">
          <Users className="w-4 h-4 text-indigo-600 animate-pulse" />
          <span>Invite Friends & Earn</span>
        </h3>
        <span className="bg-rose-50 border border-rose-100 text-[10px] font-black text-rose-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <Gift className="w-3 h-3 text-rose-500" />
          <span>₱5.00 Bonus</span>
        </span>
      </div>

      {/* VALUE PROP TEXT */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/60 rounded-xl p-3 text-xs leading-relaxed">
        <p className="text-[11px] font-semibold text-slate-700">
          Ibahagi ang iyong referral link sa ibaba. Kapag nag-sign-up ang iyong kaibigan at naka-ipon ng kanyang unang <strong className="text-indigo-700">₱500.00</strong> sa simulator platform, makakatanggap ka ng instant <strong className="text-emerald-600">₱5.00 bonus</strong>!
        </p>
      </div>

      {/* UNIQUE REFERRAL LINK BOX */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">Iyong referral link</label>
        <div className="flex gap-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-600 truncate flex-1 flex items-center select-all">
            {getReferralLink()}
          </div>
          <button
            id="copy-ref-link-btn"
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl border flex items-center justify-center gap-1 transition-all text-xs font-bold cursor-pointer shrink-0 ${
              copied 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'bg-indigo-55 px-3 bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kopya!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* REFERRAL FRIENDS LIST */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide block">
            Mga Na-invite Mo ({referredFriends.length})
          </label>
          <span className="text-[9px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-0.5">
            Milestone: ₱500.00
          </span>
        </div>

        {referredFriends.length === 0 ? (
          <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400 text-xs">
            ⚠️ Wala pang na-invite na kaibigan. Ibahagi ang link sa itaas!
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {referredFriends.map((friend) => {
              const isEligible = friend.currentEarnings >= 500;
              const hasClaimed = friend.bonusClaimed;
              const progressPct = Math.min(100, Math.floor((friend.currentEarnings / 500) * 100));

              return (
                <div key={friend.id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base shrink-0">{friend.avatar}</span>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-slate-800 truncate leading-tight">{friend.name}</h5>
                        <p className="text-[9px] text-slate-450 font-medium">Sinuportahan {friend.joinedAt}</p>
                      </div>
                    </div>

                    {/* Claim status badge / button */}
                    <div className="shrink-0">
                      {hasClaimed ? (
                        <span className="bg-slate-200 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">
                          Na-claim na!
                        </span>
                      ) : isEligible ? (
                        <button
                          onClick={() => claimBonus(friend.id)}
                          className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-[9px] font-black px-2 py-0.5 rounded transition shadow-sm animate-bounce cursor-pointer flex items-center gap-0.5"
                          title="Claim ₱5.00 Bonus!"
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Claim ₱5</span>
                        </button>
                      ) : (
                        <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded">
                          ₱{friend.currentEarnings.toFixed(0)} / 500
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Friend progress details */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                      <span>Kita ni Friend: ₱{friend.currentEarnings.toFixed(2)}</span>
                      <span>{progressPct}%</span>
                    </div>
                    
                    {/* Tiny Progress Bar */}
                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isEligible ? 'bg-emerald-500' : 'bg-indigo-65 bg-indigo-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Sandbox helper inside card to simulate earnings increase */}
                  {!isEligible && (
                    <div className="flex gap-1.5 pt-1 border-t border-slate-100 justify-end">
                      <button
                        onClick={() => addFriendEarnings(friend.id, 50)}
                        className="text-[8px] bg-white border border-slate-200 font-bold px-1.5 py-0.5 rounded text-slate-600 hover:bg-slate-100 transition"
                      >
                        +₱50.00 Kita
                      </button>
                      <button
                        onClick={() => addFriendEarnings(friend.id, 500)}
                        className="text-[8px] bg-indigo-50 border border-indigo-150 font-black px-1.5 py-0.5 rounded text-indigo-600 hover:bg-indigo-100 transition"
                      >
                        ⚡ Reached ₱500
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SIMULATOR SANDBOX CONTROLLER */}
      <div className="pt-2 border-t border-slate-150">
        <button
          id="simulate-invite-friend-btn"
          onClick={simulateInviteFriend}
          className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white font-extrabold text-[10px] py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
        >
          <UserPlus className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
          <span>I-simulate ang Pag-invite ng Kaibigan (Test)</span>
        </button>
        <p className="text-[9px] text-slate-400 mt-1 text-center">
          💡 Gamitin ito para mag-sign up ng mock friend at subukan ang feature!
        </p>
      </div>

    </div>
  );
}
