import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPurchaseHistory, getPurchaseStats, clearPurchaseHistory, type PurchaseRecord, type SaleRecord } from '../../services/purchaseHistory';

interface UserDashboardProps {
  onBack: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'sales'>('overview');
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

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

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

  const handleClearHistory = () => {
    if (!user) return;
    
    const confirmClear = window.confirm(
      'Are you sure you want to clear all your purchase and sales history? This action cannot be undone.'
    );
    
    if (confirmClear) {
      const success = clearPurchaseHistory(user.id.toString());
      if (success) {
        loadUserData(); // Reload data
        alert('Purchase history cleared successfully.');
      } else {
        alert('Failed to clear purchase history.');
      }
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
    const baseClasses = "badge text-uppercase";
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-success`;
      case 'pending':
        return `${baseClasses} bg-warning text-dark`;
      case 'refunded':
        return `${baseClasses} bg-danger`;
      case 'active':
        return `${baseClasses} bg-primary`;
      case 'sold':
        return `${baseClasses} bg-success`;
      case 'inactive':
        return `${baseClasses} bg-secondary`;
      default:
        return `${baseClasses} bg-light text-dark`;
    }
  };

  if (!user) {
    return (
      <div className="container-fluid h-100 d-flex align-items-center justify-content-center"
           style={{ background: 'var(--curfd-dark, #0A0F29)', color: 'white' }}>
        <div className="text-center">
          <h3>Please log in to view your dashboard</h3>
          <button className="btn btn-primary mt-3" onClick={onBack}>
            Back to Main
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-fluid h-100 d-flex align-items-center justify-content-center"
           style={{ background: 'var(--curfd-dark, #0A0F29)', color: 'white' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3">Loading your dashboard...</h5>
        </div>
      </div>
    );
  }

  return (
    <div className="position-fixed inset-0" 
         style={{ 
           zIndex: 1030, 
           paddingTop: '60px',
           background: 'var(--curfd-dark, #0A0F29)',
           color: 'white'
         }}>
      
      {/* Header */}
      <div className="container-fluid border-bottom border-secondary pb-3 mb-4">
        <div className="row align-items-center">
          <div className="col">
            <button 
              className="btn btn-outline-light me-3"
              onClick={onBack}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back
            </button>
            <h2 className="d-inline-block mb-0">
              <i className="fas fa-user-circle me-2"></i>
              {user.name}'s Dashboard
            </h2>
          </div>
          <div className="col-auto">
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleClearHistory}
              title="Clear all purchase history"
            >
              <i className="fas fa-trash me-2"></i>
              Clear History
            </button>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              style={{ 
                background: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                border: 'none'
              }}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-line me-2"></i>
              Overview
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'purchases' ? 'active' : ''}`}
              style={{ 
                background: activeTab === 'purchases' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                border: 'none'
              }}
              onClick={() => setActiveTab('purchases')}
            >
              <i className="fas fa-shopping-cart me-2"></i>
              Purchases ({stats.totalPurchases})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`}
              style={{ 
                background: activeTab === 'sales' ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: 'white',
                border: 'none'
              }}
              onClick={() => setActiveTab('sales')}
            >
              <i className="fas fa-store me-2"></i>
              Sales ({stats.activeSales} active)
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="row">
            {/* Stats Cards */}
            <div className="col-12 mb-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body text-center">
                      <i className="fas fa-shopping-bag fa-3x mb-3"></i>
                      <h4>{stats.totalPurchases}</h4>
                      <p className="mb-0">Total Purchases</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body text-center">
                      <i className="fas fa-dollar-sign fa-3x mb-3"></i>
                      <h4>{formatPrice(stats.totalSpent)}</h4>
                      <p className="mb-0">Total Spent</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body text-center">
                      <i className="fas fa-store fa-3x mb-3"></i>
                      <h4>{stats.totalSales}</h4>
                      <p className="mb-0">Items Sold</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card bg-warning text-dark">
                    <div className="card-body text-center">
                      <i className="fas fa-coins fa-3x mb-3"></i>
                      <h4>{formatPrice(stats.totalEarned)}</h4>
                      <p className="mb-0">Total Earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="col-lg-6">
              <div className="card bg-dark border-secondary">
                <div className="card-header">
                  <h5 className="mb-0">Recent Purchases</h5>
                </div>
                <div className="card-body">
                  {stats.recentPurchases.length === 0 ? (
                    <p className="text-muted">No purchases yet</p>
                  ) : (
                    stats.recentPurchases.map((purchase) => (
                      <div key={purchase.id} className="border-bottom border-secondary pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{purchase.items.length} item(s)</strong>
                            <div className="text-muted small">
                              {formatDate(purchase.purchaseDate)}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="text-success">{formatPrice(purchase.total)}</div>
                            <span className={getStatusBadge(purchase.status)}>
                              {purchase.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card bg-dark border-secondary">
                <div className="card-header">
                  <h5 className="mb-0">Recent Sales</h5>
                </div>
                <div className="card-body">
                  {stats.recentSales.length === 0 ? (
                    <p className="text-muted">No sales yet</p>
                  ) : (
                    stats.recentSales.map((sale) => (
                      <div key={sale.id} className="border-bottom border-secondary pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{sale.item.name}</strong>
                            <div className="text-muted small">
                              {formatDate(sale.saleDate)}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="text-warning">{formatPrice(sale.salePrice)}</div>
                            <span className={getStatusBadge(sale.status)}>
                              {sale.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="row">
            <div className="col-12">
              <div className="card bg-dark border-secondary">
                <div className="card-header">
                  <h5 className="mb-0">Purchase History</h5>
                </div>
                <div className="card-body">
                  {purchases.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
                      <h5 className="text-muted">No purchases yet</h5>
                      <p className="text-muted">Your purchase history will appear here after you buy something.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark table-striped">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Items</th>
                            <th>Date</th>
                            <th>Subtotal</th>
                            <th>Tax</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.map((purchase) => (
                            <tr key={purchase.id}>
                              <td>
                                <small className="font-monospace">
                                  #{purchase.id.slice(-8)}
                                </small>
                              </td>
                              <td>
                                <div>
                                  {purchase.items.map((item, index) => (
                                    <div key={index} className="small">
                                      {item.name} × {item.quantity}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="small">
                                {formatDate(purchase.purchaseDate)}
                              </td>
                              <td>{formatPrice(purchase.subtotal)}</td>
                              <td>{formatPrice(purchase.tax)}</td>
                              <td><strong>{formatPrice(purchase.total)}</strong></td>
                              <td>
                                <span className={getStatusBadge(purchase.status)}>
                                  {purchase.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="row">
            <div className="col-12">
              <div className="card bg-dark border-secondary">
                <div className="card-header">
                  <h5 className="mb-0">Sales History</h5>
                </div>
                <div className="card-body">
                  {sales.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-store fa-4x text-muted mb-3"></i>
                      <h5 className="text-muted">No sales yet</h5>
                      <p className="text-muted">When you list items for sale, they will appear here.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-dark table-striped">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Listed Date</th>
                            <th>Sale Price</th>
                            <th>Status</th>
                            <th>Buyer</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sales.map((sale) => (
                            <tr key={sale.id}>
                              <td>
                                <div>
                                  <strong>{sale.item.name}</strong>
                                  <div className="text-muted small">
                                    {sale.item.description}
                                  </div>
                                </div>
                              </td>
                              <td className="small">
                                {formatDate(sale.saleDate)}
                              </td>
                              <td><strong>{formatPrice(sale.salePrice)}</strong></td>
                              <td>
                                <span className={getStatusBadge(sale.status)}>
                                  {sale.status}
                                </span>
                              </td>
                              <td>
                                {sale.buyerId ? (
                                  <span className="small font-monospace">
                                    User #{sale.buyerId}
                                  </span>
                                ) : (
                                  <span className="text-muted">-</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;