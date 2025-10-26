// Quick test script to demonstrate localStorage database functionality
// Run in browser console to test the localDB

import { localDB } from './services/localStorageDB.js';

// Test function to demonstrate all features
async function testLocalDB() {
    console.log('🚀 Testing localStorage Database...');
    
    try {
        // 1. Test user registration
        console.log('\n1. Testing User Registration...');
        const newUser = await localDB.registerUser({
            firstName: 'John',
            lastName: 'Designer',
            username: 'johndesigner',
            email: 'john@example.com',
            password: 'password123'
        });
        console.log('✅ User registered:', newUser.username);
        
        // 2. Test user login
        console.log('\n2. Testing User Login...');
        const loggedInUser = await localDB.loginUser('john@example.com', 'password123');
        console.log('✅ User logged in:', loggedInUser.username);
        
        // 3. Test design creation
        console.log('\n3. Testing Design Creation...');
        const designData = {
            name: 'Test Cooling System',
            description: 'A test cooling system design',
            price: 25.99,
            originalPrice: 29.99,
            category: 'Cooling Systems',
            seller: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
            sellerId: loggedInUser.id,
            rating: 0,
            downloads: 0,
            tags: ['cooling', 'system', 'test'],
            technicalSpecs: 'Advanced cooling specs',
            instructions: 'Installation instructions',
            licenseType: 'Commercial',
            fileOrigin: 'original',
            originDeclaration: true,
            qualityAssurance: true,
            status: 'active',
            fileName: 'cooling-system.stl',
            fileSize: '2.5 MB',
            color: '#4CAF50',
            icon: 'fas fa-cube',
            preview: '/test-preview.jpg'
        };
        
        const newDesign = await localDB.createDesign(designData);
        console.log('✅ Design created:', newDesign.name);
        
        // 4. Test getting all designs
        console.log('\n4. Testing Design Retrieval...');
        const allDesigns = await localDB.getDesigns();
        console.log(`✅ Found ${allDesigns.length} designs in marketplace`);
        
        // 5. Test analytics
        console.log('\n5. Testing Analytics...');
        const analytics = await localDB.getUserAnalytics(loggedInUser.id);
        console.log('✅ User analytics:', {
            designsCount: analytics.totalDesigns,
            totalRevenue: analytics.totalRevenue,
            totalViews: analytics.totalViews
        });
        
        // 6. Test logout
        console.log('\n6. Testing User Logout...');
        await localDB.logoutUser();
        console.log('✅ User logged out successfully');
        
        console.log('\n🎉 All tests passed! localStorage database is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Instructions for testing
console.log(`
📋 localStorage Database Test Instructions:

1. Open browser dev tools (F12)
2. Go to Console tab
3. Copy and paste this function, then run: testLocalDB()

Or test individual features:
- localDB.registerUser({...})
- localDB.loginUser(email, password)
- localDB.createDesign({...})
- localDB.getDesigns()
- localDB.getCurrentUser()
- localDB.logoutUser()

Check Application > Local Storage to see the data!
`);

// Export for use
if (typeof module !== 'undefined') {
    module.exports = { testLocalDB };
}