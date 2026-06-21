import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// --- DATABASE TYPES ---
interface UserSession {
  id: string;
  email: string;
  password?: string;
  name: string;
  avatar: string;
  referralCode: string;
  invitedBy?: string; // referralCode of referrer
  isAdmin: boolean;
  stats: {
    balance: number;
    lifetimeEarnings: number;
    completedTasksCount: number;
    dailyCheckInDate: string | null;
  };
  withdrawals: {
    id: string;
    accountName: string;
    gcashNumber: string;
    amount: number;
    status: 'pending' | 'processing' | 'success' | 'failed';
    createdAt: string;
    referenceNo: string;
  }[];
  activityLogs: {
    id: string;
    type: 'reward' | 'withdraw' | 'bonus';
    title: string;
    amount: number;
    timestamp: string;
    details: string;
  }[];
  referredFriends: {
    id: string;
    name: string;
    avatar: string;
    currentEarnings: number;
    bonusClaimed: boolean;
    joinedAt: string;
  }[];
}

interface DBStructure {
  users: UserSession[];
}

// --- HELPER TO INITIALIZE AND GET DATABASE ---
function loadDB(): DBStructure {
  // Ensure the src/data directory exists
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading database file, resetting...', e);
    }
  }

  // Generate unique code helper
  const genRef = () => 'REF-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Create default seed database
  const defaultDB: DBStructure = {
    users: [
      // 1. Core Admin Account
      {
        id: 'admin-rosco',
        email: 'Roscodanilo93@gmail.com',
        password: 'Titanvpn/10',
        name: 'Admin Rosco',
        avatar: '👑',
        referralCode: 'ADMIN-ROSCO',
        isAdmin: true,
        stats: {
          balance: 0,
          lifetimeEarnings: 0,
          completedTasksCount: 0,
          dailyCheckInDate: null
        },
        withdrawals: [],
        activityLogs: [
          {
            id: 'log-seed-admin',
            type: 'bonus',
            title: 'System Initialized',
            amount: 0,
            timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
            details: 'Naka-online na ang GCash Click-Earn Cloud Server. Handa nang subaybayan ang aktibidad ng mga mamamayan!'
          }
        ],
        referredFriends: []
      },
      // 2. Mock Test User 1
      {
        id: 'user-juan',
        email: 'juan@example.ph',
        password: 'Password123',
        name: 'Juan Dela Cruz',
        avatar: '👨‍💻',
        referralCode: 'REF-JUAN77',
        isAdmin: false,
        stats: {
          balance: 145.00,
          lifetimeEarnings: 345.00,
          completedTasksCount: 16,
          dailyCheckInDate: new Date().toLocaleDateString('fil-PH')
        },
        withdrawals: [
          {
            id: 'with-seed-1',
            accountName: 'Juan Dela Cruz',
            gcashNumber: '09171234567',
            amount: 200.00,
            status: 'pending',
            createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toLocaleString('fil-PH', { hour12: true }),
            referenceNo: 'REF' + Math.floor(1000000000 + Math.random() * 9000000000)
          }
        ],
        activityLogs: [
          {
            id: 'log-seed-juan-1',
            type: 'withdraw',
            title: 'Nagsumite ng GCash Cashout',
            amount: 200.00,
            timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toLocaleString('fil-PH', { hour12: true }),
            details: 'Humihiling ng ₱200.00 cashout sa GCash number 09171234567. Naghihintay ng pag-approve ng admin.'
          },
          {
            id: 'log-seed-juan-2',
            type: 'reward',
            title: 'Shopee PH Tipid Hacks 2026 Completed',
            amount: 12.50,
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString('fil-PH', { hour12: true }),
            details: 'Nanood ng website upang matutunan ang Piso deals at libreng shipping guide.'
          }
        ],
        referredFriends: []
      },
      // 3. Mock Test User 2
      {
        id: 'user-clara',
        email: 'clara@example.ph',
        password: 'Password123',
        name: 'Maria Clara Santos',
        avatar: '👩‍⚕️',
        referralCode: 'REF-CLARAS',
        invitedBy: 'ADMIN-ROSCO', // Admin can claim bonus for Clara if Clara earnings reach 500!
        isAdmin: false,
        stats: {
          balance: 280.00,
          lifetimeEarnings: 530.00,
          completedTasksCount: 25,
          dailyCheckInDate: null
        },
        withdrawals: [
          {
            id: 'with-seed-2',
            accountName: 'Maria Clara Santos',
            gcashNumber: '09187654321',
            amount: 250.00,
            status: 'success',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleString('fil-PH', { hour12: true }),
            referenceNo: 'REF5830184321'
          }
        ],
        activityLogs: [
          {
            id: 'log-seed-clara-1',
            type: 'withdraw',
            title: 'GCash Cashout Approved',
            amount: 250.00,
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleString('fil-PH', { hour12: true }),
            details: 'Nabayaran na ang ₱250.00 cashout sa iyong GCash wallet.'
          }
        ],
        referredFriends: []
      }
    ]
  };

  // Add Maria Clara as admin's referred friend at the start
  defaultDB.users[0].referredFriends.push({
    id: 'user-clara',
    name: 'Maria Clara Santos',
    avatar: '👩‍⚕️',
    currentEarnings: 530.00, // already reached 500! Ready to claim!
    bonusClaimed: false,
    joinedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(defaultDB, null, 2), 'utf-8');
  return defaultDB;
}

function saveDB(data: DBStructure) {
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Ensure database is initialized
let database = loadDB();

// --- AUTH MIDDLEWARE ---
function generateToken(userId: string) {
  return userId; // Simple pass-through for simulation token
}

// ============================================
//               AUTHENTICATION
// ============================================

// REGISTER
app.post('/api/auth/register', (req, res) => {
  const { email, password, name, avatar, referralCode } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Kailangan ibigay ang email, password, at pangalan.' });
  }

  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();

  const userExists = db.users.find(u => u.email.toLowerCase() === lowerEmail);
  if (userExists) {
    return res.status(400).json({ error: 'Ang email na ito ay may rehistradong account na.' });
  }

  // Generate individual referral code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let myCode = 'REF-';
  for (let i = 0; i < 6; i++) {
    myCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const userId = 'user-api-' + Date.now();
  const defaultAvatar = avatar || '👤';

  // Create new user session structure
  const newUser: UserSession = {
    id: userId,
    email: email.trim(),
    password: password,
    name: name.trim(),
    avatar: defaultAvatar,
    referralCode: myCode,
    isAdmin: false,
    stats: {
      balance: 25.00, // Starting Welcome Bonus
      lifetimeEarnings: 25.00,
      completedTasksCount: 0,
      dailyCheckInDate: null
    },
    withdrawals: [],
    activityLogs: [
      {
        id: 'log-welcome-' + Date.now(),
        type: 'bonus',
        title: 'Salamat sa pagre-register! Libreng Pang-umpisang Pera',
        amount: 25.00,
        timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
        details: 'Nakatanggap ka ng libreng ₱25.00 bilang Welcome Gift.'
      }
    ],
    referredFriends: []
  };

  // If registering with a referral code
  if (referralCode) {
    const codeClean = referralCode.trim().toUpperCase();
    const referrer = db.users.find(u => u.referralCode === codeClean);
    if (referrer) {
      newUser.invitedBy = codeClean;
      // Add this new user to the referrer's referred list!
      referrer.referredFriends.push({
        id: userId,
        name: newUser.name,
        avatar: newUser.avatar,
        currentEarnings: 25.00, // Starts with their initial balance
        bonusClaimed: false,
        joinedAt: new Date().toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      
      // Also notify referrer with a customized activity log
      referrer.activityLogs.unshift({
        id: 'log-ref-join-' + Date.now(),
        type: 'bonus',
        title: `Sumali gamit ang Link mo si ${newUser.name}`,
        amount: 0,
        timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
        details: `${newUser.name} ay gumawa ng account gamit ang iyong link. Makakakuha ka ng ₱5.00 kapag naka-ipon siya ng kanyang unang ₱500.00!`
      });
    }
  }

  db.users.push(newUser);
  saveDB(db);

  const { password: _, ...userSafe } = newUser as any;
  res.json({ user: userSafe, token: generateToken(userId) });
});

// LOGIN
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Kailangan ibigay ang email at password.' });
  }

  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();

  const user = db.users.find(u => u.email.toLowerCase() === lowerEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Maling email o password. Pakisubukang muli.' });
  }

  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe, token: generateToken(user.id) });
});

// GOOGLE SIGN IN OR SIGN UP SIMULATION
app.post('/api/auth/google', (req, res) => {
  const { email, name, avatar, referralCode } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Kailangan ibigay ang Google account details.' });
  }

  const db = loadDB();
  const lowerEmail = email.toLowerCase().trim();

  let user = db.users.find(u => u.email.toLowerCase() === lowerEmail);

  // If user doesn't exist, create it on-the-fly (Sign Up)
  if (!user) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let myCode = 'REF-';
    for (let i = 0; i < 6; i++) {
      myCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const userId = 'user-google-' + Date.now();
    const defaultAvatar = avatar || '🌐';

    user = {
      id: userId,
      email: email.trim(),
      // No standard password since they used Google Sign-In
      name: name.trim(),
      avatar: defaultAvatar,
      referralCode: myCode,
      isAdmin: false,
      stats: {
        balance: 25.00,
        lifetimeEarnings: 25.00,
        completedTasksCount: 0,
        dailyCheckInDate: null
      },
      withdrawals: [],
      activityLogs: [
        {
          id: 'log-welcome-' + Date.now(),
          type: 'bonus',
          title: 'Welcome! Google Sign-up Activated',
          amount: 25.00,
          timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
          details: 'Nakatanggap ka ng libreng ₱25.00 bilang Welcome Gift sa pag-login gamit ang Google.'
        }
      ],
      referredFriends: []
    };

    // Referrer tracking
    if (referralCode) {
      const codeClean = referralCode.trim().toUpperCase();
      const referrer = db.users.find(u => u.referralCode === codeClean);
      if (referrer) {
        user.invitedBy = codeClean;
        referrer.referredFriends.push({
          id: userId,
          name: user.name,
          avatar: user.avatar,
          currentEarnings: 25.00,
          bonusClaimed: false,
          joinedAt: new Date().toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })
        });
        referrer.activityLogs.unshift({
          id: 'log-ref-join-' + Date.now(),
          type: 'bonus',
          title: `Sumali gamit ang Link mo si ${user.name} (Google)`,
          amount: 0,
          timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
          details: `${user.name} ay gumawa ng account gamit ang Google Sign-In at iyong referral link. Makakakuha ka ng ₱5.00 kapag naka-ipon siya ng kanyang unang ₱500.00!`
        });
      }
    }

    db.users.push(user);
    saveDB(db);
  }

  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe, token: generateToken(user.id) });
});

// GET USER PROFILE
app.get('/api/user/profile', (req, res) => {
  const userId = req.headers.authorization;
  if (!userId) {
    return res.status(401).json({ error: 'Lumalabas na naka-Logout ka. Mag-login muna.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Hindi mahanap ang gumagamit.' });
  }

  // Update referred friends' progress live in referrer's profile screen
  // By matching referredFriends with their actual current earnings on our DB!
  let isFriendListModified = false;
  const synchronizedReferredFriends = user.referredFriends.map(friend => {
    const actualFriendUser = db.users.find(u => u.id === friend.id);
    if (actualFriendUser && actualFriendUser.stats.lifetimeEarnings !== friend.currentEarnings) {
      isFriendListModified = true;
      return {
        ...friend,
        currentEarnings: actualFriendUser.stats.lifetimeEarnings
      };
    }
    return friend;
  });

  if (isFriendListModified) {
    user.referredFriends = synchronizedReferredFriends;
    saveDB(db);
  }

  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe });
});

// COMPLETED TASK REWARD SYNC
app.post('/api/user/task-complete', (req, res) => {
  const userId = req.headers.authorization;
  const { rewardAmount, title, details } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated Request.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Hindi mahanap ang gumagamit.' });
  }

  const reward = Number(rewardAmount);
  user.stats.balance = Number((user.stats.balance + reward).toFixed(2));
  user.stats.lifetimeEarnings = Number((user.stats.lifetimeEarnings + reward).toFixed(2));
  user.stats.completedTasksCount += 1;

  // Record logs
  user.activityLogs.unshift({
    id: 'log-' + Date.now(),
    type: 'reward',
    title: title || 'Nood Campaign Reward',
    amount: reward,
    timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
    details: details || `Nakumpleto mo ang panonood ng website at may gantimpala kang ₱${reward.toFixed(2)}.`
  });

  // If this user has a referrer, we also sync their current earnings inside referrer's friend entry!
  if (user.invitedBy) {
    const referrer = db.users.find(u => u.referralCode === user.invitedBy);
    if (referrer) {
      const friendEntryIdx = referrer.referredFriends.findIndex(f => f.id === user.id);
      if (friendEntryIdx !== -1) {
        const oldEarnings = referrer.referredFriends[friendEntryIdx].currentEarnings;
        referrer.referredFriends[friendEntryIdx].currentEarnings = user.stats.lifetimeEarnings;

        // If friend just reached 500 lifetime earnings, notify referrer
        if (oldEarnings < 500 && user.stats.lifetimeEarnings >= 500) {
          referrer.activityLogs.unshift({
            id: 'log-ref-alert-' + Date.now(),
            type: 'bonus',
            title: `⭐ Target Naabot ni ${user.name}!`,
            amount: 5.00,
            timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
            details: `Umabot na sa ₱500.00 ang naiipong kita ng na-invite mong si ${user.name}! Pwede mo nang pitasin ang iyong ₱5.00 Bonus sa Referee Section!`
          });
        }
      }
    }
  }

  saveDB(db);
  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe });
});

// CLAIM REFERRAL BONUS
app.post('/api/user/claim-referral-bonus', (req, res) => {
  const userId = req.headers.authorization;
  const { friendId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthenticated.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Hindi mahanap ang user.' });
  }

  const friend = user.referredFriends.find(f => f.id === friendId);
  if (!friend) {
    return res.status(404).json({ error: 'Hindi nakita si friend sa mga invited mo.' });
  }

  // Check if they actual reach 500 (sync actual user info)
  const actualFriend = db.users.find(u => u.id === friendId);
  const realFriendEarnings = actualFriend ? actualFriend.stats.lifetimeEarnings : friend.currentEarnings;

  if (realFriendEarnings < 500) {
    return res.status(400).json({ error: `Humihingi ng paumanhin: Kailangan muna maabot ni ${friend.name} ang ₱500.00 lifetime earnings. (Kasalukuyan: ₱${realFriendEarnings.toFixed(2)})` });
  }

  if (friend.bonusClaimed) {
    return res.status(400).json({ error: 'Siningil mo na ang reward para kay kaibigan.' });
  }

  // Upgrade status
  friend.bonusClaimed = true;
  friend.currentEarnings = realFriendEarnings;

  // Add reward to referrer
  user.stats.balance = Number((user.stats.balance + 5.00).toFixed(2));
  user.stats.lifetimeEarnings = Number((user.stats.lifetimeEarnings + 5.00).toFixed(2));

  user.activityLogs.unshift({
    id: 'log-ref-claimed-' + Date.now(),
    type: 'bonus',
    title: `Na-claim ang Referral Bonus (${friend.name})`,
    amount: 5.00,
    timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
    details: `Salamat sa pag-akay kay ${friend.name}! Matagumpay nating naitala ang iyong ₱5.00 bonus.`
  });

  saveDB(db);
  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe });
});

// SUBMIT WITHDRAWAL REQUEST
app.post('/api/user/withdraw', (req, res) => {
  const userId = req.headers.authorization;
  const { accountName, gcashNumber, amount } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Naka-Logout. Lumagda muna upang mag-withdraw.' });
  }

  const requestedAmount = Number(amount);
  if (isNaN(requestedAmount) || requestedAmount < 200) {
    return res.status(400).json({ error: 'Ang minimum na withdrawal ay ₱200.00.' });
  }

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Hindi maiproseso: User not found.' });
  }

  if (user.stats.balance < requestedAmount) {
    return res.status(400).json({ error: 'Kulang ang iyong kasalukuyang balanse sa hinihiling na withdrawal.' });
  }

  // Deduct from balance
  user.stats.balance = Number((user.stats.balance - requestedAmount).toFixed(2));

  // Create request
  const newWithdrawal = {
    id: 'with-' + Date.now(),
    accountName: accountName.trim(),
    gcashNumber: gcashNumber.trim(),
    amount: requestedAmount,
    status: 'pending' as const,
    createdAt: new Date().toLocaleString('fil-PH', { hour12: true }),
    referenceNo: 'REF' + Math.floor(1000000000 + Math.random() * 9000000000)
  };

  user.withdrawals.unshift(newWithdrawal);

  // Log activity
  user.activityLogs.unshift({
    id: 'log-withdraw-' + Date.now(),
    type: 'withdraw',
    title: 'Nagsumite ng GCash Cashout',
    amount: requestedAmount,
    timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
    details: `Humiling ka ng ₱${requestedAmount.toFixed(2)} cashout papunta sa GCash Number: ${gcashNumber}. Naghihintay ito ng pagsusuri ng Admin.`
  });

  saveDB(db);
  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe });
});

// DAILY CHECKIN SYNC
app.post('/api/user/daily-checkin', (req, res) => {
  const userId = req.headers.authorization;
  if (!userId) return res.status(401).json({ error: 'Access Denied.' });

  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const todayStr = new Date().toLocaleDateString('fil-PH');
  if (user.stats.dailyCheckInDate === todayStr) {
    return res.status(400).json({ error: 'Nakuha mo na ang iyong arawang gantimpala para sa araw na ito.' });
  }

  const checkinReward = 10.00;
  user.stats.balance = Number((user.stats.balance + checkinReward).toFixed(2));
  user.stats.lifetimeEarnings = Number((user.stats.lifetimeEarnings + checkinReward).toFixed(2));
  user.stats.dailyCheckInDate = todayStr;

  user.activityLogs.unshift({
    id: 'log-checkin-' + Date.now(),
    type: 'bonus',
    title: 'Daily Check-In Reward Nakuha',
    amount: checkinReward,
    timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
    details: `Pumasok ka ngayong araw at ginawaran ka ng libreng ₱${checkinReward.toFixed(2)}.`
  });

  saveDB(db);
  const { password: _, ...userSafe } = user as any;
  res.json({ user: userSafe });
});


// ============================================
//               ADMIN FUNCTIONS
// ============================================

// GET ALL USERS AND STATS (For Admin dashboard)
app.get('/api/admin/dashboard', (req, res) => {
  const adminId = req.headers.authorization;
  if (!adminId) {
    return res.status(401).json({ error: 'Naka-loob lamang ito sa Admin.' });
  }

  const db = loadDB();
  const adminUser = db.users.find(u => u.id === adminId && u.isAdmin);
  if (!adminUser) {
    return res.status(403).json({ error: 'Wala kang pahintulot na tingnan ang page na ito.' });
  }

  // Construct a summary list for tracking across devices
  const allUsersStats = db.users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    isAdmin: u.isAdmin,
    stats: u.stats,
    withdrawalsCount: u.withdrawals.length,
    referralCode: u.referralCode,
    referredFriendsCount: u.referredFriends.length,
    lastActivities: u.activityLogs.slice(0, 10) // last 10 activities
  }));

  // Gather all withdrawal requests across everyone to manage in one central hub
  const pendingAndAllWithdrawals: {
    userId: string;
    userName: string;
    userAvatar: string;
    request: any;
  }[] = [];

  db.users.forEach(u => {
    u.withdrawals.forEach(w => {
      pendingAndAllWithdrawals.push({
        userId: u.id,
        userName: u.name,
        userAvatar: u.avatar,
        request: w
      });
    });
  });

  // Sort withdrawals by ID or timestamp (newest first)
  pendingAndAllWithdrawals.sort((a, b) => b.request.createdAt.localeCompare(a.request.createdAt));

  res.json({
    users: allUsersStats,
    withdrawals: pendingAndAllWithdrawals
  });
});

// ACTION APPROVE/DECLINE WITHDRAWAL
app.post('/api/admin/withdrawals/:withdrawId/action', (req, res) => {
  const adminId = req.headers.authorization;
  const { withdrawId } = req.params;
  const { action } = req.body; // 'approve' or 'decline'

  if (!adminId) {
    return res.status(401).json({ error: 'Admin signature required.' });
  }

  const db = loadDB();
  const adminUser = db.users.find(u => u.id === adminId && u.isAdmin);
  if (!adminUser) {
    return res.status(403).json({ error: 'Pahintulot ay nakareserba lamang sa Admin.' });
  }

  // Find user and withdrawal request 
  let targetUser: UserSession | undefined;
  let targetWithdrawalIndex = -1;

  for (const user of db.users) {
    const idx = user.withdrawals.findIndex(w => w.id === withdrawId);
    if (idx !== -1) {
      targetUser = user;
      targetWithdrawalIndex = idx;
      break;
    }
  }

  if (!targetUser || targetWithdrawalIndex === -1) {
    return res.status(404).json({ error: 'Hindi nahanap ang partikular na withdrawal request.' });
  }

  const reqObj = targetUser.withdrawals[targetWithdrawalIndex];
  if (reqObj.status !== 'pending' && reqObj.status !== 'processing') {
    return res.status(400).json({ error: `Ang kahilingang ito ay tapos na (Kasalukuyang Status: ${reqObj.status}).` });
  }

  if (action === 'approve') {
    reqObj.status = 'success';
    
    // Add success logger
    targetUser.activityLogs.unshift({
      id: 'admin-action-' + Date.now(),
      type: 'withdraw',
      title: 'GCash Cashout Approved!',
      amount: reqObj.amount,
      timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
      details: `Inaprubahan ng Admin ang iyong cashout na nagkakahalaga ng ₱${reqObj.amount.toFixed(2)}. Matagumpay itong naipadala sa GCash number mo!`
    });
  } else if (action === 'decline') {
    reqObj.status = 'failed';
    
    // Refund user balance
    targetUser.stats.balance = Number((targetUser.stats.balance + reqObj.amount).toFixed(2));

    // Add decline logger
    targetUser.activityLogs.unshift({
      id: 'admin-action-' + Date.now(),
      type: 'withdraw',
      title: 'GCash Cashout Tinanggihan (Refunded)',
      amount: reqObj.amount,
      timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
      details: `Tinanggihan ng Admin ang iyong withdrawal request para sa ₱${reqObj.amount.toFixed(2)}. Binalik ang pera sa iyong balance.`
    });
  } else {
    return res.status(400).json({ error: 'Maling desisyon. Approve o Decline lang ang pwedeng gawin.' });
  }

  saveDB(db);
  res.json({ success: true, message: `Desisyon ay naitala nang matagumpay.` });
});

// SIMULATE MOCK FRIEND EVENT FROM SERVER
app.post('/api/admin/simulate-mock-friend', (req, res) => {
  const { referrerId } = req.body;
  const db = loadDB();

  const referrer = db.users.find(u => u.id === referrerId);
  if (!referrer) return res.status(404).json({ error: 'Referrer not found' });

  const randomSub = Math.floor(100 + Math.random() * 900);
  const friendName = 'Piloto Dela Cruz #' + randomSub;

  const codeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randCode = 'REF-';
  for (let i = 0; i < 6; i++) randCode += codeChars.charAt(Math.floor(Math.random() * codeChars.length));

  // Register friend as actual user in backend!
  const mockFriend: UserSession = {
    id: 'mock-user-' + randomSub,
    email: `piloto${randomSub}@simulator.com`,
    password: 'Password123',
    name: friendName,
    avatar: '🧑‍🚀',
    referralCode: randCode,
    invitedBy: referrer.referralCode,
    isAdmin: false,
    stats: {
      balance: 100,
      lifetimeEarnings: 100,
      completedTasksCount: 4,
      dailyCheckInDate: null
    },
    withdrawals: [],
    activityLogs: [
      {
        id: 'mock-log-1',
        type: 'bonus',
        title: 'Joined platform',
        amount: 25.00,
        timestamp: new Date().toLocaleString(),
        details: 'Signed up under referral code ' + referrer.referralCode
      }
    ],
    referredFriends: []
  };

  db.users.push(mockFriend);

  // Link in referrer's profile list
  referrer.referredFriends.push({
    id: mockFriend.id,
    name: friendName,
    avatar: '🧑‍🚀',
    currentEarnings: 100,
    bonusClaimed: false,
    joinedAt: new Date().toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  referrer.activityLogs.unshift({
    id: 'mock-notif-' + Date.now(),
    type: 'bonus',
    title: `Sumali gamit ang link mo si ${friendName}`,
    amount: 0,
    timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
    details: `Salamat sa pagtawag kay ${friendName}! Pumasok siya sa server. Makukuha mo ang ₱5.00 kapag naabot niya ang ₱500 na kabuuang kita.`
  });

  saveDB(db);
  res.json({ success: true, user: referrer });
});

// SIMULATE ANOTHER COMPLETED REWARD FROM THE FRIEND TO DEMONSTRATE MILESTONE REACHED IN THE REFERRER PANEL
app.post('/api/admin/simulate-friend-earnings', (req, res) => {
  const { friendId } = req.body;
  const db = loadDB();

  // Find friend user
  const friend = db.users.find(u => u.id === friendId);
  if (!friend) return res.status(404).json({ error: 'Kaibigan ay hindi nahanap.' });

  // Add earnings to push them over the edges
  friend.stats.lifetimeEarnings = Math.min(500, friend.stats.lifetimeEarnings + 150);
  friend.stats.balance += 150;

  // Sync back to their referrer referredFriends entry
  if (friend.invitedBy) {
    const referrer = db.users.find(u => u.referralCode === friend.invitedBy);
    if (referrer) {
      const entry = referrer.referredFriends.find(f => f.id === friendId);
      if (entry) {
        entry.currentEarnings = friend.stats.lifetimeEarnings;
        
        if (friend.stats.lifetimeEarnings >= 500 && !entry.bonusClaimed) {
          referrer.activityLogs.unshift({
            id: 'mock-earn-reach-' + Date.now(),
            type: 'bonus',
            title: `⭐ Milestone Naabot ni ${friend.name}!`,
            amount: 5.00,
            timestamp: new Date().toLocaleString('fil-PH', { hour12: true }),
            details: `Mayroon nang higit sa ₱500.00 na kita si ${friend.name}! Iyong i-claim ang iyong ₱5.00 Referral reward ngayon.`
          });
        }
      }
    }
  }

  saveDB(db);
  res.json({ success: true });
});


// ============================================
//            VITE MIDDLEWARE SETUP
// ============================================

const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GCash Click-Earn running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
