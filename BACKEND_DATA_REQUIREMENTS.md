# Fluid Simulator Frontend - Backend Data Requirements

## Document Overview

This document provides a complete specification of all data schemas, API endpoints, forms, events, and data entry points in the fluid simulator frontend that need backend support. This serves as a comprehensive guide for backend engineers to design the database schema and API endpoints.

---

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Model Upload & Management](#model-upload--management)
3. [Commerce System (Sales & Purchases)](#commerce-system-sales--purchases)
4. [AI Chatbot System](#ai-chatbot-system)
5. [3D Asset Labeling System](#3d-asset-labeling-system)
6. [Analysis System](#analysis-system)
7. [API Endpoints Summary](#api-endpoints-summary)
8. [Database Schema Recommendations](#database-schema-recommendations)

---

## Authentication System

### User Schema

```typescript
interface User {
    id: number;
    email: string;
    full_name: string;
    is_superuser: boolean;
    is_active: boolean;
}
```

### Authentication Flow Data

#### Login Request

```typescript
// Form data sent as URLSearchParams (OAuth2PasswordRequestForm)
{
  username: string;    // Can be email or username
  password: string;
  grant_type?: string; // Optional: "password"
}
```

#### Registration Request

```typescript
{
    username: string;
    email: string;
    password: string;
    full_name: string;
}
```

#### Authentication Response

```typescript
{
    access_token: string;
    token_type: string; // Usually "bearer"
}
```

### API Endpoints Required

- `POST /login` - User authentication (OAuth2PasswordRequestForm)
- `POST /auth/user` - User registration
- `GET /user/me/` - Get current user profile
- `POST /auth/logout` - User logout

---

## Model Upload & Management

### Model Schema

```typescript
interface UploadedModel {
    id: number;
    name: string;
    file_name: string; // Original filename
    file_size: string; // File size in human readable format
    file_type: string; // File extension/MIME type
    description?: string; // Optional model description
    web_link?: string; // Optional external link
    tags: string[]; // Array of tags for categorization
    thumbnail?: string; // URL/path to thumbnail image
    project_name?: string; // Optional project association
    designer?: string; // Designer/creator name
    revision?: string; // Version/revision info
    units: string; // Measurement units (meters, mm, inches, feet)
    scale_factor: number; // Scaling factor (0.1 - 10.0)
    fluid_density: number; // For CFD analysis
    fluid_viscosity: number; // For CFD analysis
    velocity_inlet?: number; // Optional CFD parameter
    temperature_inlet?: number; // Optional CFD parameter
    pressure_outlet?: number; // Optional CFD parameter
    analysis_status: string; // Status of analysis (pending, running, completed, failed)
    last_opened?: string; // ISO datetime string
    created_at: string; // ISO datetime string
    updated_at: string; // ISO datetime string
    created_by_user_id: number; // Foreign key to User
}
```

### Upload Form Data

```typescript
// Sent as FormData (multipart/form-data)
{
    file: File; // The 3D model file
    name: string; // Model name
    description: string; // Model description
    tags: string; // JSON stringified array of tags
    project_name: string; // Optional project name
    designer: string; // Optional designer name
    revision: string; // Optional revision
    units: string; // meters|millimeters|inches|feet
    scale_factor: string; // Number as string
    components: string; // JSON stringified array (empty for now)
}
```

### Component Schema

```typescript
interface Component {
    id: number;
    model_id: number; // Foreign key to UploadedModel
    name: string; // Component name
    component_type: string; // Type of component
    material?: string; // Optional material info
    color?: string; // Optional color info
    dimensions?: string; // Optional dimensions
    properties?: Record<string, any>; // Flexible properties object
    created_at: string; // ISO datetime string
}
```

### API Endpoints Required

- `POST /upload` - Upload new 3D model (multipart/form-data)
- `GET /models/?limit={limit}&offset={offset}` - Get all models with pagination
- `GET /models/{modelId}` - Get single model details
- `GET /models/{modelId}/download` - Download model file (returns blob)
- `PUT /models/{modelId}/status` - Update model status (admin only)
- `DELETE /models/{modelId}` - Delete model (admin only)
- `POST /models/{modelId}/components` - Create component for model
- `GET /models/{modelId}/components` - Get components for model
- `PUT /components/{componentId}` - Update component

---

## Commerce System (Sales & Purchases)

### Design Asset for Sale Schema

```typescript
interface DesignAsset {
    id: string;
    name: string;
    description: string;
    price: number; // Price in USD
    category: string; // aerospace|automotive|mechanical|architecture|industrial|other
    status: "active" | "draft" | "sold" | "paused";
    sales: number; // Number of sales
    revenue: number; // Total revenue generated
    uploadDate: string; // ISO datetime
    lastModified: string; // ISO datetime
    views: number; // View count
    likes: number; // Like count
    seller_id: number; // Foreign key to User
    original_model_id?: number; // Optional FK to UploadedModel
}
```

### Sell Design Form Data

```typescript
interface SellDesignFormData {
    designName: string;
    description: string;
    price: string; // Number as string
    category: string; // Dropdown selection
    fileOrigin: string; // original|modified|commissioned
    licenseType: string; // commercial|personal|attribution|non-commercial
    originDeclaration: boolean; // Legal checkbox
    qualityAssurance: boolean; // Legal checkbox
    technicalSpecs: string; // Optional technical details
    tags: string; // Comma-separated tags
    instructions: string; // Optional usage instructions
}
```

### Sales Transaction Schema

```typescript
interface SalesData {
    id: string;
    design_id: string; // Foreign key to DesignAsset
    design_name: string; // Cached design name
    buyer_id: number; // Foreign key to User
    buyer_email: string; // Cached buyer email
    price: number; // Sale price in USD
    date: string; // ISO datetime
    status: "completed" | "pending" | "refunded";
    transaction_id?: string; // Payment processor transaction ID
    commission_rate: number; // Platform commission percentage
    seller_earnings: number; // Amount after commission
}
```

### Cart System Schema

```typescript
interface CartItem {
    id: string;
    user_id: number; // Foreign key to User
    design_id: string; // Foreign key to DesignAsset
    name: string; // Cached design name
    price: number; // Current price
    originalPrice?: number; // Original price if discounted
    size: string; // File size info
    color: string; // UI color for display
    icon: string; // FontAwesome icon class
    quantity: number; // Quantity in cart
    added_at: string; // ISO datetime
}
```

### Payout System Schema

```typescript
interface PayoutData {
    id: string;
    seller_id: number; // Foreign key to User
    amount: number; // Payout amount
    status: "pending" | "processing" | "completed" | "failed";
    request_date: string; // ISO datetime
    processed_date?: string; // ISO datetime when processed
    method: string; // PayPal|Bank Transfer|etc
    fees: number; // Processing fees
    net_amount: number; // Amount after fees
    payout_account?: string; // Masked payment method info
}
```

### API Endpoints Required

- `POST /designs` - List new design for sale
- `GET /designs?category={cat}&limit={limit}&offset={offset}` - Browse designs
- `GET /designs/{designId}` - Get design details
- `POST /cart/add` - Add item to cart
- `GET /cart` - Get user's cart items
- `PUT /cart/{itemId}` - Update cart item quantity
- `DELETE /cart/{itemId}` - Remove from cart
- `POST /checkout` - Process purchase
- `GET /sales/history` - Get seller's sales history
- `POST /payouts/request` - Request payout
- `GET /payouts/history` - Get payout history

---

## AI Chatbot System

### Chat Message Schema

```typescript
interface ChatMessage {
    type: "user" | "ai";
    content: string;
    time: string; // Formatted time string
    file?: FileData; // Optional attached file
}

interface FileData {
    name: string;
    color: string; // UI color
    icon: string; // FontAwesome icon
    size?: string; // Human readable size
    file?: File; // Browser File object
}
```

### AI Adapter Configuration

```typescript
interface AIAdapterOptions {
    apiUrl?: string; // Custom API URL
    apiKey?: string; // API key for AI service
    model?: string; // Model identifier
}

interface AIMessage {
    role: "user" | "assistant" | "system";
    content: string;
}
```

### Supported AI Models

- `gpt-4-turbo` - OpenAI GPT-4 Turbo
- `claude-3.5` - Anthropic Claude 3.5
- `gemini-pro` - Google Gemini Pro
- `openfoam` - OpenFOAM integration (planned)

### Chat Persistence Schema (Optional)

```typescript
interface ChatSession {
    id: string;
    user_id: number; // Foreign key to User
    model_id?: number; // Optional FK to UploadedModel if analyzing specific model
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
}

interface ChatHistory {
    id: string;
    session_id: string; // Foreign key to ChatSession
    message_type: "user" | "ai";
    content: string;
    file_name?: string; // If file was attached
    file_data?: string; // Base64 encoded file data
    timestamp: string; // ISO datetime
}
```

### API Endpoints Required (Optional)

- `POST /chat/sessions` - Create new chat session
- `GET /chat/sessions` - Get user's chat sessions
- `POST /chat/sessions/{sessionId}/messages` - Send message
- `GET /chat/sessions/{sessionId}/messages` - Get chat history

---

## 3D Asset Labeling System

### Label Schema

```typescript
interface AssetLabel {
    id: string;
    model_id: number; // Foreign key to UploadedModel
    position: [number, number, number]; // 3D coordinates [x, y, z]
    text: string; // Label text
    category: string; // Material|Part|Function|Texture|Dimension|Other
    created_by: number; // Foreign key to User
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
}
```

### AI Suggestion System

```typescript
interface AISuggestion {
    text: string; // Suggested label text
    category: string; // Suggested category
    confidence?: number; // AI confidence score (0-1)
}
```

### API Endpoints Required

- `POST /models/{modelId}/labels` - Create new label
- `GET /models/{modelId}/labels` - Get all labels for model
- `PUT /labels/{labelId}` - Update label
- `DELETE /labels/{labelId}` - Delete label
- `POST /models/{modelId}/ai-suggestions` - Get AI label suggestions

---

## Analysis System

### Analysis Result Schema

```typescript
interface AnalysisResult {
    id: number;
    component_id: number; // Foreign key to Component
    analysis_type: string; // CFD|Structural|Thermal|etc
    result_data: Record<string, any>; // Flexible JSON object for results
    status: string; // pending|running|completed|failed
    created_at: string; // ISO datetime
    completed_at?: string; // ISO datetime when completed
    error_message?: string; // Error details if failed
}
```

### API Endpoints Required

- `POST /analysis/results` - Create new analysis result
- `GET /components/{componentId}/analysis` - Get analysis results for component
- `PUT /analysis/{analysisId}` - Update analysis result

---

## API Endpoints Summary

### Authentication

- `POST /login` - User login (OAuth2PasswordRequestForm)
- `POST /auth/user` - User registration
- `GET /user/me/` - Get current user profile
- `POST /auth/logout` - User logout

### Model Management

- `POST /upload` - Upload 3D model (multipart/form-data)
- `GET /models/` - List models with pagination
- `GET /models/{id}` - Get model details
- `GET /models/{id}/download` - Download model file
- `PUT /models/{id}/status` - Update model status
- `DELETE /models/{id}` - Delete model

### Components & Analysis

- `POST /models/{id}/components` - Create component
- `GET /models/{id}/components` - Get model components
- `PUT /components/{id}` - Update component
- `POST /analysis/results` - Create analysis result
- `GET /components/{id}/analysis` - Get component analysis

### Commerce (Optional Phase 2)

- `POST /designs` - List design for sale
- `GET /designs` - Browse marketplace
- `POST /cart/add` - Add to cart
- `GET /cart` - Get cart
- `POST /checkout` - Process purchase
- `GET /sales/history` - Sales history
- `POST /payouts/request` - Request payout

### Asset Labeling (Optional Phase 2)

- `POST /models/{id}/labels` - Create label
- `GET /models/{id}/labels` - Get model labels
- `PUT /labels/{id}` - Update label
- `DELETE /labels/{id}` - Delete label

---

## Database Schema Recommendations

### Core Tables (Phase 1 - MVP)

#### users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### uploaded_models

```sql
CREATE TABLE uploaded_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size VARCHAR(50),
    file_type VARCHAR(100),
    description TEXT,
    web_link VARCHAR(500),
    tags JSONB DEFAULT '[]',
    thumbnail VARCHAR(500),
    project_name VARCHAR(255),
    designer VARCHAR(255),
    revision VARCHAR(100),
    units VARCHAR(50) DEFAULT 'meters',
    scale_factor DECIMAL(5,2) DEFAULT 1.0,
    fluid_density DECIMAL(10,4),
    fluid_viscosity DECIMAL(10,6),
    velocity_inlet DECIMAL(10,4),
    temperature_inlet DECIMAL(10,4),
    pressure_outlet DECIMAL(10,4),
    analysis_status VARCHAR(50) DEFAULT 'pending',
    last_opened TIMESTAMP,
    created_by_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### components

```sql
CREATE TABLE components (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES uploaded_models(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    component_type VARCHAR(100),
    material VARCHAR(255),
    color VARCHAR(50),
    dimensions VARCHAR(255),
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### analysis_results

```sql
CREATE TABLE analysis_results (
    id SERIAL PRIMARY KEY,
    component_id INTEGER REFERENCES components(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL,
    result_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

### Extended Tables (Phase 2 - Full Features)

#### design_assets (Commerce)

```sql
CREATE TABLE design_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    sales INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    seller_id INTEGER REFERENCES users(id),
    original_model_id INTEGER REFERENCES uploaded_models(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### asset_labels (3D Labeling)

```sql
CREATE TABLE asset_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id INTEGER REFERENCES uploaded_models(id) ON DELETE CASCADE,
    position_x DECIMAL(10,6),
    position_y DECIMAL(10,6),
    position_z DECIMAL(10,6),
    text VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

```sql
-- Essential indexes
CREATE INDEX idx_models_user_id ON uploaded_models(created_by_user_id);
CREATE INDEX idx_models_status ON uploaded_models(analysis_status);
CREATE INDEX idx_components_model_id ON components(model_id);
CREATE INDEX idx_analysis_component_id ON analysis_results(component_id);
CREATE INDEX idx_design_assets_seller ON design_assets(seller_id);
CREATE INDEX idx_labels_model_id ON asset_labels(model_id);

-- Full-text search indexes
CREATE INDEX idx_models_search ON uploaded_models USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_designs_search ON design_assets USING gin(to_tsvector('english', name || ' ' || description));
```

---

## File Storage Requirements

### File Types Supported

- **3D Models**: `.stl`, `.obj`, `.glb`, `.gltf`, `.step`, `.stp`
- **Thumbnails**: `.jpg`, `.png`, `.webp`
- **Analysis Results**: Various formats depending on analysis type

### Storage Structure Recommendation

```
/uploads/
  /models/
    /{user_id}/
      /{model_id}/
        /original/     # Original uploaded file
        /processed/    # Processed/converted files
        /thumbnails/   # Generated thumbnails
        /analysis/     # Analysis result files
```

### Storage Requirements

- Implement file size limits (recommend 100MB max per upload)
- Generate thumbnails automatically for 3D models
- Implement virus scanning for uploaded files
- Consider CDN for file delivery
- Implement backup strategy for user uploads

---

## Security Considerations

### Authentication

- Implement JWT token-based authentication
- Token expiration and refresh mechanisms
- Rate limiting on login attempts
- Password strength requirements

### File Upload Security

- File type validation (MIME type + extension)
- File size limits
- Virus/malware scanning
- Sandboxed file processing
- Input sanitization for all form fields

### API Security

- Authentication required for all user-specific endpoints
- Role-based access control (regular users vs superusers)
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention (use parameterized queries)

### Data Privacy

- GDPR compliance for user data
- User data export functionality
- Account deletion with data cleanup
- Secure handling of payment information (if implementing commerce)

---

## Performance Considerations

### Database Optimization

- Proper indexing strategy (see indexes above)
- Connection pooling
- Query optimization
- Consider read replicas for scaling

### File Handling

- Asynchronous file processing
- Background job queue for analysis
- CDN for static file delivery
- Thumbnail generation pipeline

### Caching Strategy

- Redis/Memcached for session storage
- API response caching for frequently accessed data
- File metadata caching

---

## Deployment Notes

### Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Authentication
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Storage
UPLOAD_PATH=/path/to/uploads
MAX_UPLOAD_SIZE=104857600  # 100MB

# Optional: AI Integration
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GEMINI_API_KEY=your-gemini-key

# Optional: Cloud Storage
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=your-bucket-name
```

### Recommended Tech Stack

- **Backend Framework**: FastAPI (Python) or Express.js (Node.js)
- **Database**: PostgreSQL with JSONB support
- **File Storage**: Local filesystem or AWS S3/MinIO
- **Authentication**: JWT tokens
- **Task Queue**: Celery (Python) or Bull (Node.js) for background processing
- **Caching**: Redis
- **API Documentation**: Automatic with FastAPI/Swagger

This document provides a complete specification for implementing the backend systems to support all frontend functionality. The schemas can be implemented in phases, starting with the core authentication and model management features, then adding commerce and advanced features as needed.
