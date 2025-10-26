import React, { useState } from 'react';
import { Modal, Nav, Tab, Form, Table, Badge, Card } from 'react-bootstrap';

interface SalesModalProps {
  show: boolean;
  onClose: () => void;
  user: any;
  onUploadDesign?: () => void;
}

interface DesignAsset {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: 'active' | 'draft' | 'sold' | 'paused';
  sales: number;
  revenue: number;
  uploadDate: string;
  lastModified: string;
  views: number;
  likes: number;
}

interface SalesData {
  id: string;
  designName: string;
  buyer: string;
  price: number;
  date: string;
  status: 'completed' | 'pending' | 'refunded';
}

interface Analytics {
  totalRevenue: number;
  totalSales: number;
  avgPrice: number;
  topSellingDesign: string;
  monthlyRevenue: number[];
  categorySales: { [key: string]: number };
}

interface PayoutData {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestDate: string;
  processedDate?: string;
  method: string;
  fees: number;
  netAmount: number;
}

interface PayoutStats {
  availableBalance: number;
  pendingPayouts: number;
  totalPaidOut: number;
  nextPayoutDate: string;
  minimumPayout: number;
}

const SalesModal: React.FC<SalesModalProps> = ({ show, onClose, user, onUploadDesign }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Mock data for demonstration - in real app, this would come from API
  const [assets] = useState<DesignAsset[]>([
    {
      id: '1',
      name: 'Aerodynamic Wing Design',
      description: 'High-performance wing with optimized airflow - Perfect for racing applications',
      price: 199.99,
      category: 'Aerospace',
      status: 'active',
      sales: 23,
      revenue: 4599.77,
      uploadDate: '2024-10-01',
      lastModified: '2024-10-15',
      views: 1247,
      likes: 187
    },
    {
      id: '2',
      name: 'Formula 1 Front Wing',
      description: 'Professional F1 front wing assembly - Race-tested design',
      price: 299.99,
      category: 'Automotive',
      status: 'active',
      sales: 12,
      revenue: 3599.88,
      uploadDate: '2024-09-15',
      lastModified: '2024-10-10',
      views: 892,
      likes: 156
    },
    {
      id: '3',
      name: 'Drone Propeller Set',
      description: 'Ultra-efficient propeller design for racing drones',
      price: 49.99,
      category: 'Aerospace',
      status: 'active',
      sales: 45,
      revenue: 2249.55,
      uploadDate: '2024-10-20',
      lastModified: '2024-10-20',
      views: 623,
      likes: 89
    },
    {
      id: '4',
      name: 'Turbine Blade Prototype',
      description: 'Next-gen wind turbine blade with 15% efficiency boost',
      price: 399.99,
      category: 'Energy',
      status: 'draft',
      sales: 0,
      revenue: 0,
      uploadDate: '2024-10-25',
      lastModified: '2024-10-25',
      views: 34,
      likes: 8
    }
  ]);

  const [salesHistory] = useState<SalesData[]>([
    {
      id: 'sale_001',
      designName: 'Aerodynamic Wing Design',
      buyer: 'john.engineer@email.com',
      price: 199.99,
      date: '2024-10-25',
      status: 'completed'
    },
    {
      id: 'sale_002',
      designName: 'Formula 1 Front Wing',
      buyer: 'racing.team@formula.com',
      price: 299.99,
      date: '2024-10-24',
      status: 'completed'
    },
    {
      id: 'sale_003',
      designName: 'Aerodynamic Wing Design',
      buyer: 'aero.student@university.edu',
      price: 199.99,
      date: '2024-10-23',
      status: 'pending'
    }
  ]);

  const analytics: Analytics = {
    totalRevenue: 10449.20,
    totalSales: 80,
    avgPrice: 130.62,
    topSellingDesign: 'Drone Propeller Set',
    monthlyRevenue: [2100, 3200, 4500, 5800, 7200, 8100, 8900, 9800, 10449],
    categorySales: {
      'Aerospace': 68,
      'Automotive': 12,
      'Energy': 0
    }
  };

  const [payoutHistory] = useState<PayoutData[]>([
    {
      id: 'payout_001',
      amount: 2500.00,
      status: 'completed',
      requestDate: '2024-10-01',
      processedDate: '2024-10-03',
      method: 'PayPal',
      fees: 75.00,
      netAmount: 2425.00
    },
    {
      id: 'payout_002',
      amount: 1800.50,
      status: 'completed',
      requestDate: '2024-09-15',
      processedDate: '2024-09-17',
      method: 'Bank Transfer',
      fees: 25.00,
      netAmount: 1775.50
    },
    {
      id: 'payout_003',
      amount: 950.00,
      status: 'processing',
      requestDate: '2024-10-24',
      method: 'PayPal',
      fees: 28.50,
      netAmount: 921.50
    },
    {
      id: 'payout_004',
      amount: 3200.00,
      status: 'pending',
      requestDate: '2024-10-25',
      method: 'Bank Transfer',
      fees: 45.00,
      netAmount: 3155.00
    }
  ]);

  const payoutStats: PayoutStats = {
    availableBalance: 2749.70,
    pendingPayouts: 4150.00,
    totalPaidOut: 4200.50,
    nextPayoutDate: '2024-11-01',
    minimumPayout: 50.00
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: 'success-badge', text: 'Active' },
      draft: { className: 'warning-badge', text: 'Draft' },
      sold: { className: 'success-badge', text: 'Sold' },
      paused: { className: 'warning-badge', text: 'Paused' },
      completed: { className: 'success-badge', text: 'Completed' },
      pending: { className: 'warning-badge', text: 'Pending' },
      refunded: { className: 'warning-badge', text: 'Refunded' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { className: 'warning-badge', text: status };
    return <span className={config.className}>{config.text}</span>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <style>
        {`
          .sales-modal .nav-tabs {
            border-bottom: none;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px 12px 0 0;
            padding: 0.5rem;
          }
          .sales-modal .nav-tabs .nav-link {
            border: none;
            background: transparent;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 600;
            padding: 0.75rem 1.25rem;
            border-radius: 8px;
            margin-right: 0.5rem;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            position: relative;
          }
          .sales-modal .nav-tabs .nav-link:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
          .sales-modal .nav-tabs .nav-link.active {
            color: white;
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }
          .sales-modal .nav-tabs .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 2px;
            background: #10B981;
            border-radius: 2px;
          }
          .sales-modal .tab-content {
            padding: 2rem;
            max-height: 75vh;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.1);
          }
          .sales-modal .table-dark {
            --bs-table-bg: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            overflow: hidden;
          }
          .sales-modal .table-dark thead th {
            border-bottom: none;
            background: linear-gradient(135deg, #1F2937 0%, #374151 100%);
            color: #F9FAFB;
            font-weight: 600;
            padding: 1rem;
          }
          .sales-modal .table-dark tbody td {
            border-color: rgba(255, 255, 255, 0.1);
            padding: 1rem;
          }
          .sales-modal .card {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          }
          .sales-modal .card-header {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 16px 16px 0 0 !important;
          }
          .stats-card {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border: none;
            border-radius: 16px;
            padding: 2rem 1.5rem;
            color: white;
            text-align: center;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(16, 185, 129, 0.25);
            position: relative;
            overflow: hidden;
          }
          .stats-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          .stats-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 12px 35px rgba(16, 185, 129, 0.35);
          }
          .stats-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: white;
            display: block;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          .stats-label {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.9);
            margin-top: 0.5rem;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .gradient-btn {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%) !important;
            border: none !important;
            border-radius: 12px !important;
            font-weight: 600 !important;
            padding: 0.75rem 1.5rem !important;
            box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
            transition: all 0.3s ease !important;
          }
          .gradient-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4) !important;
          }
          .success-badge {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            font-weight: 600;
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            font-size: 0.75rem;
          }
          .warning-badge {
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            color: white;
            font-weight: 600;
            padding: 0.4rem 0.8rem;
            border-radius: 8px;
            font-size: 0.75rem;
          }
          .revenue-highlight {
            color: #10B981;
            font-weight: 700;
            font-size: 1.1rem;
          }
          .metric-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s ease;
          }
          .metric-card:hover {
            transform: translateY(-2px);
            border-color: rgba(16, 185, 129, 0.4);
          }
          .welcome-banner {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            border-radius: 16px;
            padding: 2rem;
            color: white;
            margin-bottom: 2rem;
            position: relative;
            overflow: hidden;
          }
          .welcome-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            50% { transform: translateY(-10px) translateX(5px); }
          }
        `}
      </style>
      <Modal show={show} onHide={onClose} size="xl" centered backdrop="static" className="sales-modal">
        <Modal.Header 
          closeButton 
          style={{ 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            borderBottom: 'none',
            color: 'white',
            borderRadius: '0 0 0 0'
          }}
        >
          <Modal.Title className="d-flex align-items-center w-100">
            <img 
              src="/curfdlogo.png" 
              alt="CURFD" 
              style={{ 
                height: '40px', 
                marginRight: '1rem',
                filter: 'brightness(1.2) contrast(1.1)' 
              }} 
            />
            <div className="flex-grow-1">
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                <i className="fas fa-store" style={{ color: '#FFD700', marginRight: '0.75rem' }}></i>
                Seller Hub
              </div>
              <small style={{ opacity: 0.95, fontSize: '0.9rem' }}>
                Your one-stop shop for managing sales, tracking performance, and growing your business
              </small>
            </div>
            <div className="text-end">
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {formatCurrency(analytics.totalRevenue)}
              </div>
              <small style={{ opacity: 0.9, fontSize: '0.8rem' }}>
                Total Earned
              </small>
            </div>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body 
          style={{ 
            background: 'linear-gradient(to bottom, #1a1a2e 0%, #16213e 100%)',
            padding: 0
          }}
        >
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'dashboard')}>
            <Nav variant="tabs" className="px-3 pt-2">
              <Nav.Item>
                <Nav.Link eventKey="dashboard">
                  <i className="fas fa-chart-line me-2"></i>
                  Dashboard
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="assets">
                  <i className="fas fa-box me-2"></i>
                  My Assets
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="sales">
                  <i className="fas fa-history me-2"></i>
                  Sales History
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="analytics">
                  <i className="fas fa-analytics me-2"></i>
                  Analytics
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="payouts">
                  <i className="fas fa-money-bill-wave me-2"></i>
                  Payouts
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="settings">
                  <i className="fas fa-cog me-2"></i>
                  Settings
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              {/* Dashboard Tab */}
              <Tab.Pane eventKey="dashboard">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h3 style={{ margin: 0, fontWeight: 'bold' }}>
                        <i className="fas fa-rocket me-3"></i>
                        Welcome back, {user?.firstName}!
                      </h3>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
                        Your designs are performing great! You've earned <strong>{formatCurrency(analytics.totalRevenue)}</strong> from {analytics.totalSales} sales this month.
                      </p>
                    </div>
                    <div className="col-md-4 text-end">
                      <button 
                        className="btn btn-light btn-lg" 
                        style={{ fontWeight: 'bold', color: '#059669' }}
                        onClick={onUploadDesign}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Upload New Design
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-dollar-sign" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{formatCurrency(analytics.totalRevenue)}</span>
                      <div className="stats-label">Total Earnings</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-arrow-up me-1"></i>+23% vs last month
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-shopping-cart" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{analytics.totalSales}</span>
                      <div className="stats-label">Total Sales</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-arrow-up me-1"></i>+18% vs last month
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-eye" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{assets.reduce((sum, a) => sum + a.views, 0).toLocaleString()}</span>
                      <div className="stats-label">Total Views</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-arrow-up me-1"></i>+45% vs last month
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-chart-line" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{((analytics.totalSales / assets.reduce((sum, a) => sum + a.views, 0)) * 100).toFixed(1)}%</span>
                      <div className="stats-label">Conversion Rate</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-arrow-up me-1"></i>+8% vs last month
                      </small>
                    </div>
                  </div>
                </div>

                {/* Performance Section */}
                <div className="row">
                  <div className="col-md-8">
                    <Card className="mb-4">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white',
                        borderRadius: '16px 16px 0 0'
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="fas fa-trophy me-2" style={{ color: '#F59E0B' }}></i>
                            Your Best Sellers
                          </h5>
                          <span className="badge" style={{ background: '#10B981', color: 'white' }}>
                            Top 3 Performers
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Body style={{ padding: '0' }}>
                        <Table variant="dark" className="mb-0">
                          <thead>
                            <tr>
                              <th style={{ padding: '1.25rem' }}>Design</th>
                              <th>Performance</th>
                              <th>Revenue</th>
                              <th>Popularity</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assets
                              .filter(asset => asset.sales > 0)
                              .sort((a, b) => b.revenue - a.revenue)
                              .slice(0, 3)
                              .map((asset, index) => (
                                <tr key={asset.id}>
                                  <td style={{ padding: '1.25rem' }}>
                                    <div className="d-flex align-items-center">
                                      <div className="me-3">
                                        <span className="badge" style={{ 
                                          background: index === 0 ? '#F59E0B' : index === 1 ? '#6B7280' : '#8B5CF6',
                                          color: 'white',
                                          fontSize: '0.8rem',
                                          padding: '0.5rem'
                                        }}>
                                          #{index + 1}
                                        </span>
                                      </div>
                                      <div>
                                        <strong style={{ color: 'white', fontSize: '1rem' }}>{asset.name}</strong>
                                        <br />
                                        <small style={{ color: '#10B981', fontWeight: '600' }}>{asset.category}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <div style={{ fontWeight: 'bold', color: '#10B981' }}>{asset.sales} sales</div>
                                      <small style={{ color: '#9CA3AF' }}>{formatCurrency(asset.price)} each</small>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="revenue-highlight">{formatCurrency(asset.revenue)}</div>
                                  </td>
                                  <td>
                                    <div>
                                      <div style={{ color: 'white' }}>{asset.views} views</div>
                                      <small style={{ color: '#9CA3AF' }}>{asset.likes} likes</small>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-4">
                    <Card className="mb-3">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-bell me-2" style={{ color: '#10B981' }}></i>
                          Quick Actions
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-grid gap-3">
                          <button 
                            className="btn btn-outline-light" 
                            style={{ 
                              borderColor: '#10B981', 
                              color: '#10B981',
                              borderRadius: '10px',
                              fontWeight: '600'
                            }}
                            onClick={onUploadDesign}
                          >
                            <i className="fas fa-upload me-2"></i>
                            Upload New Design
                          </button>
                          <button className="btn btn-outline-light" style={{ 
                            borderColor: '#F59E0B', 
                            color: '#F59E0B',
                            borderRadius: '10px',
                            fontWeight: '600'
                          }}>
                            <i className="fas fa-bullhorn me-2"></i>
                            Promote Designs
                          </button>
                          <button className="btn btn-outline-light" style={{ 
                            borderColor: '#8B5CF6', 
                            color: '#8B5CF6',
                            borderRadius: '10px',
                            fontWeight: '600'
                          }}>
                            <i className="fas fa-money-bill-wave me-2"></i>
                            Request Payout
                          </button>
                        </div>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-chart-pie me-2" style={{ color: '#F59E0B' }}></i>
                          This Month
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="metric-card mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ color: 'white', fontWeight: '600' }}>Revenue Goal</span>
                            <span style={{ color: '#10B981', fontWeight: 'bold' }}>87%</span>
                          </div>
                          <div style={{ 
                            background: 'rgba(16, 185, 129, 0.2)', 
                            borderRadius: '8px', 
                            height: '8px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              background: '#10B981', 
                              height: '100%', 
                              width: '87%',
                              borderRadius: '8px'
                            }}></div>
                          </div>
                          <small style={{ color: '#9CA3AF' }}>
                            {formatCurrency(analytics.totalRevenue)} / {formatCurrency(12000)} target
                          </small>
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: 'white' }}>New customers</span>
                          <span style={{ color: '#10B981', fontWeight: 'bold' }}>+12</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: 'white' }}>Repeat purchases</span>
                          <span style={{ color: '#10B981', fontWeight: 'bold' }}>34%</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab.Pane>

              {/* Assets Tab */}
              <Tab.Pane eventKey="assets">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>
                      <i className="fas fa-layer-group me-2" style={{ color: '#10B981' }}></i>
                      My Design Portfolio
                    </h4>
                    <p style={{ color: '#9CA3AF', margin: 0 }}>
                      Manage your {assets.length} designs • {assets.filter(a => a.status === 'active').length} active listings
                    </p>
                  </div>
                  <button 
                    className="btn btn-primary gradient-btn"
                    onClick={onUploadDesign}
                  >
                    <i className="fas fa-cloud-upload-alt me-2"></i>
                    Upload New Design
                  </button>
                </div>

                {/* Assets Grid */}
                <div className="row">
                  {assets.map(asset => (
                    <div key={asset.id} className="col-md-6 col-lg-4 mb-4">
                      <Card style={{ 
                        height: '100%',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        transition: 'all 0.3s ease'
                      }}
                      className="asset-card h-100"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.borderColor = '#10B981';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      }}>
                        <Card.Header style={{ 
                          background: 'transparent',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                          padding: '1.25rem 1.25rem 1rem'
                        }}>
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <h6 style={{ color: 'white', margin: 0, fontWeight: 'bold' }}>
                                {asset.name}
                              </h6>
                              <small style={{ color: '#10B981', fontWeight: '600' }}>
                                {asset.category}
                              </small>
                            </div>
                            {getStatusBadge(asset.status)}
                          </div>
                        </Card.Header>
                        
                        <Card.Body style={{ padding: '1.25rem' }}>
                          <p style={{ 
                            color: '#D1D5DB', 
                            fontSize: '0.85rem', 
                            marginBottom: '1rem',
                            lineHeight: '1.4'
                          }}>
                            {asset.description}
                          </p>
                          
                          <div className="row text-center mb-3">
                            <div className="col-4">
                              <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {formatCurrency(asset.price)}
                              </div>
                              <small style={{ color: '#9CA3AF' }}>Price</small>
                            </div>
                            <div className="col-4">
                              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {asset.sales}
                              </div>
                              <small style={{ color: '#9CA3AF' }}>Sales</small>
                            </div>
                            <div className="col-4">
                              <div style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {asset.views}
                              </div>
                              <small style={{ color: '#9CA3AF' }}>Views</small>
                            </div>
                          </div>

                          {asset.revenue > 0 && (
                            <div className="text-center mb-3">
                              <div style={{ 
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                borderRadius: '8px',
                                padding: '0.75rem'
                              }}>
                                <div style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                  {formatCurrency(asset.revenue)}
                                </div>
                                <small style={{ color: '#10B981', fontWeight: '600' }}>Total Earned</small>
                              </div>
                            </div>
                          )}

                          <div className="d-flex gap-2">
                            <button className="btn btn-outline-light btn-sm flex-fill" style={{
                              borderColor: '#10B981',
                              color: '#10B981',
                              borderRadius: '8px'
                            }}>
                              <i className="fas fa-edit me-1"></i>
                              Edit
                            </button>
                            <button className="btn btn-outline-light btn-sm flex-fill" style={{
                              borderColor: '#F59E0B',
                              color: '#F59E0B',
                              borderRadius: '8px'
                            }}>
                              <i className="fas fa-chart-line me-1"></i>
                              Stats
                            </button>
                            {asset.status === 'active' ? (
                              <button className="btn btn-outline-light btn-sm" style={{
                                borderColor: '#EF4444',
                                color: '#EF4444',
                                borderRadius: '8px'
                              }}>
                                <i className="fas fa-pause"></i>
                              </button>
                            ) : (
                              <button className="btn btn-outline-light btn-sm" style={{
                                borderColor: '#10B981',
                                color: '#10B981',
                                borderRadius: '8px'
                              }}>
                                <i className="fas fa-play"></i>
                              </button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                  
                  {/* Add New Asset Card */}
                  <div className="col-md-6 col-lg-4 mb-4">
                    <Card style={{ 
                      height: '100%',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                      border: '2px dashed #10B981',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    className="d-flex align-items-center justify-content-center text-center"
                    onClick={onUploadDesign}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = '#10B981';
                    }}>
                      <Card.Body>
                        <i className="fas fa-plus" style={{ 
                          fontSize: '3rem', 
                          color: '#10B981', 
                          marginBottom: '1rem' 
                        }}></i>
                        <h5 style={{ color: '#10B981', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          Upload New Design
                        </h5>
                        <p style={{ color: '#059669', margin: 0 }}>
                          Add another design to your portfolio and start earning more
                        </p>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab.Pane>

              {/* Sales History Tab */}
              <Tab.Pane eventKey="sales">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 style={{ color: 'white' }}>
                    <i className="fas fa-history me-2"></i>
                    Sales History
                  </h4>
                  <div>
                    <button className="btn btn-outline-light btn-sm me-2">
                      <i className="fas fa-download me-2"></i>
                      Export CSV
                    </button>
                    <button className="btn btn-outline-light btn-sm">
                      <i className="fas fa-filter me-2"></i>
                      Filter
                    </button>
                  </div>
                </div>

                <Table variant="dark" hover>
                  <thead>
                    <tr>
                      <th>Sale ID</th>
                      <th>Design</th>
                      <th>Buyer</th>
                      <th>Price</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesHistory.map(sale => (
                      <tr key={sale.id}>
                        <td>
                          <code style={{ color: '#667eea' }}>{sale.id}</code>
                        </td>
                        <td>{sale.designName}</td>
                        <td>{sale.buyer}</td>
                        <td>{formatCurrency(sale.price)}</td>
                        <td>{formatDate(sale.date)}</td>
                        <td>{getStatusBadge(sale.status)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-info btn-sm">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                              <i className="fas fa-download"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Tab.Pane>

              {/* Analytics Tab */}
              <Tab.Pane eventKey="analytics">
                <h4 style={{ color: 'white' }} className="mb-4">
                  <i className="fas fa-chart-bar me-2"></i>
                  Sales Analytics
                </h4>
                
                <div className="row mb-4">
                  <div className="col-md-6">
                    <Card>
                      <Card.Header style={{ background: 'rgba(102, 126, 234, 0.1)', color: 'white' }}>
                        <h5 className="mb-0">Revenue by Category</h5>
                      </Card.Header>
                      <Card.Body>
                        {Object.entries(analytics.categorySales).map(([category, sales]) => (
                          <div key={category} className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ color: 'white' }}>{category}</span>
                            <span style={{ color: '#667eea', fontWeight: 'bold' }}>{sales} sales</span>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="col-md-6">
                    <Card>
                      <Card.Header style={{ background: 'rgba(102, 126, 234, 0.1)', color: 'white' }}>
                        <h5 className="mb-0">Performance Metrics</h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: 'white' }}>Conversion Rate</span>
                          <span style={{ color: '#667eea', fontWeight: 'bold' }}>12.5%</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: 'white' }}>Avg. Views per Sale</span>
                          <span style={{ color: '#667eea', fontWeight: 'bold' }}>18.4</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ color: 'white' }}>Top Category</span>
                          <span style={{ color: '#667eea', fontWeight: 'bold' }}>Aerospace</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab.Pane>

              {/* Payouts Tab */}
              <Tab.Pane eventKey="payouts">
                {/* Payout Overview */}
                <div className="welcome-banner mb-4">
                  <div className="row align-items-center">
                    <div className="col-md-8">
                      <h3 style={{ margin: 0, fontWeight: 'bold' }}>
                        <i className="fas fa-wallet me-3"></i>
                        Payout Center
                      </h3>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', opacity: 0.9 }}>
                        Manage your earnings and request payouts. Available balance: <strong>{formatCurrency(payoutStats.availableBalance)}</strong>
                      </p>
                    </div>
                    <div className="col-md-4 text-end">
                      <button 
                        className="btn btn-light btn-lg" 
                        style={{ fontWeight: 'bold', color: '#059669' }}
                        disabled={payoutStats.availableBalance < payoutStats.minimumPayout}
                      >
                        <i className="fas fa-hand-holding-usd me-2"></i>
                        Request Payout
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payout Stats */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-piggy-bank" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{formatCurrency(payoutStats.availableBalance)}</span>
                      <div className="stats-label">Available Balance</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-info-circle me-1"></i>Ready to withdraw
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-clock" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{formatCurrency(payoutStats.pendingPayouts)}</span>
                      <div className="stats-label">Pending Payouts</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-hourglass-half me-1"></i>Processing
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-check-circle" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value">{formatCurrency(payoutStats.totalPaidOut)}</span>
                      <div className="stats-label">Total Paid Out</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-trophy me-1"></i>All time
                      </small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="stats-card">
                      <i className="fas fa-calendar-alt" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.8 }}></i>
                      <span className="stats-value" style={{ fontSize: '1.5rem' }}>{formatDate(payoutStats.nextPayoutDate)}</span>
                      <div className="stats-label">Next Auto Payout</div>
                      <small style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
                        <i className="fas fa-sync me-1"></i>Monthly schedule
                      </small>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="row">
                  <div className="col-md-8">
                    {/* Payout History */}
                    <Card className="mb-4">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white',
                        borderRadius: '16px 16px 0 0'
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">
                            <i className="fas fa-history me-2" style={{ color: '#10B981' }}></i>
                            Payout History
                          </h5>
                          <div>
                            <button className="btn btn-outline-light btn-sm me-2">
                              <i className="fas fa-download me-2"></i>
                              Export
                            </button>
                            <button className="btn btn-outline-light btn-sm">
                              <i className="fas fa-filter me-2"></i>
                              Filter
                            </button>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Body style={{ padding: '0' }}>
                        <Table variant="dark" className="mb-0">
                          <thead>
                            <tr>
                              <th style={{ padding: '1.25rem' }}>Payout ID</th>
                              <th>Amount</th>
                              <th>Method</th>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Net Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payoutHistory.map(payout => (
                              <tr key={payout.id}>
                                <td style={{ padding: '1.25rem' }}>
                                  <code style={{ color: '#10B981', fontSize: '0.85rem' }}>
                                    {payout.id}
                                  </code>
                                </td>
                                <td>
                                  <div style={{ color: 'white', fontWeight: 'bold' }}>
                                    {formatCurrency(payout.amount)}
                                  </div>
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <i className={`fab fa-${payout.method.toLowerCase() === 'paypal' ? 'paypal' : 'bitcoin'} me-2`} 
                                       style={{ color: payout.method.toLowerCase() === 'paypal' ? '#0070ba' : '#F59E0B' }}></i>
                                    {payout.method}
                                  </div>
                                </td>
                                <td>
                                  {payout.status === 'completed' && <span className="success-badge">Completed</span>}
                                  {payout.status === 'processing' && <span className="warning-badge">Processing</span>}
                                  {payout.status === 'pending' && <span className="warning-badge">Pending</span>}
                                  {payout.status === 'failed' && <span style={{ 
                                    background: '#EF4444', 
                                    color: 'white', 
                                    padding: '0.4rem 0.8rem', 
                                    borderRadius: '8px', 
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                  }}>Failed</span>}
                                </td>
                                <td>
                                  <div style={{ color: '#D1D5DB' }}>
                                    {formatDate(payout.requestDate)}
                                    {payout.processedDate && (
                                      <>
                                        <br />
                                        <small style={{ color: '#10B981' }}>
                                          Processed: {formatDate(payout.processedDate)}
                                        </small>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <div className="revenue-highlight">
                                      {formatCurrency(payout.netAmount)}
                                    </div>
                                    <small style={{ color: '#9CA3AF' }}>
                                      Fee: {formatCurrency(payout.fees)}
                                    </small>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </div>

                  <div className="col-md-4">
                    {/* Payout Methods */}
                    <Card className="mb-3">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-credit-card me-2" style={{ color: '#10B981' }}></i>
                          Payment Methods
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex align-items-center justify-content-between p-3" style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '12px',
                          marginBottom: '1rem'
                        }}>
                          <div className="d-flex align-items-center">
                            <i className="fab fa-paypal" style={{ fontSize: '1.5rem', color: '#0070ba', marginRight: '0.75rem' }}></i>
                            <div>
                              <div style={{ color: 'white', fontWeight: '600' }}>PayPal</div>
                              <small style={{ color: '#9CA3AF' }}>user@example.com</small>
                            </div>
                          </div>
                          <span className="success-badge">Primary</span>
                        </div>

                        <div className="d-flex align-items-center justify-content-between p-3" style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          marginBottom: '1rem'
                        }}>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-university" style={{ fontSize: '1.5rem', color: '#6B7280', marginRight: '0.75rem' }}></i>
                            <div>
                              <div style={{ color: 'white', fontWeight: '600' }}>Bank Transfer</div>
                              <small style={{ color: '#9CA3AF' }}>****1234</small>
                            </div>
                          </div>
                          <button className="btn btn-outline-light btn-sm">
                            <i className="fas fa-edit"></i>
                          </button>
                        </div>

                        <button className="btn btn-outline-light w-100" style={{
                          borderColor: '#10B981',
                          color: '#10B981',
                          borderRadius: '10px',
                          fontWeight: '600'
                        }}>
                          <i className="fas fa-plus me-2"></i>
                          Add Payment Method
                        </button>
                      </Card.Body>
                    </Card>

                    {/* Payout Settings */}
                    <Card>
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-cogs me-2" style={{ color: '#F59E0B' }}></i>
                          Payout Settings
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="mb-3">
                          <label style={{ color: '#E5E7EB', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                            Auto Payout Threshold
                          </label>
                          <Form.Select style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '8px'
                          }}>
                            <option value="100">$100</option>
                            <option value="250" selected>$250</option>
                            <option value="500">$500</option>
                            <option value="1000">$1,000</option>
                          </Form.Select>
                          <small style={{ color: '#9CA3AF', marginTop: '0.25rem', display: 'block' }}>
                            Automatic payout when balance reaches this amount
                          </small>
                        </div>

                        <div className="mb-3">
                          <label style={{ color: '#E5E7EB', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                            Payout Schedule
                          </label>
                          <Form.Select style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            borderRadius: '8px'
                          }}>
                            <option value="weekly">Weekly</option>
                            <option value="monthly" selected>Monthly</option>
                            <option value="manual">Manual Only</option>
                          </Form.Select>
                        </div>

                        <div className="alert mb-3" style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '8px',
                          color: '#10B981'
                        }}>
                          <i className="fas fa-info-circle me-2"></i>
                          <small>
                            Minimum payout: {formatCurrency(payoutStats.minimumPayout)}
                            <br />
                            Processing time: 3-5 business days
                          </small>
                        </div>

                        <button className="btn gradient-btn w-100">
                          <i className="fas fa-save me-2"></i>
                          Save Settings
                        </button>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab.Pane>

              {/* Settings Tab */}
              <Tab.Pane eventKey="settings">
                <h4 style={{ color: 'white', marginBottom: '2rem' }}>
                  <i className="fas fa-user-cog me-2" style={{ color: '#10B981' }}></i>
                  Seller Settings & Preferences
                </h4>
                
                <div className="row">
                  <div className="col-md-8">
                    {/* Profile & Store Settings */}
                    <Card className="mb-4">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white',
                        borderRadius: '16px 16px 0 0'
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-store me-2" style={{ color: '#10B981' }}></i>
                          Store Profile
                        </h5>
                      </Card.Header>
                      <Card.Body style={{ padding: '2rem' }}>
                        <Form>
                          <div className="row">
                            <div className="col-md-6">
                              <Form.Group className="mb-3">
                                <Form.Label style={{ color: '#E5E7EB', fontWeight: '600' }}>Store Name</Form.Label>
                                <Form.Control 
                                  type="text" 
                                  defaultValue={`${user?.firstName}'s Design Store`}
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    padding: '0.75rem'
                                  }}
                                />
                              </Form.Group>
                            </div>
                            <div className="col-md-6">
                              <Form.Group className="mb-3">
                                <Form.Label style={{ color: '#E5E7EB', fontWeight: '600' }}>Store Category</Form.Label>
                                <Form.Select 
                                  style={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    padding: '0.75rem'
                                  }}
                                >
                                  <option>Aerospace & Aviation</option>
                                  <option>Automotive Design</option>
                                  <option>Industrial Design</option>
                                  <option>Architecture</option>
                                  <option>Mechanical Engineering</option>
                                  <option>Multi-Category</option>
                                </Form.Select>
                              </Form.Group>
                            </div>
                          </div>
                          <Form.Group className="mb-4">
                            <Form.Label style={{ color: '#E5E7EB', fontWeight: '600' }}>Store Description</Form.Label>
                            <Form.Control 
                              as="textarea" 
                              rows={4}
                              defaultValue="Specialized in high-performance aerodynamic designs with 5+ years of CFD analysis experience. All designs are professionally tested and optimized for real-world applications."
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '0.75rem'
                              }}
                            />
                            <small style={{ color: '#9CA3AF', marginTop: '0.5rem', display: 'block' }}>
                              This appears on your store page and helps customers understand your expertise
                            </small>
                          </Form.Group>
                        </Form>
                      </Card.Body>
                    </Card>

                    {/* Notification Preferences */}
                    <Card className="mb-4">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-bell me-2" style={{ color: '#F59E0B' }}></i>
                          Notification Preferences
                        </h5>
                      </Card.Header>
                      <Card.Body style={{ padding: '2rem' }}>
                        <div className="row">
                          <div className="col-md-6">
                            <h6 style={{ color: '#E5E7EB', marginBottom: '1rem' }}>Email Notifications</h6>
                            <Form.Check 
                              type="switch"
                              id="email-sales"
                              label="New sales notifications"
                              defaultChecked
                              style={{ color: '#D1D5DB', marginBottom: '0.75rem' }}
                            />
                            <Form.Check 
                              type="switch"
                              id="email-reviews"
                              label="New reviews & ratings"
                              defaultChecked
                              style={{ color: '#D1D5DB', marginBottom: '0.75rem' }}
                            />
                            <Form.Check 
                              type="switch"
                              id="email-messages"
                              label="Customer messages"
                              defaultChecked
                              style={{ color: '#D1D5DB', marginBottom: '0.75rem' }}
                            />
                            <Form.Check 
                              type="switch"
                              id="email-payouts"
                              label="Payout confirmations"
                              defaultChecked
                              style={{ color: '#D1D5DB' }}
                            />
                          </div>
                          <div className="col-md-6">
                            <h6 style={{ color: '#E5E7EB', marginBottom: '1rem' }}>Marketing & Updates</h6>
                            <Form.Check 
                              type="switch"
                              id="marketing-tips"
                              label="Seller tips & best practices"
                              defaultChecked
                              style={{ color: '#D1D5DB', marginBottom: '0.75rem' }}
                            />
                            <Form.Check 
                              type="switch"
                              id="marketing-promotions"
                              label="Promotional opportunities"
                              style={{ color: '#D1D5DB', marginBottom: '0.75rem' }}
                            />
                            <Form.Check 
                              type="switch"
                              id="marketing-newsletter"
                              label="Monthly seller newsletter"
                              defaultChecked
                              style={{ color: '#D1D5DB', marginBottom: '0.75rem' }}
                            />
                            <Form.Check 
                              type="switch"
                              id="marketing-updates"
                              label="Platform updates"
                              defaultChecked
                              style={{ color: '#D1D5DB' }}
                            />
                          </div>
                        </div>
                      </Card.Body>
                    </Card>

                    {/* Privacy & Security */}
                    <Card className="mb-4">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-shield-alt me-2" style={{ color: '#EF4444' }}></i>
                          Privacy & Security
                        </h5>
                      </Card.Header>
                      <Card.Body style={{ padding: '2rem' }}>
                        <div className="row">
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label style={{ color: '#E5E7EB', fontWeight: '600' }}>Store Visibility</Form.Label>
                              <Form.Select style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                borderRadius: '8px'
                              }}>
                                <option value="public">Public - Anyone can find my store</option>
                                <option value="unlisted">Unlisted - Only via direct link</option>
                                <option value="private">Private - Invitation only</option>
                              </Form.Select>
                            </Form.Group>
                          </div>
                          <div className="col-md-6">
                            <Form.Group className="mb-3">
                              <Form.Label style={{ color: '#E5E7EB', fontWeight: '600' }}>Show Real Name</Form.Label>
                              <Form.Select style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                borderRadius: '8px'
                              }}>
                                <option value="yes">Yes - Display full name</option>
                                <option value="first">First name only</option>
                                <option value="no">No - Username only</option>
                              </Form.Select>
                            </Form.Group>
                          </div>
                        </div>
                        
                        <div className="d-flex gap-3 mt-3">
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#EF4444',
                            color: '#EF4444',
                            borderRadius: '8px'
                          }}>
                            <i className="fas fa-key me-2"></i>
                            Change Password
                          </button>
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#F59E0B',
                            color: '#F59E0B',
                            borderRadius: '8px'
                          }}>
                            <i className="fas fa-shield-alt me-2"></i>
                            Enable 2FA
                          </button>
                        </div>
                      </Card.Body>
                    </Card>

                    {/* Save Button */}
                    <div className="text-center">
                      <button className="btn gradient-btn" style={{ padding: '0.75rem 3rem', fontSize: '1.1rem' }}>
                        <i className="fas fa-save me-2"></i>
                        Save All Changes
                      </button>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Account Status */}
                    <Card className="mb-3">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-user-check me-2" style={{ color: '#10B981' }}></i>
                          Account Status
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span style={{ color: '#D1D5DB' }}>Account Type</span>
                          <span className="success-badge">Premium Seller</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span style={{ color: '#D1D5DB' }}>Verification</span>
                          <span className="success-badge">
                            <i className="fas fa-check me-1"></i>Verified
                          </span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span style={{ color: '#D1D5DB' }}>Member Since</span>
                          <span style={{ color: '#10B981', fontWeight: '600' }}>Jan 2024</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <span style={{ color: '#D1D5DB' }}>Seller Rating</span>
                          <div>
                            <span style={{ color: '#F59E0B', fontWeight: 'bold' }}>4.9</span>
                            <span style={{ color: '#F59E0B' }}>
                              <i className="fas fa-star ms-1"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                              <i className="fas fa-star"></i>
                            </span>
                          </div>
                        </div>
                        
                        <button className="btn btn-outline-light w-100" style={{
                          borderColor: '#8B5CF6',
                          color: '#8B5CF6',
                          borderRadius: '8px',
                          fontWeight: '600'
                        }}>
                          <i className="fas fa-crown me-2"></i>
                          Upgrade to Pro
                        </button>
                      </Card.Body>
                    </Card>

                    {/* Seller Resources */}
                    <Card className="mb-3">
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-graduation-cap me-2" style={{ color: '#8B5CF6' }}></i>
                          Seller Resources
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-grid gap-2">
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#10B981',
                            color: '#10B981',
                            borderRadius: '8px',
                            textAlign: 'left'
                          }}>
                            <i className="fas fa-book me-2"></i>
                            Seller Handbook
                          </button>
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#F59E0B',
                            color: '#F59E0B',
                            borderRadius: '8px',
                            textAlign: 'left'
                          }}>
                            <i className="fas fa-video me-2"></i>
                            Video Tutorials
                          </button>
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#8B5CF6',
                            color: '#8B5CF6',
                            borderRadius: '8px',
                            textAlign: 'left'
                          }}>
                            <i className="fas fa-users me-2"></i>
                            Seller Community
                          </button>
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#EF4444',
                            color: '#EF4444',
                            borderRadius: '8px',
                            textAlign: 'left'
                          }}>
                            <i className="fas fa-headset me-2"></i>
                            Contact Support
                          </button>
                        </div>
                      </Card.Body>
                    </Card>

                    {/* Account Actions */}
                    <Card>
                      <Card.Header style={{ 
                        background: 'linear-gradient(135deg, #1F2937 0%, #374151 100%)', 
                        color: 'white' 
                      }}>
                        <h5 className="mb-0">
                          <i className="fas fa-tools me-2" style={{ color: '#EF4444' }}></i>
                          Account Actions
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-grid gap-2">
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#6B7280',
                            color: '#6B7280',
                            borderRadius: '8px'
                          }}>
                            <i className="fas fa-download me-2"></i>
                            Export Data
                          </button>
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#F59E0B',
                            color: '#F59E0B',
                            borderRadius: '8px'
                          }}>
                            <i className="fas fa-pause me-2"></i>
                            Pause Selling
                          </button>
                          <button className="btn btn-outline-light" style={{
                            borderColor: '#EF4444',
                            color: '#EF4444',
                            borderRadius: '8px'
                          }}>
                            <i className="fas fa-trash-alt me-2"></i>
                            Delete Account
                          </button>
                        </div>
                        
                        <div className="alert mt-3" style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          color: '#EF4444'
                        }}>
                          <i className="fas fa-exclamation-triangle me-2"></i>
                          <small>
                            Account deletion is permanent and cannot be undone. All your designs and earnings data will be lost.
                          </small>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SalesModal;