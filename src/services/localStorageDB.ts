// LocalStorage Database Service
// This simulates a full database until the real API is connected

export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In real app, this would be hashed
  firstName: string;
  lastName: string;
  fullName: string;
  createdAt: string;
  lastLogin: string;
  isActive: boolean;
  role: 'user' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
  };
}

export interface Design {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  seller: string;
  sellerId: string;
  rating: number;
  downloads: number;
  tags: string[];
  technicalSpecs: string;
  instructions: string;
  licenseType: string;
  fileOrigin: string;
  originDeclaration: boolean;
  qualityAssurance: boolean;
  uploadDate: string;
  status: 'active' | 'pending' | 'rejected' | 'draft';
  fileName: string;
  fileSize: string;
  fileType?: string;
  fileURL?: string; // Blob URL for viewing the file
  fileBase64?: string; // Base64 encoded file data for persistence
  color: string;
  icon: string;
  preview?: string;
  views: number;
  likes: number;
}

export interface Purchase {
  id: string;
  buyerId: string;
  designId: string;
  sellerId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  purchaseDate: string;
  downloadCount: number;
  maxDownloads: number;
}

export interface CartItem {
  id: string;
  designId: string;
  userId: string;
  addedDate: string;
  quantity: number;
}

export interface FormSubmission {
  id: string;
  type: 'contact' | 'support' | 'feedback' | 'sell-design' | 'other';
  userId?: string;
  data: any;
  submittedAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

class LocalStorageDB {
  private getStorage<T>(key: string): T[] {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  private setStorage<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============ USER MANAGEMENT ============
  
  async registerUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const users = this.getStorage<User>('users');
    
    // Check if user already exists
    if (users.find(u => u.username === userData.username || u.email === userData.email)) {
      throw new Error('User already exists with this username or email');
    }

    const newUser: User = {
      id: this.generateId(),
      username: userData.username,
      email: userData.email,
      password: userData.password, // In real app, hash this
      firstName: userData.firstName,
      lastName: userData.lastName,
      fullName: `${userData.firstName} ${userData.lastName}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      role: 'user',
      profile: {}
    };

    users.push(newUser);
    this.setStorage('users', users);
    
    // Set current session
    this.setCurrentUser(newUser);
    
    return newUser;
  }

  async loginUser(username: string, password: string): Promise<User> {
    const users = this.getStorage<User>('users');
    const user = users.find(u => 
      (u.username === username || u.email === username) && u.password === password
    );

    if (!user) {
      throw new Error('Invalid username/email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.setStorage('users', users);
    
    // Set current session
    this.setCurrentUser(user);
    
    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    const currentUserId = localStorage.getItem('currentUserId');
    if (!currentUserId) return null;

    const users = this.getStorage<User>('users');
    return users.find(u => u.id === currentUserId) || null;
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('currentUserId', user.id);
      localStorage.setItem('authToken', `token-${user.id}-${Date.now()}`);
    } else {
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('authToken');
    }
  }

  async logoutUser(): Promise<void> {
    this.setCurrentUser(null);
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getStorage<User>('users');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    this.setStorage('users', users);
    
    return users[userIndex];
  }

  // ============ DESIGN MANAGEMENT ============

  async createDesign(designData: Omit<Design, 'id' | 'uploadDate' | 'views' | 'likes'>): Promise<Design> {
    const designs = this.getStorage<Design>('designs');
    
    const newDesign: Design = {
      ...designData,
      id: this.generateId(),
      uploadDate: new Date().toISOString(),
      views: 0,
      likes: 0
    };

    designs.push(newDesign);
    this.setStorage('designs', designs);
    
    return newDesign;
  }

  async getDesigns(filters?: {
    sellerId?: string;
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Design[]> {
    let designs = this.getStorage<Design>('designs');

    if (filters) {
      if (filters.sellerId) {
        designs = designs.filter(d => d.sellerId === filters.sellerId);
      }
      if (filters.category) {
        designs = designs.filter(d => d.category === filters.category);
      }
      if (filters.status) {
        designs = designs.filter(d => d.status === filters.status);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        designs = designs.filter(d => 
          d.name.toLowerCase().includes(search) ||
          d.description.toLowerCase().includes(search) ||
          d.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }
    }

    return designs.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  async getDesignById(id: string): Promise<Design | null> {
    const designs = this.getStorage<Design>('designs');
    return designs.find(d => d.id === id) || null;
  }

  async updateDesign(id: string, updates: Partial<Design>): Promise<Design> {
    const designs = this.getStorage<Design>('designs');
    const designIndex = designs.findIndex(d => d.id === id);
    
    if (designIndex === -1) {
      throw new Error('Design not found');
    }

    designs[designIndex] = { ...designs[designIndex], ...updates };
    this.setStorage('designs', designs);
    
    return designs[designIndex];
  }

  async deleteDesign(id: string): Promise<void> {
    const designs = this.getStorage<Design>('designs');
    const filteredDesigns = designs.filter(d => d.id !== id);
    this.setStorage('designs', filteredDesigns);
  }

  async incrementDesignViews(id: string): Promise<void> {
    const designs = this.getStorage<Design>('designs');
    const design = designs.find(d => d.id === id);
    if (design) {
      design.views++;
      this.setStorage('designs', designs);
    }
  }

  // ============ PURCHASE MANAGEMENT ============

  async createPurchase(purchaseData: Omit<Purchase, 'id' | 'purchaseDate'>): Promise<Purchase> {
    const purchases = this.getStorage<Purchase>('purchases');
    
    const newPurchase: Purchase = {
      ...purchaseData,
      id: this.generateId(),
      purchaseDate: new Date().toISOString()
    };

    purchases.push(newPurchase);
    this.setStorage('purchases', purchases);
    
    // Increment design downloads
    const designs = this.getStorage<Design>('designs');
    const design = designs.find(d => d.id === purchaseData.designId);
    if (design) {
      design.downloads++;
      this.setStorage('designs', designs);
    }
    
    return newPurchase;
  }

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    const purchases = this.getStorage<Purchase>('purchases');
    return purchases.filter(p => p.buyerId === userId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }

  async getSellerSales(sellerId: string): Promise<Purchase[]> {
    const purchases = this.getStorage<Purchase>('purchases');
    return purchases.filter(p => p.sellerId === sellerId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }

  // ============ CART MANAGEMENT ============

  async addToCart(userId: string, designId: string): Promise<CartItem> {
    const cartItems = this.getStorage<CartItem>('cart');
    
    // Check if item already in cart
    const existing = cartItems.find(c => c.userId === userId && c.designId === designId);
    if (existing) {
      existing.quantity++;
      this.setStorage('cart', cartItems);
      return existing;
    }

    const newCartItem: CartItem = {
      id: this.generateId(),
      designId,
      userId,
      addedDate: new Date().toISOString(),
      quantity: 1
    };

    cartItems.push(newCartItem);
    this.setStorage('cart', cartItems);
    
    return newCartItem;
  }

  async getCartItems(userId: string): Promise<CartItem[]> {
    const cartItems = this.getStorage<CartItem>('cart');
    return cartItems.filter(c => c.userId === userId);
  }

  async removeFromCart(userId: string, designId: string): Promise<void> {
    const cartItems = this.getStorage<CartItem>('cart');
    const filtered = cartItems.filter(c => !(c.userId === userId && c.designId === designId));
    this.setStorage('cart', filtered);
  }

  async clearCart(userId: string): Promise<void> {
    const cartItems = this.getStorage<CartItem>('cart');
    const filtered = cartItems.filter(c => c.userId !== userId);
    this.setStorage('cart', filtered);
  }

  // ============ FORM SUBMISSIONS ============

  async submitForm(formData: Omit<FormSubmission, 'id' | 'submittedAt' | 'status'>): Promise<FormSubmission> {
    const submissions = this.getStorage<FormSubmission>('form-submissions');
    
    const newSubmission: FormSubmission = {
      ...formData,
      id: this.generateId(),
      submittedAt: new Date().toISOString(),
      status: 'new'
    };

    submissions.push(newSubmission);
    this.setStorage('form-submissions', submissions);
    
    return newSubmission;
  }

  async getFormSubmissions(filters?: {
    type?: string;
    userId?: string;
    status?: string;
  }): Promise<FormSubmission[]> {
    let submissions = this.getStorage<FormSubmission>('form-submissions');

    if (filters) {
      if (filters.type) {
        submissions = submissions.filter(s => s.type === filters.type);
      }
      if (filters.userId) {
        submissions = submissions.filter(s => s.userId === filters.userId);
      }
      if (filters.status) {
        submissions = submissions.filter(s => s.status === filters.status);
      }
    }

    return submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  // ============ ANALYTICS ============

  async getAnalytics(sellerId: string): Promise<{
    totalRevenue: number;
    totalSales: number;
    totalDesigns: number;
    totalViews: number;
    avgRating: number;
    monthlyRevenue: number[];
    topDesigns: Design[];
  }> {
    const designs = await this.getDesigns({ sellerId });
    const sales = await this.getSellerSales(sellerId);
    
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
    const totalSales = sales.length;
    const totalDesigns = designs.length;
    const totalViews = designs.reduce((sum, design) => sum + design.views, 0);
    const avgRating = designs.length > 0 
      ? designs.reduce((sum, design) => sum + design.rating, 0) / designs.length 
      : 0;

    // Mock monthly revenue (last 12 months)
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const monthSales = sales.filter(sale => {
        const saleDate = new Date(sale.purchaseDate);
        const targetMonth = new Date();
        targetMonth.setMonth(targetMonth.getMonth() - (11 - i));
        return saleDate.getMonth() === targetMonth.getMonth() && 
               saleDate.getFullYear() === targetMonth.getFullYear();
      });
      return monthSales.reduce((sum, sale) => sum + sale.amount, 0);
    });

    const topDesigns = designs
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 5);

    return {
      totalRevenue,
      totalSales,
      totalDesigns,
      totalViews,
      avgRating,
      monthlyRevenue,
      topDesigns
    };
  }

  // ============ INITIALIZATION ============

  async initializeDefaultData(): Promise<void> {
    // Check if already initialized
    if (localStorage.getItem('db-initialized')) return;

    // Create default admin user
    const adminUser: User = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@curfd.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      role: 'admin',
      profile: {
        bio: 'System Administrator'
      }
    };

    // Create demo user
    const demoUser: User = {
      id: 'user-001',
      username: 'demo',
      email: 'demo@example.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
      fullName: 'Demo User',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
      role: 'user',
      profile: {
        bio: 'Demo user for testing'
      }
    };

    this.setStorage('users', [adminUser, demoUser]);

    // Mark as initialized
    localStorage.setItem('db-initialized', 'true');
  }

  // ============ UTILITY METHODS ============

  async clearAllData(): Promise<void> {
    const keys = ['users', 'designs', 'purchases', 'cart', 'form-submissions', 'currentUserId', 'authToken', 'db-initialized'];
    keys.forEach(key => localStorage.removeItem(key));
  }

  async exportData(): Promise<string> {
    const data = {
      users: this.getStorage<User>('users'),
      designs: this.getStorage<Design>('designs'),
      purchases: this.getStorage<Purchase>('purchases'),
      cart: this.getStorage<CartItem>('cart'),
      formSubmissions: this.getStorage<FormSubmission>('form-submissions'),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

// Create singleton instance
export const localDB = new LocalStorageDB();

// Initialize default data when service is imported
localDB.initializeDefaultData();