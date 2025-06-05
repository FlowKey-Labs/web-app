# Booking Links Feature - Implementation Plan & Project Breakdown

## Table of Contents
1. [Overview](#overview)
2. [Technical Architecture](#technical-architecture)
3. [Database Schema](#database-schema)
4. [API Specifications](#api-specifications)
5. [Frontend Implementation](#frontend-implementation)
6. [Project Breakdown for JIRA](#project-breakdown-for-jira)
7. [Implementation Timeline](#implementation-timeline)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)

## Overview

### Feature Summary
Enable Flowkey users to generate persistent booking links that clients can use to book available time slots directly. The system supports multiple services, approval workflows, and automatic calendar integration.

### Key Requirements
- **Single persistent link** per business: `https://flowkeylabs.com/book/[business_slug]`
- **Multiple service support** within one link
- **Approval workflow** (optional, configurable)
- **Buffer time management** between sessions
- **Email notifications** and calendar integration
- **Time zone awareness** for global clients

### URL Structure
```
Primary: https://flowkeylabs.com/book/[business_slug]
Alternative: https://flowkeylabs.com/[business_slug]/book
```

## Technical Architecture

### System Integration Points
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Public Client │ →  │  Booking API    │ →  │  Existing Core  │
│   (No Auth)     │    │  (New Module)   │    │  (Sessions/etc) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Public   │    │   Django API    │    │   PostgreSQL    │
│  Booking Pages  │    │   Endpoints     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack Additions
- **Async Tasks**: Celery + Redis (for notifications)
- **Caching**: Redis (for availability calculation)
- **Email**: Existing SendGrid integration
- **Calendar**: Google Calendar API

## Database Schema

### New Tables

```sql
-- Booking configuration per business
CREATE TABLE booking_settings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES business_businessprofile(id) UNIQUE,
    requires_approval BOOLEAN DEFAULT FALSE,
    buffer_time_minutes INTEGER DEFAULT 15,
    booking_expiry_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT TRUE,
    auto_approve_returning_clients BOOLEAN DEFAULT FALSE,
    max_advance_booking_days INTEGER DEFAULT 30,
    min_advance_booking_hours INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual booking requests
CREATE TABLE booking_requests (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES session_session(id),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(20),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, expired, cancelled
    rejection_reason TEXT,
    booking_reference VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users_user(id),
    
    CONSTRAINT email_or_phone_required CHECK (
        client_email IS NOT NULL OR client_phone IS NOT NULL
    )
);

-- Notification tracking
CREATE TABLE booking_notifications (
    id SERIAL PRIMARY KEY,
    booking_request_id INTEGER REFERENCES booking_requests(id),
    user_id INTEGER REFERENCES users_user(id),
    type VARCHAR(50) NOT NULL, -- booking_request, booking_approved, booking_rejected
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table modifications
ALTER TABLE business_businessprofile ADD COLUMN slug VARCHAR(100) UNIQUE;
ALTER TABLE session_session ADD COLUMN is_bookable BOOLEAN DEFAULT TRUE;
ALTER TABLE session_session ADD COLUMN booking_deadline_hours INTEGER DEFAULT 24;

-- Indexes for performance
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_booking_requests_session ON booking_requests(session_id);
CREATE INDEX idx_booking_requests_expires ON booking_requests(expires_at);
CREATE INDEX idx_business_slug ON business_businessprofile(slug);
CREATE INDEX idx_session_bookable ON session_session(is_bookable, date);
CREATE INDEX idx_notifications_user_read ON booking_notifications(user_id, read_at);
```

## API Specifications

### Public Endpoints (No Authentication)

```python
# GET /api/booking/public/{business_slug}/
# Returns business info and booking settings
{
    "business": {
        "name": "Swim School Pro",
        "description": "Professional swimming lessons",
        "address": "123 Pool Street",
        "phone": "+1234567890",
        "email": "info@swimschool.com"
    },
    "settings": {
        "requires_approval": false,
        "buffer_time_minutes": 15,
        "is_active": true
    }
}

# GET /api/booking/public/{business_slug}/services/
# Returns available services
[
    {
        "id": 1,
        "name": "Private Swimming Lesson",
        "description": "One-on-one instruction",
        "duration_minutes": 60,
        "capacity": 1,
        "price": "50.00"
    }
]

# GET /api/booking/public/{business_slug}/availability/
# Query params: service_id, start_date, end_date
# Returns available time slots
{
    "2024-02-01": [
        {
            "start_time": "09:00",
            "end_time": "10:00",
            "available_spots": 1,
            "session_id": 123
        }
    ]
}

# POST /api/booking/public/{business_slug}/book/
# Creates booking request
{
    "session_id": 123,
    "client_name": "John Doe",
    "client_email": "john@example.com",
    "client_phone": "+1234567890",
    "notes": "First time swimmer"
}
```

### Admin Endpoints (Authenticated)

```python
# GET/PUT /api/booking/settings/
# Booking configuration for business

# GET /api/booking/requests/
# List booking requests with filters

# POST /api/booking/requests/{id}/approve/
# Approve booking request

# POST /api/booking/requests/{id}/reject/
# Reject booking request with reason

# GET /api/booking/link/
# Get business booking link URL
```

## Frontend Implementation

### New Components Structure

```
src/
├── pages/
│   └── PublicBooking/
│       ├── PublicBookingPage.tsx      # Main container
│       ├── BusinessHeader.tsx         # Business branding
│       ├── ServiceSelection.tsx       # Service picker
│       ├── AvailabilityCalendar.tsx   # Time slot selection
│       ├── BookingForm.tsx           # Client details form
│       ├── ConfirmationPage.tsx      # Success state
│       └── hooks/
│           ├── usePublicBooking.ts    # Booking logic
│           ├── useAvailability.ts     # Availability data
│           └── useServices.ts         # Service data
├── components/
│   ├── booking/
│   │   ├── BookingSettings.tsx        # Admin settings
│   │   ├── BookingRequests.tsx        # Admin request list
│   │   ├── BookingApproval.tsx        # Approval modal
│   │   └── BookingLinkGenerator.tsx   # Link sharing
│   └── notifications/
│       └── BookingNotifications.tsx   # Notification center
└── api/
    └── bookingApi.ts                  # API calls
```

### Key React Components

```typescript
// PublicBookingPage.tsx - Main booking flow
const PublicBookingPage = () => {
    const { businessSlug } = useParams<{ businessSlug: string }>();
    const [currentStep, setCurrentStep] = useState<'service' | 'time' | 'form'>('service');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

    return (
        <PublicBookingContainer>
            <BusinessHeader businessSlug={businessSlug} />
            <ProgressIndicator currentStep={currentStep} />
            
            {currentStep === 'service' && (
                <ServiceSelection 
                    businessSlug={businessSlug}
                    onServiceSelect={(service) => {
                        setSelectedService(service);
                        setCurrentStep('time');
                    }}
                />
            )}
            
            {currentStep === 'time' && selectedService && (
                <AvailabilityCalendar
                    businessSlug={businessSlug}
                    serviceId={selectedService.id}
                    onSlotSelect={(slot) => {
                        setSelectedSlot(slot);
                        setCurrentStep('form');
                    }}
                />
            )}
            
            {currentStep === 'form' && selectedService && selectedSlot && (
                <BookingForm
                    businessSlug={businessSlug}
                    service={selectedService}
                    slot={selectedSlot}
                />
            )}
        </PublicBookingContainer>
    );
};

// BookingSettings.tsx - Admin configuration
const BookingSettings = () => {
    const { data: settings, mutate } = useBookingSettings();
    const bookingUrl = `${window.location.origin}/book/${settings?.business_slug}`;

    return (
        <Card>
            <Title order={3}>Booking Link Settings</Title>
            
            <Stack spacing="md">
                <Switch
                    label="Enable booking link"
                    checked={settings?.is_active}
                    onChange={(event) => mutate({ is_active: event.currentTarget.checked })}
                />
                
                <Switch
                    label="Require approval for new bookings"
                    checked={settings?.requires_approval}
                    onChange={(event) => mutate({ requires_approval: event.currentTarget.checked })}
                />
                
                <NumberInput
                    label="Buffer time between sessions (minutes)"
                    value={settings?.buffer_time_minutes}
                    onChange={(value) => mutate({ buffer_time_minutes: value })}
                />
                
                <Group>
                    <TextInput
                        label="Your booking link"
                        value={bookingUrl}
                        readOnly
                        style={{ flexGrow: 1 }}
                    />
                    <CopyButton value={bookingUrl}>
                        {({ copied, copy }) => (
                            <Button onClick={copy} color={copied ? 'green' : 'blue'}>
                                {copied ? 'Copied!' : 'Copy Link'}
                            </Button>
                        )}
                    </CopyButton>
                </Group>
            </Stack>
        </Card>
    );
};
```

## Project Breakdown for JIRA

### Epic: Booking Links Feature
**Epic Key**: FL-100
**Description**: Enable businesses to share persistent booking links for client self-service booking

---

### Story 1: Database Foundation
**Story Key**: FL-101
**Story Points**: 8
**Description**: Create database schema and models for booking functionality

#### Subtasks:
- **FL-101-1**: Create booking_settings table and model (2 SP)
- **FL-101-2**: Create booking_requests table and model (2 SP)
- **FL-101-3**: Create booking_notifications table and model (2 SP)
- **FL-101-4**: Add business slug field and migration (1 SP)
- **FL-101-5**: Add session booking fields and migration (1 SP)

**Acceptance Criteria**:
- [ ] All new tables created with proper relationships
- [ ] Business slug auto-generated for existing businesses
- [ ] Migrations run successfully on test environment
- [ ] Database indexes created for performance

---

### Story 2: Backend API Infrastructure
**Story Key**: FL-102
**Story Points**: 13
**Description**: Implement Django REST API endpoints for booking functionality

#### Subtasks:
- **FL-102-1**: Create booking Django app structure (1 SP)
- **FL-102-2**: Implement booking settings CRUD API (3 SP)
- **FL-102-3**: Implement public business info API (2 SP)
- **FL-102-4**: Implement public services listing API (2 SP)
- **FL-102-5**: Implement availability calculation API (3 SP)
- **FL-102-6**: Implement booking submission API (2 SP)

**Acceptance Criteria**:
- [ ] All API endpoints return correct data structures
- [ ] Public endpoints work without authentication
- [ ] Proper error handling and validation
- [ ] API documentation updated

---

### Story 3: Availability Calculation Engine
**Story Key**: FL-103
**Story Points**: 8
**Description**: Build smart availability calculation considering buffer times and existing bookings

#### Subtasks:
- **FL-103-1**: Design availability calculation algorithm (2 SP)
- **FL-103-2**: Implement buffer time logic (2 SP)
- **FL-103-3**: Handle multi-day availability queries (2 SP)
- **FL-103-4**: Add Redis caching for performance (2 SP)

**Acceptance Criteria**:
- [ ] Correctly calculates available slots with buffer time
- [ ] Handles timezone conversions properly
- [ ] Performance under 500ms for 7-day queries
- [ ] Cache invalidation works correctly

---

### Story 4: Public Booking Interface
**Story Key**: FL-104
**Story Points**: 21
**Description**: Create public-facing booking pages for clients

#### Subtasks:
- **FL-104-1**: Create public booking page routing (2 SP)
- **FL-104-2**: Build business header component (2 SP)
- **FL-104-3**: Build service selection component (3 SP)
- **FL-104-4**: Build availability calendar component (5 SP)
- **FL-104-5**: Build booking form component (4 SP)
- **FL-104-6**: Build confirmation page component (2 SP)
- **FL-104-7**: Implement responsive design (3 SP)

**Acceptance Criteria**:
- [ ] Clean, professional booking flow
- [ ] Mobile-responsive design
- [ ] Form validation and error handling
- [ ] Accessible to users with disabilities
- [ ] Works without user authentication

---

### Story 5: Admin Booking Management
**Story Key**: FL-105
**Story Points**: 13
**Description**: Add booking management features to admin dashboard

#### Subtasks:
- **FL-105-1**: Add booking settings to profile page (3 SP)
- **FL-105-2**: Create booking requests dashboard (4 SP)
- **FL-105-3**: Build approval/rejection interface (3 SP)
- **FL-105-4**: Add booking link generator (2 SP)
- **FL-105-5**: Integrate with existing navigation (1 SP)

**Acceptance Criteria**:
- [ ] Admins can configure booking settings
- [ ] Booking requests visible in dashboard
- [ ] One-click approve/reject functionality
- [ ] Easy booking link sharing
- [ ] Proper permission controls

---

### Story 6: Notification System
**Story Key**: FL-106
**Story Points**: 8
**Description**: Implement notification system for booking events

#### Subtasks:
- **FL-106-1**: Create notification data models (2 SP)
- **FL-106-2**: Build in-app notification component (3 SP)
- **FL-106-3**: Implement email notification system (3 SP)

**Acceptance Criteria**:
- [ ] Admins receive notifications for new bookings
- [ ] Clients receive email confirmations
- [ ] Notification preferences configurable
- [ ] Email templates are professional

---

### Story 7: Approval Workflow
**Story Key**: FL-107
**Story Points**: 8
**Description**: Implement booking approval/rejection workflow

#### Subtasks:
- **FL-107-1**: Build approval API endpoints (2 SP)
- **FL-107-2**: Implement booking expiry logic (2 SP)
- **FL-107-3**: Create rejection reason interface (2 SP)
- **FL-107-4**: Add approval notification emails (2 SP)

**Acceptance Criteria**:
- [ ] Bookings can be approved/rejected
- [ ] Expired bookings cleaned up automatically
- [ ] Clients notified of approval decisions
- [ ] Rejection reasons captured and sent

---

### Story 8: Calendar Integration
**Story Key**: FL-108
**Story Points**: 5
**Description**: Add Google Calendar integration for confirmed bookings

#### Subtasks:
- **FL-108-1**: Generate Google Calendar links (2 SP)
- **FL-108-2**: Add calendar buttons to emails (2 SP)
- **FL-108-3**: Test calendar integration (1 SP)

**Acceptance Criteria**:
- [ ] Clients can add bookings to Google Calendar
- [ ] Calendar links include all booking details
- [ ] Works across different time zones

---

### Story 9: Async Task System
**Story Key**: FL-109
**Story Points**: 8
**Description**: Implement Celery for background task processing

#### Subtasks:
- **FL-109-1**: Set up Celery and Redis infrastructure (3 SP)
- **FL-109-2**: Create email sending tasks (2 SP)
- **FL-109-3**: Create notification tasks (2 SP)
- **FL-109-4**: Add scheduled cleanup tasks (1 SP)

**Acceptance Criteria**:
- [ ] Email sending happens asynchronously
- [ ] Background tasks don't block web requests
- [ ] Failed tasks retry appropriately
- [ ] Task monitoring available

---

### Story 10: Testing & Quality Assurance
**Story Key**: FL-110
**Story Points**: 13
**Description**: Comprehensive testing of booking functionality

#### Subtasks:
- **FL-110-1**: Write backend API tests (4 SP)
- **FL-110-2**: Write frontend component tests (4 SP)
- **FL-110-3**: Write integration tests (3 SP)
- **FL-110-4**: Performance testing (2 SP)

**Acceptance Criteria**:
- [ ] 90%+ code coverage for new functionality
- [ ] All user flows tested end-to-end
- [ ] Performance requirements met
- [ ] Security testing completed

---

### Story 11: Documentation & Deployment
**Story Key**: FL-111
**Story Points**: 5
**Description**: Documentation and production deployment

#### Subtasks:
- **FL-111-1**: Update API documentation (1 SP)
- **FL-111-2**: Create user guides (2 SP)
- **FL-111-3**: Production deployment scripts (1 SP)
- **FL-111-4**: Monitoring setup (1 SP)

**Acceptance Criteria**:
- [ ] Complete API documentation
- [ ] User guide for booking setup
- [ ] Smooth production deployment
- [ ] Monitoring alerts configured

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
**Stories**: FL-101, FL-102, FL-103
**Deliverables**: 
- Database schema in place
- Core API endpoints functional
- Availability calculation working

### Phase 2: User Interface (Weeks 3-4)
**Stories**: FL-104, FL-105
**Deliverables**:
- Public booking pages functional
- Admin interface integrated
- Basic booking flow working

### Phase 3: Advanced Features (Weeks 5-6)
**Stories**: FL-106, FL-107, FL-108
**Deliverables**:
- Notification system active
- Approval workflow complete
- Calendar integration working

### Phase 4: Production Ready (Weeks 7-8)
**Stories**: FL-109, FL-110, FL-111
**Deliverables**:
- Async task system deployed
- Comprehensive testing complete
- Production deployment successful

---

## Testing Strategy

### Unit Tests
```python
# Backend tests
class TestBookingAvailability(TestCase):
    def test_availability_calculation_with_buffer(self):
        # Test availability calculation considers buffer time
        pass
    
    def test_booking_approval_workflow(self):
        # Test complete approval process
        pass

# Frontend tests
describe('Public Booking Flow', () => {
    test('completes full booking process', () => {
        // Test end-to-end booking flow
    });
});
```

### Integration Tests
- Complete booking flow from link click to confirmation
- Admin approval workflow
- Email notification delivery
- Calendar integration functionality

### Performance Tests
- Availability calculation under load
- Database query optimization
- Cache effectiveness
- API response times

---

## Deployment Guide

### Prerequisites
- Redis server for caching and Celery
- Email service configured (SendGrid)
- Google Calendar API access (future)

### Environment Variables
```bash
# New environment variables needed
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
BOOKING_BASE_URL=https://flowkeylabs.com
GOOGLE_CALENDAR_API_KEY=your_api_key
```

### Deployment Steps
1. **Database Migration**: Run booking app migrations
2. **Redis Setup**: Configure Redis for caching and tasks
3. **Celery Workers**: Start Celery worker processes
4. **Environment Config**: Set new environment variables
5. **Static Files**: Collect and deploy new static assets
6. **DNS/CDN**: Ensure booking URLs route correctly

### Monitoring
- **API Performance**: Monitor booking endpoint response times
- **Background Tasks**: Monitor Celery task queue health
- **Cache Hit Rates**: Monitor Redis cache effectiveness
- **Email Delivery**: Monitor email sending success rates

### Rollback Plan
- Database migrations are backward compatible
- Feature flags to disable booking functionality
- Fallback to manual booking process if needed

---

## Risk Mitigation

### Technical Risks
1. **Performance Issues**: Mitigated by Redis caching and database optimization
2. **High Load**: Mitigated by async task processing and rate limiting
3. **Data Conflicts**: Mitigated by proper locking and validation

### Business Risks
1. **User Adoption**: Mitigated by gradual rollout and user training
2. **Support Load**: Mitigated by comprehensive documentation and testing
3. **Integration Issues**: Mitigated by thorough testing of existing functionality

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Next Review: [Implementation Start Date]* 