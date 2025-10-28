import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPurchaseHistory, getPurchaseStats, clearPurchaseHistory, type PurchaseRecord, type SaleRecord } from '../../services/purchaseHistory';
import { commerceAPI, modelsAPI } from '../../services/api';
import BundleCreationModal from './BundleCreationModal';

interface DashboardModalProps {
  show: boolean;
  onClose: () => void;
  user?: any;
}

const DashboardModal: React.FC<DashboardModalProps> = ({ show, onClose, user: propUser }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const user = propUser || authUser;
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'sales' | 'analytics' | 'payouts'>('overview');
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    totalSales: 0,
    totalEarned: 0,
    activeSales: 0,
    recentPurchases: [] as PurchaseRecord[],
    recentSales: [] as SaleRecord[]
  });
  const [loading, setLoading] = useState(true);
  const [showBundleModal, setShowBundleModal] = useState(false);

  useEffect(() => {
    if (user && show) {
      loadUserData();
    }
  }, [user, show]);

  const loadUserData = () => {
    if (!user) return;

    setLoading(true);
    try {
      const userHistory = getUserPurchaseHistory(user.id.toString());
      const userStats = getPurchaseStats(user.id.toString());
      
      setPurchases(userHistory.purchases);
      setSales(userHistory.sales);
      setStats(userStats);
      
      console.log('Loaded user dashboard data:', { userHistory, userStats });
    } catch (error) {
      console.error('Error loading user dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge status-success">{status}</span>;
      case 'pending':
        return <span className="status-badge status-warning">{status}</span>;
      case 'refunded':
        return <span className="status-badge status-danger">{status}</span>;
      case 'active':
        return <span className="status-badge status-info">{status}</span>;
      case 'sold':
        return <span className="status-badge status-success">{status}</span>;
      case 'inactive':
        return <span className="status-badge status-secondary">{status}</span>;
      default:
        return <span className="status-badge status-light">{status}</span>;
    }
  };

  // Dashboard Action Handlers
  const handleUploadDesign = () => {
    console.log('📂 Opening file upload dialog...');
    onClose();
    
    // Trigger the main page file upload by dispatching a custom event
    window.dispatchEvent(new CustomEvent('triggerFileUpload'));
  };

  const handleViewAnalytics = () => {
    console.log('📊 Switching to analytics tab...');
    setActiveTab('analytics');
  };

  const handleRequestPayout = async () => {
    console.log('💰 Requesting payout...');
    try {
      const payoutData = {
        amount: stats.totalEarned + 150.75,
        method: 'paypal',
        netAmount: (stats.totalEarned + 150.75) * 0.97 // 3% fee
      };
      
      const result = await commerceAPI.payouts.request(payoutData);
      console.log('✅ Payout requested successfully:', result);
      setActiveTab('payouts');
      // Refresh payout data here
    } catch (error) {
      console.error('❌ Payout request failed:', error);
    }
  };

  const handleManageStore = () => {
    console.log('🏪 Switching to sales tab for store management...');
    setActiveTab('sales');
  };

  const handleBrowseStore = () => {
    console.log('🛍️ Navigating to store...');
    onClose();
    
    // Trigger store view on main page
    window.dispatchEvent(new CustomEvent('switchToStore'));
  };

  const handleListFirstItem = () => {
    console.log('📋 Opening file upload to list first item...');
    onClose();
    
    // Trigger the main page file upload by dispatching a custom event
    window.dispatchEvent(new CustomEvent('triggerFileUpload'));
  };

  const handleViewPurchaseDetails = (purchase: PurchaseRecord) => {
    console.log('🔍 Viewing purchase details:', purchase.id);
    // Could open a detailed modal or navigate to a details page
  };

  const handleDownloadPurchase = (purchase: PurchaseRecord) => {
    console.log('⬇️ Downloading purchase:', purchase.id);
    // Implement download logic
  };

  const handlePurchaseSupport = (purchase: PurchaseRecord) => {
    console.log('🎧 Opening support for purchase:', purchase.id);
    // Could open a support ticket modal
  };

  const handleEditListing = (sale: SaleRecord) => {
    console.log('✏️ Editing listing:', sale.id);
    // Open edit modal or navigate to edit page
  };

  const handleViewSalesAnalytics = (sale: SaleRecord) => {
    console.log('📈 Viewing analytics for sale:', sale.id);
    // Switch to analytics with focus on this item
    setActiveTab('analytics');
  };

  const handlePromoteListing = (sale: SaleRecord) => {
    console.log('📢 Promoting listing:', sale.id);
    // Open promotion tools
  };

  const handleUpdatePayoutSettings = () => {
    console.log('⚙️ Opening payout settings...');
    // Open settings modal
  };

  const handleAddPaymentMethod = () => {
    console.log('💳 Adding new payment method...');
    // Open payment method modal
  };

  const handleCreateBundle = () => {
    console.log('📦 Opening bundle creation modal...');
    setShowBundleModal(true);
  };

  const handleBundleCreated = (bundle: any) => {
    console.log('✅ Bundle created successfully:', bundle);
    // Refresh sales data or update UI as needed
    // Could add to sales list or refresh from API
  };

  const handleToolAction = (toolName: string) => {
    console.log(`🔧 ${toolName} tool clicked`);
    
    switch (toolName) {
      case 'Upload Models':
        handleUploadDesign();
        break;
      case 'Price Manager':
        console.log('💰 Price Manager tool - not yet implemented');
        break;
      case 'Performance Tracker':
        handleViewAnalytics();
        break;
      case 'Promotion Center':
        console.log('📢 Promotion Center - not yet implemented');
        break;
      case 'Customer Analytics':
        handleViewAnalytics();
        break;
      case 'Review Manager':
        console.log('⭐ Review Manager - not yet implemented');
        break;
      case '3D Preview Tools':
        console.log('🎮 3D Preview Tools - not yet implemented');
        break;
      case 'Material Editor':
        console.log('🎨 Material Editor - not yet implemented');
        break;
      default:
        console.log(`Tool "${toolName}" not yet implemented`);
    }
  };

  if (!user) {
    return (
      <Modal show={show} onHide={onClose} size="lg" centered className="dashboard-modal">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title className="text-white">
            <i className="fas fa-tachometer-alt me-2"></i>
            Dashboard
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-dark text-center py-5">
          <div className="auth-required">
            <i className="fas fa-lock fa-3x text-primary mb-3"></i>
            <h4 className="text-white mb-3">Authentication Required</h4>
            <p className="text-light">Please log in to access your dashboard and view your purchase and sales history.</p>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  return (
    <>
      <style>
        {`
          .dashboard-modal .modal-content {
            background: linear-gradient(135deg, #0f1419 0%, #1a202c 100%);
            border: 1px solid #2d3748;
            border-radius: 16px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          }
          
          .dashboard-modal .modal-header-dark {
            background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
            border-bottom: 1px solid #2d3748;
            border-radius: 16px 16px 0 0;
            padding: 1.5rem;
          }
          
          .dashboard-modal .modal-body-dark {
            background: transparent;
            color: #e2e8f0;
            padding: 0;
          }
          
          .dashboard-modal .nav-tabs {
            background: rgba(26, 32, 44, 0.8);
            border-bottom: 2px solid #2d3748;
            padding: 1rem 1.5rem 0;
            margin: 0;
          }
          
          .dashboard-modal .nav-tabs .nav-link {
            background: transparent;
            border: none;
            color: #a0aec0;
            font-weight: 600;
            padding: 1rem 1.5rem;
            margin: 0 0.25rem;
            border-radius: 12px 12px 0 0;
            transition: all 0.3s ease;
            position: relative;
          }
          
          .dashboard-modal .nav-tabs .nav-link:hover {
            color: #e2e8f0;
            background: rgba(74, 85, 104, 0.3);
            transform: translateY(-2px);
          }
          
          .dashboard-modal .nav-tabs .nav-link.active {
            color: #ffffff;
            background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
            box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
          }
          
          .dashboard-modal .tab-content {
            padding: 2rem;
            max-height: 70vh;
            overflow-y: auto;
            background: linear-gradient(to bottom, rgba(15, 20, 25, 0.95) 0%, rgba(26, 32, 44, 0.95) 100%);
          }
          
          .dashboard-modal .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          
          .dashboard-modal .stat-card {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
          }
          
          .dashboard-modal .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--gradient);
          }
          
          .dashboard-modal .stat-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: rgba(255, 255, 255, 0.2);
          }
          
          .dashboard-modal .stat-card.purchases {
            --gradient: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          }
          
          .dashboard-modal .stat-card.spending {
            --gradient: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
          }
          
          .dashboard-modal .stat-card.sales {
            --gradient: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
          }
          
          .dashboard-modal .stat-card.earnings {
            --gradient: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%);
          }
          
          .dashboard-modal .stat-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #4a5568;
          }
          
          .dashboard-modal .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 0.5rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .dashboard-modal .stat-label {
            font-size: 0.9rem;
            color: #a0aec0;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .dashboard-modal .stat-change {
            font-size: 0.8rem;
            margin-top: 0.5rem;
            color: #48bb78;
          }
          
          .dashboard-modal .content-card {
            background: rgba(26, 32, 44, 0.8);
            border: 1px solid #2d3748;
            border-radius: 16px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            backdrop-filter: blur(10px);
          }
          
          .dashboard-modal .content-card h5 {
            color: #e2e8f0;
            margin-bottom: 1.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .dashboard-modal .table-dark {
            background: transparent;
            color: #e2e8f0;
          }
          
          .dashboard-modal .table-dark thead th {
            background: rgba(45, 55, 72, 0.8);
            border-color: #2d3748;
            color: #e2e8f0;
            font-weight: 600;
            padding: 1rem;
          }
          
          .dashboard-modal .table-dark tbody td {
            border-color: #2d3748;
            padding: 1rem;
            color: #cbd5e0;
          }
          
          .dashboard-modal .table-dark tbody tr:hover {
            background: rgba(45, 55, 72, 0.5);
          }
          
          .dashboard-modal .status-badge {
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .dashboard-modal .status-success {
            background: rgba(72, 187, 120, 0.2);
            color: #48bb78;
            border: 1px solid rgba(72, 187, 120, 0.3);
          }
          
          .dashboard-modal .status-warning {
            background: rgba(237, 137, 54, 0.2);
            color: #ed8936;
            border: 1px solid rgba(237, 137, 54, 0.3);
          }
          
          .dashboard-modal .status-danger {
            background: rgba(245, 101, 101, 0.2);
            color: #f56565;
            border: 1px solid rgba(245, 101, 101, 0.3);
          }
          
          .dashboard-modal .status-info {
            background: rgba(66, 153, 225, 0.2);
            color: #4299e1;
            border: 1px solid rgba(66, 153, 225, 0.3);
          }
          
          .dashboard-modal .status-secondary {
            background: rgba(160, 174, 192, 0.2);
            color: #a0aec0;
            border: 1px solid rgba(160, 174, 192, 0.3);
          }
          
          .dashboard-modal .empty-state {
            text-align: center;
            padding: 3rem;
            color: #a0aec0;
          }
          
          .dashboard-modal .empty-state i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #4a5568;
          }
          
          .dashboard-modal .btn-primary-custom {
            background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
            border: none;
            border-radius: 12px;
            padding: 0.75rem 1.5rem;
            font-weight: 600;
            color: white;
            transition: all 0.3s ease;
          }
          
          .dashboard-modal .btn-primary-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(49, 130, 206, 0.3);
          }
          
          .dashboard-modal .btn-outline-custom {
            background: transparent;
            border: 2px solid #4a5568;
            border-radius: 12px;
            padding: 0.5rem 1rem;
            color: #e2e8f0;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .dashboard-modal .btn-outline-custom:hover {
            border-color: #3182ce;
            color: #3182ce;
            background: rgba(49, 130, 206, 0.1);
          }
          
          .dashboard-modal .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #2d3748;
          }
          
          .dashboard-modal .metric-row:last-child {
            border-bottom: none;
          }
          
          .dashboard-modal .metric-label {
            color: #a0aec0;
            font-weight: 500;
          }
          
          .dashboard-modal .metric-value {
            color: #e2e8f0;
            font-weight: 700;
          }
          
          .dashboard-modal .progress-bar {
            height: 8px;
            background: rgba(45, 55, 72, 0.8);
            border-radius: 4px;
            overflow: hidden;
            margin: 0.5rem 0;
          }
          
          .dashboard-modal .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          
          .dashboard-modal .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
          }
          
          .dashboard-modal .tool-card {
            background: rgba(45, 55, 72, 0.6);
            border: 1px solid #4a5568;
            border-radius: 12px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .dashboard-modal .tool-card:hover {
            transform: translateY(-4px);
            border-color: #3182ce;
            background: rgba(49, 130, 206, 0.1);
          }
          
          .dashboard-modal .tool-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #3182ce;
          }
          
          .dashboard-modal .tool-title {
            color: #e2e8f0;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .dashboard-modal .tool-description {
            color: #a0aec0;
            font-size: 0.85rem;
          }
          
          .dashboard-modal .btn-outline-custom.btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
          }

          .dashboard-modal .empty-state {
            text-align: center;
            padding: 3rem 1.5rem;
            color: #a0aec0;
          }
          .dashboard-modal .empty-state i {
            font-size: 3rem;
            color: #4a5568;
            margin-bottom: 1rem;
          }
          .dashboard-modal .empty-state h6 {
            color: #e2e8f0;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }

          .dashboard-modal .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
          }
          .dashboard-modal .tool-card {
            padding: 1.5rem;
            background: linear-gradient(135deg, rgba(49, 130, 206, 0.1) 0%, rgba(79, 209, 197, 0.05) 100%);
            border: 1px solid rgba(79, 209, 197, 0.2);
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
            text-align: center;
          }
          .dashboard-modal .tool-card:hover {
            transform: translateY(-2px);
            background: linear-gradient(135deg, rgba(49, 130, 206, 0.15) 0%, rgba(79, 209, 197, 0.1) 100%);
            border-color: rgba(79, 209, 197, 0.4);
            box-shadow: 0 8px 25px rgba(79, 209, 197, 0.15);
          }
          .dashboard-modal .tool-icon {
            font-size: 2rem;
            color: #4fd1c5;
            margin-bottom: 0.75rem;
          }
          .dashboard-modal .tool-title {
            font-weight: 600;
            color: #e2e8f0;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
          }
          .dashboard-modal .tool-description {
            color: #a0aec0;
            font-size: 0.9rem;
            line-height: 1.4;
          }

          .dashboard-modal .progress-bar {
            width: 100%;
            height: 4px;
            background: rgba(79, 209, 197, 0.1);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 0.5rem;
          }
          .dashboard-modal .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4fd1c5, #38b2ac);
            transition: width 0.8s ease;
          }

          .dashboard-modal .text-success { color: #48bb78 !important; }
          .dashboard-modal .text-info { color: #4299e1 !important; }
          .dashboard-modal .text-warning { color: #ed8936 !important; }
          .dashboard-modal .text-danger { color: #f56565 !important; }
          .dashboard-modal .text-primary { color: #4fd1c5 !important; }
        `}
      </style>
      
      <Modal show={show} onHide={onClose} size="xl" centered className="dashboard-modal">
        <Modal.Header closeButton className="modal-header-dark">
          <Modal.Title>
            <i className="fas fa-tachometer-alt me-2"></i>
            {user.firstName || user.name}'s Dashboard
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="modal-body-dark">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="mt-3 text-white">Loading your dashboard...</h5>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="fas fa-chart-line me-2"></i>
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'purchases' ? 'active' : ''}`}
                    onClick={() => setActiveTab('purchases')}
                  >
                    <i className="fas fa-shopping-cart me-2"></i>
                    Purchases ({stats.totalPurchases})
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                  >
                    <i className="fas fa-store me-2"></i>
                    Sales & Tools
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Analytics
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'payouts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('payouts')}
                  >
                    <i className="fas fa-money-bill-wave me-2"></i>
                    Payouts
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div>
                    {/* Stats Grid */}
                    <div className="stats-grid">
                      <div className="stat-card purchases">
                        <i className="fas fa-shopping-bag stat-icon"></i>
                        <div className="stat-value">{stats.totalPurchases}</div>
                        <div className="stat-label">Total Purchases</div>
                        <div className="stat-change">
                          <i className="fas fa-arrow-up me-1"></i>
                          +12% this month
                        </div>
                      </div>
                      <div className="stat-card spending">
                        <i className="fas fa-dollar-sign stat-icon"></i>
                        <div className="stat-value">{formatPrice(stats.totalSpent)}</div>
                        <div className="stat-label">Total Spent</div>
                        <div className="stat-change">
                          <i className="fas fa-arrow-up me-1"></i>
                          +5% this month
                        </div>
                      </div>
                      <div className="stat-card sales">
                        <i className="fas fa-chart-line stat-icon"></i>
                        <div className="stat-value">{stats.totalSales}</div>
                        <div className="stat-label">Items Sold</div>
                        <div className="stat-change">
                          <i className="fas fa-arrow-up me-1"></i>
                          +25% this month
                        </div>
                      </div>
                      <div className="stat-card earnings">
                        <i className="fas fa-coins stat-icon"></i>
                        <div className="stat-value">{formatPrice(stats.totalEarned)}</div>
                        <div className="stat-label">Total Earned</div>
                        <div className="stat-change">
                          <i className="fas fa-arrow-up me-1"></i>
                          +18% this month
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="row">
                      <div className="col-lg-6">
                        <div className="content-card">
                          <h5>
                            <i className="fas fa-shopping-cart text-primary"></i>
                            Recent Purchases
                          </h5>
                          {stats.recentPurchases.length === 0 ? (
                            <div className="empty-state">
                              <i className="fas fa-shopping-cart"></i>
                              <h6>No purchases yet</h6>
                              <p>Start shopping to see your purchase history here.</p>
                            </div>
                          ) : (
                            stats.recentPurchases.map((purchase) => (
                              <div key={purchase.id} className="metric-row">
                                <div>
                                  <div className="metric-label">{purchase.items.length} item(s)</div>
                                  <small style={{ color: '#718096' }}>
                                    {formatDate(purchase.purchaseDate)}
                                  </small>
                                </div>
                                <div className="text-end">
                                  <div className="metric-value text-success">{formatPrice(purchase.total)}</div>
                                  {getStatusBadge(purchase.status)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="content-card">
                          <h5>
                            <i className="fas fa-chart-line text-warning"></i>
                            Recent Sales Activity
                          </h5>
                          {stats.recentSales.length === 0 ? (
                            <div className="empty-state">
                              <i className="fas fa-store"></i>
                              <h6>No sales yet</h6>
                              <p>List your first item to start selling and earning.</p>
                            </div>
                          ) : (
                            stats.recentSales.map((sale) => (
                              <div key={sale.id} className="metric-row">
                                <div>
                                  <div className="metric-label">{sale.item.name}</div>
                                  <small style={{ color: '#718096' }}>
                                    {formatDate(sale.saleDate)}
                                  </small>
                                </div>
                                <div className="text-end">
                                  <div className="metric-value text-warning">{formatPrice(sale.salePrice)}</div>
                                  {getStatusBadge(sale.status)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="content-card">
                      <h5>
                        <i className="fas fa-bolt text-info"></i>
                        Quick Actions
                      </h5>
                      <div className="tool-grid">
                        <div className="tool-card" onClick={handleUploadDesign}>
                          <i className="fas fa-upload tool-icon"></i>
                          <div className="tool-title">Upload Design</div>
                          <div className="tool-description">Add new 3D models to sell</div>
                        </div>
                        <div className="tool-card" onClick={handleCreateBundle}>
                          <i className="fas fa-box tool-icon"></i>
                          <div className="tool-title">Create Bundle</div>
                          <div className="tool-description">Bundle designs for better sales</div>
                        </div>
                        <div className="tool-card" onClick={handleViewAnalytics}>
                          <i className="fas fa-chart-pie tool-icon"></i>
                          <div className="tool-title">View Analytics</div>
                          <div className="tool-description">Track your performance</div>
                        </div>
                        <div className="tool-card" onClick={handleRequestPayout}>
                          <i className="fas fa-money-bill-wave tool-icon"></i>
                          <div className="tool-title">Request Payout</div>
                          <div className="tool-description">Withdraw your earnings</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'purchases' && (
                  <div>
                    <div className="content-card">
                      <h5>
                        <i className="fas fa-shopping-cart text-primary"></i>
                        Purchase History & Management
                      </h5>
                      
                      {purchases.length === 0 ? (
                        <div className="empty-state">
                          <i className="fas fa-shopping-cart"></i>
                          <h6>No purchases yet</h6>
                          <p>Your purchase history will appear here after you buy something from the store.</p>
                          <button className="btn btn-primary-custom mt-3" onClick={handleBrowseStore}>
                            <i className="fas fa-store me-2"></i>
                            Browse Store
                          </button>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-dark table-hover">
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Items</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchases.map((purchase) => (
                                <tr key={purchase.id}>
                                  <td>
                                    <code style={{ color: '#3182ce', fontSize: '0.85rem' }}>
                                      #{purchase.id.slice(-8)}
                                    </code>
                                  </td>
                                  <td>
                                    <div>
                                      {purchase.items.map((item, index) => (
                                        <div key={index} className="small">
                                          <strong>{item.name}</strong> × {item.quantity}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="small">
                                    {formatDate(purchase.purchaseDate)}
                                  </td>
                                  <td>
                                    <strong style={{ color: '#48bb78' }}>{formatPrice(purchase.total)}</strong>
                                    <br />
                                    <small style={{ color: '#a0aec0' }}>
                                      Tax: {formatPrice(purchase.tax)}
                                    </small>
                                  </td>
                                  <td>{getStatusBadge(purchase.status)}</td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <button 
                                        className="btn btn-outline-custom btn-sm" 
                                        title="View Details"
                                        onClick={() => handleViewPurchaseDetails(purchase)}
                                      >
                                        <i className="fas fa-eye"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-custom btn-sm" 
                                        title="Download"
                                        onClick={() => handleDownloadPurchase(purchase)}
                                      >
                                        <i className="fas fa-download"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-custom btn-sm" 
                                        title="Support"
                                        onClick={() => handlePurchaseSupport(purchase)}
                                      >
                                        <i className="fas fa-question-circle"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'sales' && (
                  <div>
                    {/* Sales Tools Grid */}
                    <div className="content-card mb-4">
                      <h5>
                        <i className="fas fa-tools text-warning"></i>
                        3D Marketplace Tools
                      </h5>
                      <div className="tool-grid">
                        <div className="tool-card" onClick={() => handleToolAction('Upload Models')}>
                          <i className="fas fa-upload tool-icon"></i>
                          <div className="tool-title">Upload Models</div>
                          <div className="tool-description">Add new 3D designs to your store</div>
                        </div>
                        <div className="tool-card" onClick={handleCreateBundle}>
                          <i className="fas fa-box tool-icon"></i>
                          <div className="tool-title">Create Bundle</div>
                          <div className="tool-description">Bundle multiple designs for better value</div>
                        </div>
                        <div className="tool-card" onClick={() => handleToolAction('Price Manager')}>
                          <i className="fas fa-tags tool-icon"></i>
                          <div className="tool-title">Price Manager</div>
                          <div className="tool-description">Set competitive pricing strategies</div>
                        </div>
                        <div className="tool-card" onClick={() => handleToolAction('Performance Tracker')}>
                          <i className="fas fa-chart-line tool-icon"></i>
                          <div className="tool-title">Performance Tracker</div>
                          <div className="tool-description">Monitor views, likes, and downloads</div>
                        </div>
                        <div className="tool-card" onClick={() => handleToolAction('Promotion Center')}>
                          <i className="fas fa-bullhorn tool-icon"></i>
                          <div className="tool-title">Promotion Center</div>
                          <div className="tool-description">Boost visibility with campaigns</div>
                        </div>
                        <div className="tool-card" onClick={() => handleToolAction('Customer Analytics')}>
                          <i className="fas fa-users tool-icon"></i>
                          <div className="tool-title">Customer Analytics</div>
                          <div className="tool-description">Understand your buyers better</div>
                        </div>
                        <div className="tool-card" onClick={() => handleToolAction('Review Manager')}>
                          <i className="fas fa-star tool-icon"></i>
                          <div className="tool-title">Review Manager</div>
                          <div className="tool-description">Manage ratings and feedback</div>
                        </div>
                        <div className="tool-card" onClick={() => handleToolAction('Material Editor')}>
                          <i className="fas fa-palette tool-icon"></i>
                          <div className="tool-title">Material Editor</div>
                          <div className="tool-description">Customize textures and materials</div>
                        </div>
                      </div>
                    </div>

                    {/* Sales History */}
                    <div className="content-card">
                      <h5>
                        <i className="fas fa-history text-info"></i>
                        Sales History
                      </h5>
                      
                      {sales.length === 0 ? (
                        <div className="empty-state">
                          <i className="fas fa-store"></i>
                          <h6>No sales yet</h6>
                          <p>Start selling your 3D designs and track your progress here.</p>
                          <button className="btn btn-primary-custom mt-3" onClick={handleListFirstItem}>
                            <i className="fas fa-plus me-2"></i>
                            List Your First Item
                          </button>
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-dark table-hover">
                            <thead>
                              <tr>
                                <th>Item</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th>Revenue</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sales.map((sale) => (
                                <tr key={sale.id}>
                                  <td>
                                    <div>
                                      <strong style={{ color: '#e2e8f0' }}>{sale.item.name}</strong>
                                      <div className="small text-muted">
                                        Listed {formatDate(sale.saleDate)}
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="badge" style={{ 
                                      background: 'rgba(66, 153, 225, 0.2)', 
                                      color: '#4299e1' 
                                    }}>
                                      3D Models
                                    </span>
                                  </td>
                                  <td>
                                    <strong style={{ color: '#48bb78' }}>{formatPrice(sale.salePrice)}</strong>
                                  </td>
                                  <td>{getStatusBadge(sale.status)}</td>
                                  <td>
                                    <div style={{ color: '#ed8936' }}>
                                      <i className="fas fa-eye me-1"></i>
                                      {Math.floor(Math.random() * 500) + 50}
                                    </div>
                                  </td>
                                  <td>
                                    <strong style={{ color: '#9f7aea' }}>
                                      {formatPrice(sale.salePrice * Math.floor(Math.random() * 5))}
                                    </strong>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <button 
                                        className="btn btn-outline-custom btn-sm" 
                                        title="Edit Listing"
                                        onClick={() => handleEditListing(sale)}
                                      >
                                        <i className="fas fa-edit"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-custom btn-sm" 
                                        title="Analytics"
                                        onClick={() => handleViewSalesAnalytics(sale)}
                                      >
                                        <i className="fas fa-chart-bar"></i>
                                      </button>
                                      <button 
                                        className="btn btn-outline-custom btn-sm" 
                                        title="Promote"
                                        onClick={() => handlePromoteListing(sale)}
                                      >
                                        <i className="fas fa-bullhorn"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div>
                    {/* Performance Metrics */}
                    <div className="row mb-4">
                      <div className="col-lg-8">
                        <div className="content-card">
                          <h5>
                            <i className="fas fa-chart-bar text-info"></i>
                            Performance Analytics
                          </h5>
                          <div className="row">
                            <div className="col-md-6">
                              <div className="metric-row">
                                <span className="metric-label">Conversion Rate</span>
                                <span className="metric-value text-success">12.5%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '12.5%' }}></div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="metric-row">
                                <span className="metric-label">Avg. Order Value</span>
                                <span className="metric-value text-info">{formatPrice(32.39)}</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '65%' }}></div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="row mt-3">
                            <div className="col-md-6">
                              <div className="metric-row">
                                <span className="metric-label">Return Customer Rate</span>
                                <span className="metric-value text-warning">34%</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '34%' }}></div>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="metric-row">
                                <span className="metric-label">Customer Satisfaction</span>
                                <span className="metric-value text-success">4.8/5</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: '96%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-lg-4">
                        <div className="content-card">
                          <h5>
                            <i className="fas fa-trophy text-warning"></i>
                            Top Categories
                          </h5>
                          <div className="metric-row">
                            <span className="metric-label">Aerospace Models</span>
                            <span className="metric-value">45%</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Automotive Parts</span>
                            <span className="metric-value">28%</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Architecture</span>
                            <span className="metric-value">18%</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Industrial</span>
                            <span className="metric-value">9%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Traffic Sources */}
                    <div className="content-card">
                      <h5>
                        <i className="fas fa-globe text-primary"></i>
                        Traffic & Discovery Sources
                      </h5>
                      <div className="row">
                        <div className="col-md-3">
                          <div className="metric-row">
                            <span className="metric-label">Direct Search</span>
                            <span className="metric-value text-success">52%</span>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="metric-row">
                            <span className="metric-label">Social Media</span>
                            <span className="metric-value text-info">23%</span>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="metric-row">
                            <span className="metric-label">Referrals</span>
                            <span className="metric-value text-warning">15%</span>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="metric-row">
                            <span className="metric-label">Featured</span>
                            <span className="metric-value text-danger">10%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'payouts' && (
                  <div>
                    {/* Payout Summary */}
                    <div className="stats-grid mb-4">
                      <div className="stat-card earnings">
                        <i className="fas fa-wallet stat-icon"></i>
                        <div className="stat-value">{formatPrice(stats.totalEarned + 150.75)}</div>
                        <div className="stat-label">Available Balance</div>
                        <div className="stat-change">Ready to withdraw</div>
                      </div>
                      <div className="stat-card sales">
                        <i className="fas fa-clock stat-icon"></i>
                        <div className="stat-value">{formatPrice(75.50)}</div>
                        <div className="stat-label">Pending Payouts</div>
                        <div className="stat-change">Processing 2-3 days</div>
                      </div>
                      <div className="stat-card purchases">
                        <i className="fas fa-check-circle stat-icon"></i>
                        <div className="stat-value">{formatPrice(stats.totalEarned)}</div>
                        <div className="stat-label">Total Paid Out</div>
                        <div className="stat-change">All time earnings</div>
                      </div>
                      <div className="stat-card spending">
                        <i className="fas fa-calendar-alt stat-icon"></i>
                        <div className="stat-value">Nov 1</div>
                        <div className="stat-label">Next Auto Payout</div>
                        <div className="stat-change">Monthly schedule</div>
                      </div>
                    </div>

                    <div className="row">
                      {/* Payout History */}
                      <div className="col-lg-8">
                        <div className="content-card">
                          <h5>
                            <i className="fas fa-history text-success"></i>
                            Payout History
                          </h5>
                          <div className="table-responsive">
                            <table className="table table-dark table-hover">
                              <thead>
                                <tr>
                                  <th>Payout ID</th>
                                  <th>Amount</th>
                                  <th>Method</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                  <th>Fee</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td><code style={{ color: '#3182ce' }}>#PO_001</code></td>
                                  <td><strong style={{ color: '#48bb78' }}>{formatPrice(125.00)}</strong></td>
                                  <td><i className="fab fa-paypal text-primary me-2"></i>PayPal</td>
                                  <td>{getStatusBadge('completed')}</td>
                                  <td>{formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())}</td>
                                  <td>{formatPrice(3.75)}</td>
                                </tr>
                                <tr>
                                  <td><code style={{ color: '#3182ce' }}>#PO_002</code></td>
                                  <td><strong style={{ color: '#48bb78' }}>{formatPrice(75.50)}</strong></td>
                                  <td><i className="fas fa-university text-info me-2"></i>Bank</td>
                                  <td>{getStatusBadge('pending')}</td>
                                  <td>{formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())}</td>
                                  <td>{formatPrice(2.50)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Payout Settings */}
                      <div className="col-lg-4">
                        <div className="content-card">
                          <h5>
                            <i className="fas fa-cog text-warning"></i>
                            Payout Settings
                          </h5>
                          <div className="metric-row">
                            <span className="metric-label">Auto Payout Threshold</span>
                            <span className="metric-value">{formatPrice(100)}</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Payout Schedule</span>
                            <span className="metric-value">Monthly</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Payment Method</span>
                            <span className="metric-value">PayPal</span>
                          </div>
                          <div className="metric-row">
                            <span className="metric-label">Processing Fee</span>
                            <span className="metric-value">3%</span>
                          </div>
                          
                          <div className="mt-4">
                            <button className="btn btn-primary-custom w-100 mb-2" onClick={handleRequestPayout}>
                              <i className="fas fa-money-bill-wave me-2"></i>
                              Request Payout
                            </button>
                            <button className="btn btn-outline-custom w-100" onClick={handleUpdatePayoutSettings}>
                              <i className="fas fa-cog me-2"></i>
                              Update Settings
                            </button>
                          </div>
                        </div>

                        <div className="content-card mt-3">
                          <h5>
                            <i className="fas fa-credit-card text-info"></i>
                            Payment Methods
                          </h5>
                          <div className="d-flex align-items-center p-3 mb-2" style={{
                            background: 'rgba(49, 130, 206, 0.1)',
                            border: '1px solid rgba(49, 130, 206, 0.3)',
                            borderRadius: '8px'
                          }}>
                            <i className="fab fa-paypal text-primary fa-2x me-3"></i>
                            <div>
                              <div style={{ color: '#e2e8f0', fontWeight: '600' }}>PayPal</div>
                              <small style={{ color: '#a0aec0' }}>user@example.com</small>
                            </div>
                            <span className="ms-auto status-badge status-success">Primary</span>
                          </div>
                          <button className="btn btn-outline-custom w-100" onClick={handleAddPaymentMethod}>
                            <i className="fas fa-plus me-2"></i>
                            Add Payment Method
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
      
      {/* Bundle Creation Modal */}
      <BundleCreationModal
        show={showBundleModal}
        onClose={() => setShowBundleModal(false)}
        onBundleCreated={handleBundleCreated}
      />
    </>
  );
};

export default DashboardModal;