// Purchase History Service
import type { StoreItem } from '../components/Store/StorePage';
import type { CartItem } from '../components/Store/CartModal';

export interface PurchaseRecord {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  purchaseDate: string;
  userId: string;
  status: 'completed' | 'pending' | 'refunded';
}

export interface SaleRecord {
  id: string;
  item: StoreItem;
  salePrice: number;
  saleDate: string;
  sellerId: string;
  buyerId?: string;
  status: 'active' | 'sold' | 'inactive';
}

export interface UserPurchaseHistory {
  userId: string;
  purchases: PurchaseRecord[];
  sales: SaleRecord[];
  totalSpent: number;
  totalEarned: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'user_purchase_history';
const STORAGE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

// Get user's purchase history
export const getUserPurchaseHistory = (userId: string): UserPurchaseHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyHistory(userId);
    }

    const allHistory = JSON.parse(stored);
    const userHistory = allHistory[userId];
    
    if (!userHistory) {
      return createEmptyHistory(userId);
    }

    // Check if data is expired
    const lastUpdated = new Date(userHistory.lastUpdated).getTime();
    const now = Date.now();
    
    if (now - lastUpdated > STORAGE_EXPIRY) {
      console.log('Purchase history expired, creating fresh history');
      return createEmptyHistory(userId);
    }

    return userHistory;
  } catch (error) {
    console.error('Error loading purchase history:', error);
    return createEmptyHistory(userId);
  }
};

// Create empty history structure
const createEmptyHistory = (userId: string): UserPurchaseHistory => ({
  userId,
  purchases: [],
  sales: [],
  totalSpent: 0,
  totalEarned: 0,
  lastUpdated: new Date().toISOString()
});

// Save user's purchase history
export const saveUserPurchaseHistory = (history: UserPurchaseHistory): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allHistory = stored ? JSON.parse(stored) : {};
    
    // Update the specific user's history
    allHistory[history.userId] = {
      ...history,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    console.log('Purchase history saved for user:', history.userId);
    return true;
  } catch (error) {
    console.error('Error saving purchase history:', error);
    return false;
  }
};

// Add a new purchase
export const addPurchase = (userId: string, items: CartItem[], total: number, subtotal: number, tax: number): PurchaseRecord => {
  const history = getUserPurchaseHistory(userId);
  
  const purchase: PurchaseRecord = {
    id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    items: [...items],
    total,
    subtotal,
    tax,
    purchaseDate: new Date().toISOString(),
    userId,
    status: 'completed'
  };

  history.purchases.unshift(purchase); // Add to beginning of array
  history.totalSpent += total;
  
  saveUserPurchaseHistory(history);
  
  console.log('Added purchase:', purchase);
  return purchase;
};

// Add a new sale listing
export const addSaleListing = (userId: string, item: StoreItem, salePrice: number): SaleRecord => {
  const history = getUserPurchaseHistory(userId);
  
  const sale: SaleRecord = {
    id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    item: { ...item },
    salePrice,
    saleDate: new Date().toISOString(),
    sellerId: userId,
    status: 'active'
  };

  history.sales.unshift(sale); // Add to beginning of array
  
  saveUserPurchaseHistory(history);
  
  console.log('Added sale listing:', sale);
  return sale;
};

// Mark a sale as sold
export const markSaleAsSold = (userId: string, saleId: string, buyerId: string): boolean => {
  const history = getUserPurchaseHistory(userId);
  
  const saleIndex = history.sales.findIndex(sale => sale.id === saleId);
  if (saleIndex === -1) {
    console.error('Sale not found:', saleId);
    return false;
  }

  const sale = history.sales[saleIndex];
  sale.status = 'sold';
  sale.buyerId = buyerId;
  
  history.totalEarned += sale.salePrice;
  
  saveUserPurchaseHistory(history);
  
  console.log('Marked sale as sold:', sale);
  return true;
};

// Get purchase statistics
export const getPurchaseStats = (userId: string) => {
  const history = getUserPurchaseHistory(userId);
  
  const completedPurchases = history.purchases.filter(p => p.status === 'completed');
  const activeSales = history.sales.filter(s => s.status === 'active');
  const soldItems = history.sales.filter(s => s.status === 'sold');
  
  return {
    totalPurchases: completedPurchases.length,
    totalSpent: history.totalSpent,
    totalSales: soldItems.length,
    totalEarned: history.totalEarned,
    activeSales: activeSales.length,
    recentPurchases: completedPurchases.slice(0, 5),
    recentSales: history.sales.slice(0, 5)
  };
};

// Clear all purchase history (for testing or user request)
export const clearPurchaseHistory = (userId: string): boolean => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    
    const allHistory = JSON.parse(stored);
    delete allHistory[userId];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allHistory));
    console.log('Cleared purchase history for user:', userId);
    return true;
  } catch (error) {
    console.error('Error clearing purchase history:', error);
    return false;
  }
};

// Export all purchase data (for debugging or backup)
export const exportPurchaseData = (): string | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored;
  } catch (error) {
    console.error('Error exporting purchase data:', error);
    return null;
  }
};