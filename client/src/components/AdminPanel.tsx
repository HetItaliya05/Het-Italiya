import React, { useMemo, useState } from 'react';
import {
  Alert, AppBar, Avatar, Box, Button, Card, CardContent, Chip, CssBaseline,
  Dialog, DialogActions, DialogContent, DialogTitle, Drawer, FormControl,
  IconButton, InputLabel, LinearProgress, List, ListItemButton, ListItemIcon,
  ListItemText, MenuItem, Paper, Select, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TablePagination, TableRow, TextField, ThemeProvider,
  Toolbar, Tooltip, Typography, createTheme,
} from '@mui/material';
import {
  AccountBalanceWallet, Assessment, CheckCircle, Close, Dashboard, Delete, Edit,
  Games, Login, Logout, NotificationsActive, People, ReceiptLong, Visibility,
} from '@mui/icons-material';

type AdminSection = 'overview' | 'users' | 'deposits' | 'withdrawals' | 'transactions' | 'control';
type ReviewStatus = 'pending' | 'approved' | 'rejected';

interface AdminUser { id: string; name: string; phone: string; walletBalance: number; status: 'active' | 'blocked'; }
interface AdminDeposit { id: string; userName: string; amount: number; utr: string; screenshot: string; status: ReviewStatus; createdAt: string; }
interface AdminWithdrawal { id: string; userName: string; amount: number; payout: string; status: ReviewStatus; createdAt: string; }
type AdminTransaction = { id: string; userName: string; amount: number; status: ReviewStatus; createdAt: string; type: 'deposit' | 'withdraw'; };

const drawerWidth = 260;
const adminTheme = createTheme({
  palette: { mode: 'dark', background: { default: '#080808', paper: '#111111' }, primary: { main: '#ef4444' }, secondary: { main: '#f59e0b' }, success: { main: '#22c55e' } },
  shape: { borderRadius: 18 },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
});

const usersSeed: AdminUser[] = [
  { id: 'U1001', name: 'Ravi Patel', phone: '9876543210', walletBalance: 4200, status: 'active' },
  { id: 'U1002', name: 'Mehul Shah', phone: '9824411002', walletBalance: 0, status: 'active' },
  { id: 'U1003', name: 'Jignesh Parmar', phone: '9722233311', walletBalance: 760, status: 'blocked' },
  { id: 'U1004', name: 'Amit Solanki', phone: '9977886655', walletBalance: 11500, status: 'active' },
];
const depositsSeed: AdminDeposit[] = [
  { id: 'D501', userName: 'Ravi Patel', amount: 1000, utr: 'UTR9283761', screenshot: '/images/my-upi-qr.svg', status: 'pending', createdAt: '2026-02-01 10:30' },
  { id: 'D502', userName: 'Mehul Shah', amount: 500, utr: 'UTR9283762', screenshot: '/images/my-upi-qr.svg', status: 'pending', createdAt: '2026-02-01 10:36' },
  { id: 'D503', userName: 'Amit Solanki', amount: 3000, utr: 'UTR9283763', screenshot: '/images/my-upi-qr.svg', status: 'approved', createdAt: '2026-02-01 09:12' },
];
const withdrawalsSeed: AdminWithdrawal[] = [
  { id: 'W701', userName: 'Jignesh Parmar', amount: 600, payout: 'UPI jignesh@upi', status: 'pending', createdAt: '2026-02-01 11:02' },
  { id: 'W702', userName: 'Ravi Patel', amount: 1200, payout: 'Bank ****4421', status: 'approved', createdAt: '2026-02-01 08:44' },
];
const chartData = [34, 48, 38, 70, 58, 86, 74];

export const AdminPanel: React.FC = () => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: 'Admin@12345' });
  const [loginError, setLoginError] = useState('');
  const [section, setSection] = useState<AdminSection>('overview');
  const [users, setUsers] = useState<AdminUser[]>(usersSeed);
  const [deposits, setDeposits] = useState<AdminDeposit[]>(depositsSeed);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>(withdrawalsSeed);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [transactionType, setTransactionType] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [timerDuration, setTimerDuration] = useState(30);
  const [manualOverride, setManualOverride] = useState(false);
  const [forcedResult, setForcedResult] = useState<'A' | 'B'>('B');
  const [dialogImage, setDialogImage] = useState('');

  const stats = useMemo(() => {
    const totalDeposits = deposits.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0);
    const totalWithdrawals = withdrawals.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0);
    return { totalUsers: users.length, totalDeposits, totalWithdrawals, totalProfit: totalDeposits - totalWithdrawals };
  }, [deposits, users.length, withdrawals]);

  const pendingAlerts = deposits.filter((item) => item.status === 'pending').length + withdrawals.filter((item) => item.status === 'pending').length;
  const filteredUsers = users.filter((user) => `${user.name} ${user.phone}`.toLowerCase().includes(search.toLowerCase()));
  const transactions: AdminTransaction[] = useMemo(() => {
    const all: AdminTransaction[] = [
      ...deposits.map((item) => ({ id: item.id, userName: item.userName, amount: item.amount, status: item.status, createdAt: item.createdAt, type: 'deposit' as const })),
      ...withdrawals.map((item) => ({ id: item.id, userName: item.userName, amount: item.amount, status: item.status, createdAt: item.createdAt, type: 'withdraw' as const })),
    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return transactionType === 'all' ? all : all.filter((item) => item.type === transactionType);
  }, [deposits, transactionType, withdrawals]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();

    // TEMP ADMIN LOGIN FOR TESTING
    // This AdminPanel login is kept as a fallback (non-working JWT demo),
    // but for test mode use /admin-login page instead.
    setLoginError('Use /admin-login with the TEMP credentials.');
  };

  const approveDeposit = (id: string) => {
    const deposit = deposits.find((item) => item.id === id);
    if (!deposit || deposit.status !== 'pending') return;
    setDeposits((prev) => prev.map((item) => item.id === id ? { ...item, status: 'approved' } : item));
    setUsers((prev) => prev.map((user) => user.name === deposit.userName ? { ...user, walletBalance: user.walletBalance + deposit.amount } : user));
  };

  const navItems = [
    { key: 'overview' as const, label: 'Dashboard', icon: <Dashboard /> }, { key: 'users' as const, label: 'Users', icon: <People /> },
    { key: 'deposits' as const, label: 'Deposits', icon: <AccountBalanceWallet /> }, { key: 'withdrawals' as const, label: 'Withdrawals', icon: <ReceiptLong /> },
    { key: 'transactions' as const, label: 'Transactions', icon: <Assessment /> }, { key: 'control' as const, label: 'Game Control', icon: <Games /> },
  ];

  if (!token) {
    return <ThemeProvider theme={adminTheme}><CssBaseline /><Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'radial-gradient(circle at top, rgba(239,68,68,0.2), #050505 48%)' }}><Card sx={{ width: '100%', maxWidth: 430, border: '1px solid rgba(239,68,68,0.24)' }}><CardContent sx={{ p: 4 }}><Box component="form" onSubmit={handleLogin} sx={{ display: 'grid', gap: 3 }}><Box><Avatar sx={{ bgcolor: 'primary.main', width: 54, height: 54, mb: 2 }}><Login /></Avatar><Typography variant="h4" sx={{ fontWeight: 950 }}>Admin Login</Typography><Typography color="text.secondary" variant="body2">JWT protected trading admin dashboard</Typography></Box>{loginError && <Alert severity="error">{loginError}</Alert>}<TextField label="Username" value={loginForm.username} onChange={(event) => setLoginForm({ ...loginForm, username: event.target.value })} fullWidth /><TextField label="Password" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} fullWidth /><Button type="submit" size="large" variant="contained" sx={{ py: 1.4, fontWeight: 950 }}>Secure Login</Button><Alert severity="info">Demo credentials: admin / Admin@12345. Backend endpoint: POST /admin/login</Alert></Box></CardContent></Card></Box></ThemeProvider>;
  }

  const drawer = <Box sx={{ height: '100%', background: 'linear-gradient(180deg, #130707, #080808)', borderRight: '1px solid rgba(239,68,68,0.22)' }}><Box sx={{ p: 3 }}><Typography variant="h5" sx={{ fontWeight: 950, color: 'secondary.main' }}>DAMAN ADMIN</Typography><Typography variant="caption" color="text.secondary">Professional trading controls</Typography></Box><List sx={{ px: 1.5 }}>{navItems.map((item) => <ListItemButton key={item.key} selected={section === item.key} onClick={() => setSection(item.key)} sx={{ borderRadius: 3, mb: 0.75 }}><ListItemIcon sx={{ color: section === item.key ? 'secondary.main' : 'text.secondary' }}>{item.icon}</ListItemIcon><ListItemText primary={<Typography sx={{ fontWeight: 850, fontSize: 14 }}>{item.label}</Typography>} /></ListItemButton>)}</List><Box sx={{ p: 2 }}><Alert severity="warning" icon={<NotificationsActive />}>{pendingAlerts} pending requests</Alert></Box></Box>;

  return <ThemeProvider theme={adminTheme}><CssBaseline /><Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}><Drawer variant="permanent" sx={{ width: drawerWidth, display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, border: 0 } }}>{drawer}</Drawer><Box sx={{ flex: 1, minWidth: 0 }}><AppBar position="sticky" elevation={0} sx={{ bgcolor: 'rgba(8,8,8,0.86)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(239,68,68,0.18)' }}><Toolbar><Box sx={{ flex: 1 }}><Typography variant="h6" sx={{ fontWeight: 950 }}>Admin Panel</Typography><Typography variant="caption" color="text.secondary">Gujarati + English: સુરક્ષિત admin dashboard for trading operations</Typography></Box><Chip color="warning" icon={<NotificationsActive />} label={`${pendingAlerts} new`} sx={{ mr: 1 }} /><Button color="inherit" startIcon={<Logout />} onClick={() => { localStorage.removeItem('admin_token'); setToken(''); }}>Logout</Button></Toolbar></AppBar><Box component="main" sx={{ p: { xs: 2, md: 3 }, maxWidth: 1440, mx: 'auto' }}>{section === 'overview' && <Overview stats={stats} />}{section === 'users' && <UsersTable users={filteredUsers} page={page} rowsPerPage={rowsPerPage} search={search} setSearch={setSearch} setPage={setPage} setRowsPerPage={setRowsPerPage} setUsers={setUsers} />}{section === 'deposits' && <CardPanel title="Deposit Management"><DepositTable deposits={deposits} onApprove={approveDeposit} onReject={(id) => setDeposits((prev) => prev.map((item) => item.id === id ? { ...item, status: 'rejected' } : item))} onView={setDialogImage} /></CardPanel>}{section === 'withdrawals' && <CardPanel title="Withdraw Management"><WithdrawTable withdrawals={withdrawals} onReview={(id, status) => setWithdrawals((prev) => prev.map((item) => item.id === id ? { ...item, status } : item))} /></CardPanel>}{section === 'transactions' && <TransactionsTable transactions={transactions} transactionType={transactionType} setTransactionType={setTransactionType} />}{section === 'control' && <CardPanel title="Trading Control"><Box sx={{ display: 'grid', gap: 3 }}><Alert severity="info">Live round: AB-202602001 | Current timer: {timerDuration}s | Override: {manualOverride ? `Result ${forcedResult}` : 'Off'}</Alert><TextField label="Timer duration seconds" type="number" value={timerDuration} onChange={(event) => setTimerDuration(Number(event.target.value))} /><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Typography sx={{ fontWeight: 900 }}>Manual override option</Typography><Switch checked={manualOverride} onChange={(event) => setManualOverride(event.target.checked)} /></Box><FormControl><InputLabel>Force result</InputLabel><Select label="Force result" value={forcedResult} onChange={(event) => setForcedResult(event.target.value as 'A' | 'B')}><MenuItem value="A">Option A</MenuItem><MenuItem value="B">Option B</MenuItem></Select></FormControl><Button variant="contained" size="large">Save Game Control</Button><LinearProgress variant="determinate" value={(timerDuration % 30) * 3.33} /></Box></CardPanel>}</Box></Box></Box><Dialog open={!!dialogImage} onClose={() => setDialogImage('')} maxWidth="xs" fullWidth><DialogTitle>Payment Screenshot</DialogTitle><DialogContent><Box component="img" src={dialogImage} alt="Payment proof" sx={{ width: '100%', borderRadius: 3, bgcolor: 'white', p: 1 }} /></DialogContent><DialogActions><Button onClick={() => setDialogImage('')}>Close</Button></DialogActions></Dialog></ThemeProvider>;
};

const CardPanel: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => <Card sx={{ border: '1px solid rgba(239,68,68,0.22)' }}><CardContent><Typography variant="h6" sx={{ fontWeight: 950, mb: 2 }}>{title}</Typography>{children}</CardContent></Card>;

const Overview: React.FC<{ stats: { totalUsers: number; totalDeposits: number; totalWithdrawals: number; totalProfit: number } }> = ({ stats }) => {
  const cards = [['Total Users', stats.totalUsers, <People />], ['Total Deposits', `₹${stats.totalDeposits.toLocaleString()}`, <AccountBalanceWallet />], ['Total Withdrawals', `₹${stats.totalWithdrawals.toLocaleString()}`, <ReceiptLong />], ['Total Profit', `₹${stats.totalProfit.toLocaleString()}`, <Assessment />]];
  return <Box sx={{ display: 'grid', gap: 3 }}><Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' } }}>{cards.map(([label, value, icon]) => <Card key={String(label)} sx={{ border: '1px solid rgba(239,68,68,0.22)' }}><CardContent><Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><Box><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 900 }}>{label}</Typography><Typography variant="h4" sx={{ fontWeight: 950 }}>{value}</Typography></Box><Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar></Box></CardContent></Card>)}</Box><CardPanel title="Live Stats Chart"><Box sx={{ height: 220, display: 'flex', alignItems: 'end', gap: 1.5 }}>{chartData.map((value, index) => <Box key={index} sx={{ flex: 1, height: `${value}%`, borderRadius: '14px 14px 4px 4px', background: 'linear-gradient(180deg, #f59e0b, #ef4444)', boxShadow: '0 0 24px rgba(239,68,68,0.25)' }} />)}</Box></CardPanel></Box>;
};

const StatusChip: React.FC<{ status: ReviewStatus }> = ({ status }) => <Chip size="small" label={status} color={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'} sx={{ fontWeight: 900, textTransform: 'uppercase' }} />;

const UsersTable: React.FC<{ users: AdminUser[]; page: number; rowsPerPage: number; search: string; setSearch: (value: string) => void; setPage: (value: number) => void; setRowsPerPage: (value: number) => void; setUsers: React.Dispatch<React.SetStateAction<AdminUser[]>> }> = ({ users, page, rowsPerPage, search, setSearch, setPage, setRowsPerPage, setUsers }) => <CardPanel title="User Management"><Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}><TextField size="small" placeholder="Search user" value={search} onChange={(event) => setSearch(event.target.value)} /></Box><TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>User</TableCell><TableCell>Phone</TableCell><TableCell>Wallet</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => <TableRow key={user.id}><TableCell>{user.name}</TableCell><TableCell>{user.phone}</TableCell><TableCell>₹{user.walletBalance.toFixed(2)}</TableCell><TableCell><Chip size="small" color={user.status === 'active' ? 'success' : 'error'} label={user.status} /></TableCell><TableCell><Tooltip title="Edit"><IconButton color="warning"><Edit /></IconButton></Tooltip><Tooltip title="Delete"><IconButton color="error" onClick={() => setUsers((prev) => prev.filter((item) => item.id !== user.id))}><Delete /></IconButton></Tooltip></TableCell></TableRow>)}</TableBody></Table><TablePagination component="div" count={users.length} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, next) => setPage(next)} onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }} /></TableContainer></CardPanel>;

const DepositTable: React.FC<{ deposits: AdminDeposit[]; onApprove: (id: string) => void; onReject: (id: string) => void; onView: (image: string) => void }> = ({ deposits, onApprove, onReject, onView }) => <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>User</TableCell><TableCell>Amount</TableCell><TableCell>UTR</TableCell><TableCell>Screenshot</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{deposits.map((item) => <TableRow key={item.id}><TableCell>{item.userName}</TableCell><TableCell>₹{item.amount}</TableCell><TableCell>{item.utr}</TableCell><TableCell><Button size="small" startIcon={<Visibility />} onClick={() => onView(item.screenshot)}>View</Button></TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell><Button size="small" color="success" startIcon={<CheckCircle />} disabled={item.status !== 'pending'} onClick={() => onApprove(item.id)}>Approve</Button><Button size="small" color="error" startIcon={<Close />} disabled={item.status !== 'pending'} onClick={() => onReject(item.id)}>Reject</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>;

const WithdrawTable: React.FC<{ withdrawals: AdminWithdrawal[]; onReview: (id: string, status: ReviewStatus) => void }> = ({ withdrawals, onReview }) => <TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>User</TableCell><TableCell>Amount</TableCell><TableCell>Payout</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{withdrawals.map((item) => <TableRow key={item.id}><TableCell>{item.userName}</TableCell><TableCell>₹{item.amount}</TableCell><TableCell>{item.payout}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell><Button size="small" color="success" disabled={item.status !== 'pending'} onClick={() => onReview(item.id, 'approved')}>Approve</Button><Button size="small" color="error" disabled={item.status !== 'pending'} onClick={() => onReview(item.id, 'rejected')}>Reject</Button></TableCell></TableRow>)}</TableBody></Table></TableContainer>;

const TransactionsTable: React.FC<{ transactions: AdminTransaction[]; transactionType: 'all' | 'deposit' | 'withdraw'; setTransactionType: (value: 'all' | 'deposit' | 'withdraw') => void }> = ({ transactions, transactionType, setTransactionType }) => <CardPanel title="Transaction History"><Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}><FormControl size="small" sx={{ minWidth: 170 }}><InputLabel>Type</InputLabel><Select label="Type" value={transactionType} onChange={(event) => setTransactionType(event.target.value as 'all' | 'deposit' | 'withdraw')}><MenuItem value="all">All</MenuItem><MenuItem value="deposit">Deposit</MenuItem><MenuItem value="withdraw">Withdraw</MenuItem></Select></FormControl></Box><TableContainer component={Paper} variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Type</TableCell><TableCell>User</TableCell><TableCell>Amount</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead><TableBody>{transactions.map((item) => <TableRow key={item.id}><TableCell>{item.type}</TableCell><TableCell>{item.userName}</TableCell><TableCell>₹{item.amount}</TableCell><TableCell><StatusChip status={item.status} /></TableCell><TableCell>{item.createdAt}</TableCell></TableRow>)}</TableBody></Table></TableContainer></CardPanel>;