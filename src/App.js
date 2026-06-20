import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';
import './App.css';

// Simple SVG car icon that matches the dark aesthetic
const CarSVG = ({ warm }) => (
  <svg width="72" height="44" viewBox="0 0 72 44" fill="none" style={{opacity:0.75}}>
    <rect x="8" y="22" width="56" height="16" rx="4" fill={warm ? '#7c4a00' : '#0d3a4a'}/>
    <path d="M14 22 L20 10 L52 10 L58 22" fill={warm ? '#5c3500' : '#0a2a38'} stroke={warm?'#c47a00':'#00e6c8'} strokeWidth="1" strokeOpacity="0.4"/>
    <circle cx="19" cy="38" r="5" fill={warm?'#3d2800':'#04151e'} stroke={warm?'#c47a00':'#00e6c8'} strokeWidth="1.5" strokeOpacity="0.6"/>
    <circle cx="53" cy="38" r="5" fill={warm?'#3d2800':'#04151e'} stroke={warm?'#c47a00':'#00e6c8'} strokeWidth="1.5" strokeOpacity="0.6"/>
    <rect x="22" y="13" width="12" height="7" rx="1.5" fill={warm?'#7c4a00':'#003d54'} stroke={warm?'#f59e0b':'#00e6c8'} strokeWidth="0.8" strokeOpacity="0.5"/>
    <rect x="38" y="13" width="12" height="7" rx="1.5" fill={warm?'#7c4a00':'#003d54'} stroke={warm?'#f59e0b':'#00e6c8'} strokeWidth="0.8" strokeOpacity="0.5"/>
    <rect x="60" y="25" width="6" height="3" rx="1" fill={warm?'#fbbf24':'#00e6c8'} fillOpacity="0.5"/>
    <rect x="6" y="27" width="5" height="2.5" rx="1" fill={warm?'#ef4444':'#ff4f6d'} fillOpacity="0.6"/>
  </svg>
);

// Bar chart for earnings visualization
{/*const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const BARS = [0.4, 0.6, 0.35, 0.8, 0.55, 0.95, 0.7];*/}

function App() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [availableCars, setAvailableCars] = useState([]);
  const [myRentedCars, setMyRentedCars] = useState([]);
  const [myEarnings, setMyEarnings] = useState('0');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [activeTab, setActiveTab] = useState('browse');
  const [carModel, setCarModel] = useState('');
  const [rentalFee, setRentalFee] = useState('');

  const showStatus = (msg, type = 'success') => {
    setStatus({ msg, type });
    setTimeout(() => setStatus({ msg: '', type: '' }), 4000);
  };

  const loadAvailableCars = useCallback(async (contractInstance) => {
    try {
      const result = await contractInstance.methods.getAvailableCars().call();
      const cars = result.carIds.map((id, i) => ({
        carId: id.toString(),
        carModel: result.models[i],
        rentalFee: result.fees[i].toString(),
        owner: result.owners[i],
      }));
      setAvailableCars(cars);
    } catch (err) { console.error('Error loading cars:', err); }
  }, []);

  const loadMyRentedCars = useCallback(async (contractInstance, userAccount) => {
    try {
      const carCount = await contractInstance.methods.carCount().call();
      const rented = [];
      for (let i = 0; i < Number(carCount); i++) {
        const car = await contractInstance.methods.cars(i).call();
        if (car.renter.toLowerCase() === userAccount.toLowerCase()) {
          rented.push({
            carId: car.carId.toString(),
            carModel: car.carModel,
            rentalFee: car.rentalFee.toString(),
            owner: car.owner,
          });
        }
      }
      setMyRentedCars(rented);
    } catch (err) { console.error('Error loading rented cars:', err); }
  }, []);

  const loadEarnings = useCallback(async (contractInstance, userAccount) => {
    try {
      const earnings = await contractInstance.methods.ownerEarnings(userAccount).call();
      setMyEarnings(earnings.toString());
    } catch (err) { console.error('Error loading earnings:', err); }
  }, []);

  const refreshAll = useCallback(async (contractInstance, userAccount) => {
    await Promise.all([
      loadAvailableCars(contractInstance),
      loadMyRentedCars(contractInstance, userAccount),
      loadEarnings(contractInstance, userAccount),
    ]);
  }, [loadAvailableCars, loadMyRentedCars, loadEarnings]);

  const connectWallet = async () => {
    if (!window.ethereum) { showStatus('MetaMask not found. Please install it.', 'error'); return; }
    try {
      setLoading(true);
      const w3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await w3.eth.getAccounts();
      const contractInstance = new w3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      setWeb3(w3); setAccount(accounts[0]); setContract(contractInstance);
      await refreshAll(contractInstance, accounts[0]);
      showStatus('Wallet connected!', 'success');
    } catch (err) {
      showStatus('Failed to connect: ' + err.message, 'error');
    } finally { setLoading(false); }
  };

  const registerCar = async () => {
    if (!carModel || !rentalFee) { showStatus('Please fill in all fields.', 'error'); return; }
    try {
      setLoading(true);
      const feeInWei = web3.utils.toWei(rentalFee, 'ether');
      await contract.methods.registerCar(carModel, feeInWei).send({ from: account });
      showStatus(`"${carModel}" listed successfully!`, 'success');
      setCarModel(''); setRentalFee('');
      await refreshAll(contract, account);
    } catch (err) {
      showStatus('Error: ' + (err.message || 'Transaction failed'), 'error');
    } finally { setLoading(false); }
  };

  const rentCar = async (carId, rentalFee) => {
    try {
      setLoading(true);
      await contract.methods.rentCar(carId).send({ from: account, value: rentalFee });
      showStatus('Car rented successfully!', 'success');
      await refreshAll(contract, account);
    } catch (err) {
      showStatus('Error: ' + (err.message || 'Transaction failed'), 'error');
    } finally { setLoading(false); }
  };

  const returnCar = async (carId) => {
    try {
      setLoading(true);
      await contract.methods.returnCar(carId).send({ from: account });
      showStatus('Car returned successfully!', 'success');
      await refreshAll(contract, account);
    } catch (err) {
      showStatus('Error: ' + (err.message || 'Transaction failed'), 'error');
    } finally { setLoading(false); }
  };

  const withdrawEarnings = async () => {
    try {
      setLoading(true);
      await contract.methods.withdrawEarnings().send({ from: account });
      showStatus('Earnings withdrawn!', 'success');
      await loadEarnings(contract, account);
    } catch (err) {
      showStatus('Error: ' + (err.message || 'Transaction failed'), 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) refreshAll(contract, accounts[0]);
        } else { setAccount(''); setContract(null); }
      });
    }
  }, [contract, refreshAll]);

  const formatEth = (wei) => {
    if (!web3 || !wei || wei === '0') return '0.0000';
    return parseFloat(web3.utils.fromWei(wei, 'ether')).toFixed(4);
  };

  const shortAddr = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';

  const PAGE_TITLES = {
    browse: 'Explore Fleet',
    register: 'Add Vehicle',
    rented: 'My Rentals',
    earnings: 'Financial Overview',
  };

  const NAV = [
    { key: 'browse', icon: '🔍', label: 'Explore' },
    { key: 'register', icon: '✚', label: 'Add Vehicle' },
    { key: 'rented', icon: '🚘', label: 'My Rentals', count: myRentedCars.length },
    { key: 'earnings', icon: '💳', label: 'Earnings' },
  ];

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚗</div>
          <div>
            <div className="sidebar-logo-text">CarRentalDApp</div>
            <span className="sidebar-logo-sub">Decentralized Fleet</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <button
              key={n.key}
              className={`nav-item${activeTab === n.key ? ' active' : ''}`}
              onClick={() => setActiveTab(n.key)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.count > 0 && <span className="nav-badge">{n.count}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {account ? (
            <div className="wallet-pill">
              <div className="wallet-avatar">🦊</div>
              <div className="wallet-text">
                <span className="wallet-addr">{shortAddr(account)}</span>
                <span className="wallet-label">Verified Owner</span>
              </div>
            </div>
          ) : (
            <button className="connect-btn-sidebar" onClick={connectWallet} disabled={loading}>
              {loading ? '⏳ Connecting…' : '🔗 Connect Wallet'}
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title">{PAGE_TITLES[activeTab]}</span>
          <div className="topbar-right">
            {account && (
              <div className="network-badge">
                <span className="network-dot" />
                Mainnet Connected
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {status.msg && (
          <div className={`toast toast-${status.type}`}>{status.msg}</div>
        )}

        {/* Connect Screen */}
        {!account ? (
          <div className="connect-screen">
            <div className="connect-hero">
              <div className="connect-hero-gfx">🚗</div>
              <h2>Rent or List on the Blockchain</h2>
              <p>
                Connect your MetaMask wallet to browse available cars, list your own vehicle,
                and manage your decentralized rental portfolio.
              </p>
              <button className="btn btn-primary btn-lg" onClick={connectWallet} disabled={loading}>
                {loading ? '⏳ Connecting…' : '🔗 Connect MetaMask'}
              </button>
            </div>
          </div>
        ) : (
          <div className="page-body">

            {/* ── Browse ── */}
            {activeTab === 'browse' && (
              <>
                <div className="page-header">
                  <div className="page-header-left">
                    <h1>Available Vehicles</h1>
                    <p>All transactions are secured via smart contracts.</p>
                  </div>
                </div>
                   
                <div className="stats-row">
                  <div className="stat-card">
                    <div className="stat-label">Available</div>
                    <div className="stat-value cyan">{availableCars.length}</div>
                    <div className="stat-sub">cars listed</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">My Rentals</div>
                    <div className="stat-value purple">{myRentedCars.length}</div>
                    <div className="stat-sub">active</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Earnings</div>
                    <div className="stat-value cyan">{formatEth(myEarnings)}</div>
                    <div className="stat-sub">ETH pending</div>
                  </div>
                </div>

                {availableCars.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">🚫</span>
                    <h3>No vehicles available</h3>
                    <p>No cars are listed right now. Check back later or list your own.</p>
                  </div>
                ) : (
                  <div className="car-grid">
                    {availableCars.map(car => (
                      <div className="car-card" key={car.carId}>
                        <div className="car-card-img">
                          <CarSVG />
                        </div>
                        <div className="car-card-body">
                          <div className="car-card-top">
                            <span className="car-name">{car.carModel}</span>
                            <span className="badge badge-available"><span className="badge-dot"/>Available</span>
                          </div>
                          <div className="car-meta">
                            <div className="car-meta-row">
                              <span className="meta-key">Rental Fee</span>
                              <span className="meta-val eth">{formatEth(car.rentalFee)} ETH</span>
                            </div>
                            <div className="car-meta-row">
                              <span className="meta-key">Smart Contract</span>
                              <span className="meta-val addr">{shortAddr(car.owner)}</span>
                            </div>
                            <div className="car-meta-row">
                              <span className="meta-key">Car ID</span>
                              <span className="meta-val">#{car.carId}</span>
                            </div>
                          </div>
                          {car.owner.toLowerCase() !== account.toLowerCase() ? (
                            <button
                              className="btn btn-primary btn-full"
                              onClick={() => rentCar(car.carId, car.rentalFee)}
                              disabled={loading}
                            >
                              🚗 Rent for {formatEth(car.rentalFee)} ETH
                            </button>
                          ) : (
                            <div className="btn-muted">Your Vehicle</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── List ── */}
            {activeTab === 'register' && (
              <>
                <div className="page-header">
                  <div className="page-header-left">
                    <h1>Add a Vehicle</h1>
                    <p>Tokenize your asset and start earning decentralized yield.</p>
                  </div>
                </div>
                <div className="form-panel">
                  <div className="form-card">
                    <div className="form-group">
                      <label className="form-label">Car Model</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Tesla Model S Plaid 2024"
                        value={carModel}
                        onChange={e => setCarModel(e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Daily Fee (ETH)</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="0.05"
                          step="0.001"
                          min="0"
                          value={rentalFee}
                          onChange={e => setRentalFee(e.target.value)}
                        />
                        <span className="form-hint">One-time rental payment renters will pay.</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-lg btn-full"
                      onClick={registerCar}
                      disabled={loading || !carModel || !rentalFee}
                    >
                      {loading ? '⏳ Registering…' : ' Register Car'}
                    </button>
                  </div>

                  <div className="side-panel">
                    <div className="side-panel-title">Listing Security</div>
                    <div className="security-item">
                      <div className="security-icon">🛡</div>
                      <div className="security-text">
                        <h4>Smart Contract Escrow</h4>
                        <p>Your rental contract is secured by immutable blockchain code.</p>
                      </div>
                    </div>
                    <div className="security-item">
                      <div className="security-icon">⚡</div>
                      <div className="security-text">
                        <h4>Instant Settlement</h4>
                        <p>Earnings transfer automatically to your wallet when returned.</p>
                      </div>
                    </div>
                    <div className="preview-card">
                      <div className="side-panel-title">Live Preview</div>
                      <div className="preview-inner">
                        <div>
                          <div className="preview-label">Vehicle</div>
                          <div style={{fontWeight:600,fontSize:'0.9rem'}}>{carModel || '—'}</div>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <div className="preview-label">Estimated Daily</div>
                          <div className="preview-val">{rentalFee ? `${rentalFee} ETH` : '— ETH'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── My Rentals ── */}
            {activeTab === 'rented' && (
              <>
                <div className="page-header">
                  <div className="page-header-left">
                    <h1>My Rentals</h1>
                    <p>Manage your active fleet. All transactions secured via smart contracts.</p>
                  </div>
                  {myRentedCars.length > 0 && (
                    <div className="network-badge">
                      ⏱ Active: {myRentedCars.length} {myRentedCars.length === 1 ? 'Car' : 'Cars'}
                    </div>
                  )}
                </div>
                {myRentedCars.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-state-icon">📋</span>
                    <h3>No active rentals</h3>
                    <p>You haven't rented any cars yet. Explore the fleet to get started.</p>
                  </div>
                ) : (
                  <div className="car-grid">
                    {myRentedCars.map(car => (
                      <div className="car-card rented-card" key={car.carId}>
                        <div className="car-card-img warm-bg">
                          <CarSVG warm />
                        </div>
                        <div className="car-card-body">
                          <div className="car-card-top">
                            <span className="car-name">{car.carModel}</span>
                            <span className="badge badge-rented"><span className="badge-dot"/>Rented</span>
                          </div>
                          <div className="car-meta">
                            <div className="car-meta-row">
                              <span className="meta-key">Paid</span>
                              <span className="meta-val eth">{formatEth(car.rentalFee)} ETH</span>
                            </div>
                            <div className="car-meta-row">
                              <span className="meta-key">Smart Contract</span>
                              <span className="meta-val addr">{shortAddr(car.owner)}</span>
                            </div>
                            <div className="car-meta-row">
                              <span className="meta-key">Car ID</span>
                              <span className="meta-val">#{car.carId}</span>
                            </div>
                          </div>
                          <button
                            className="btn btn-danger btn-full"
                            onClick={() => returnCar(car.carId)}
                            disabled={loading}
                          >
                            ↩ Return Car
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── Earnings ── */}
            {activeTab === 'earnings' && (
              <>
                <div className="page-header">
                  <div className="page-header-left">
                    <h1>Financial Overview</h1>
                    <p>Manage your decentralized car rental revenue and withdrawals.</p>
                  </div>
                  <div className="network-badge">
                    <span className="network-dot" />
                    Network: Ethereum Mainnet
                  </div>
                </div>
                <div className="earnings-layout">
                  <div className="earnings-card">
                    <div className="earnings-amount-label">Total Earnings</div>
                    <div className="earnings-amount-value">{formatEth(myEarnings)}</div>
                    <div className="earnings-amount-sub">ETH in your rental pool</div>
                  </div>

                  <div className="earnings-side">
                    <div className="withdraw-card">
                      <div className="withdraw-title">Pending Withdrawal</div>
                      <div className="withdraw-amount">{formatEth(myEarnings)} ETH</div>
                      <div className="withdraw-ready">
                        {myEarnings !== '0' ? '✓ Ready to settle' : 'No earnings yet'}
                      </div>
                      <button
                        className="btn btn-primary btn-full"
                        onClick={withdrawEarnings}
                        disabled={loading || myEarnings === '0'}
                      >
                        {loading ? '⏳ Withdrawing…' : '💳 Withdraw to Wallet'}
                      </button>
                    </div>

                    <div className="withdraw-card">
                      <div className="withdraw-title">Active Fleet</div>
                      <div style={{display:'flex',alignItems:'center',gap:12,marginTop:8}}>
                        <span style={{fontSize:'2rem'}}>🚗</span>
                        <div>
                          <div style={{fontWeight:700,fontSize:'1.1rem'}}>{availableCars.length} Cars Listed</div>
                          <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:3}}>
                            {myRentedCars.length} currently rented out
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default App;