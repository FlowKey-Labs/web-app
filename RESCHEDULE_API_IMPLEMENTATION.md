# Booking Reschedule & Enhanced Cancellation API Implementation

## 🚀 Implementation Status: COMPLETE ✅

### Recent Updates:
- ✅ **Database Schema**: All reschedule fields added to models
- ✅ **Email Templates**: Professional reschedule templates created  
- ✅ **Slot Management Fixed**: Cancelled/deleted bookings now properly free up slots
- ✅ **Bidirectional Notifications**: Both client→admin and admin→client emails working
- ✅ **API Endpoints**: All reschedule and enhanced cancellation endpoints implemented

---

## 1. API Endpoints Overview

### Admin Reschedule Endpoints
```
PATCH /api/booking/manage/{booking_id}/
```

### Client Self-Service Endpoints  
```
GET    /api/booking/client/{booking_reference}/
POST   /api/booking/client/{booking_reference}/cancel/
GET    /api/booking/client/{booking_reference}/reschedule-options/
POST   /api/booking/client/{booking_reference}/reschedule/
```

### Booking Settings
```
GET    /api/booking/settings/
PATCH  /api/booking/settings/
```

---

## 2. Admin Reschedule API

### Admin Reschedule Booking
**Endpoint:** `PATCH /api/booking/manage/{booking_id}/`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Payload:**
```json
{
    "action": "reschedule",
    "new_session_id": 123,
    "reason": "Session time needed to be adjusted due to instructor availability"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Booking rescheduled successfully",
    "booking_reference": "BK240531001",
    "old_session": {
        "id": 5,
        "title": "Morning Yoga",
        "start_time": "2024-05-31T09:00:00Z",
        "end_time": "2024-05-31T10:00:00Z"
    },
    "new_session": {
        "id": 123,
        "title": "Evening Yoga",
        "start_time": "2024-05-31T18:00:00Z",
        "end_time": "2024-05-31T19:00:00Z"
    },
    "rescheduled_at": "2024-05-31T12:30:00Z"
}
```

**Error Responses:**
```json
// Session not found
{
    "error": "Session not found or does not belong to this business"
}

// Cannot reschedule
{
    "error": "This booking cannot be rescheduled"
}

// Insufficient capacity
{
    "error": "The new session does not have enough available spots"
}
```

---

## 3. Client Self-Service APIs

### Get Booking Information
**Endpoint:** `GET /api/booking/client/{booking_reference}/`

**Example:** `GET /api/booking/client/BK240531001/`

**Response:**
```json
{
    "booking_reference": "BK240531001",
    "client_name": "John Doe",
    "client_email": "john@example.com",
    "status": "approved",
    "session": {
        "title": "Morning Yoga Class",
        "start_time": "2024-05-31T09:00:00Z",
        "end_time": "2024-05-31T10:00:00Z",
        "location": "Studio A"
    },
    "quantity": 1,
    "created_at": "2024-05-30T15:30:00Z",
    "can_be_cancelled_by_client": true,
    "can_be_rescheduled_by_client": true,
    "reschedule_info": {
        "reschedule_count": 1,
        "last_rescheduled_at": "2024-05-30T16:00:00Z",
        "reschedule_reason": "Client requested different time",
        "rescheduled_by_client": true,
        "max_reschedules_allowed": 2
    }
}
```

### Client Cancel Booking
**Endpoint:** `POST /api/booking/client/{booking_reference}/cancel/`

**Payload:**
```json
{
    "identity_verification": {
        "email": "john@example.com"
    },
    "reason": "Cannot attend due to scheduling conflict"
}
```

**Success Response:**
```json
{
    "success": true,
    "message": "Booking cancelled successfully",
    "booking_reference": "BK240531001",
    "cancelled_at": "2024-05-31T12:30:00Z",
    "cancellation_reason": "Cannot attend due to scheduling conflict"
}
```

### Get Reschedule Options
**Endpoint:** `GET /api/booking/client/{booking_reference}/reschedule-options/`

**Query Parameters:**
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Example:** `GET /api/booking/client/BK240531001/reschedule-options/?date_from=2024-06-01&date_to=2024-06-30`

**Response:**
```json
{
    "current_booking": {
        "booking_reference": "BK240531001",
        "session": {
            "id": 5,
            "title": "Morning Yoga",
            "start_time": "2024-05-31T09:00:00Z",
            "end_time": "2024-05-31T10:00:00Z",
            "location": "Studio A"
        },
        "quantity": 1,
        "status": "approved"
    },
    "available_sessions": [
        {
            "id": 123,
            "title": "Evening Yoga",
            "start_time": "2024-06-01T18:00:00Z",
            "end_time": "2024-06-01T19:00:00Z",
            "location": "Studio A",
            "available_spots": 8,
            "total_spots": 10,
            "capacity_status": "available"
        },
        {
            "id": 124,
            "title": "Morning Pilates",
            "start_time": "2024-06-02T10:00:00Z",
            "end_time": "2024-06-02T11:00:00Z",
            "location": "Studio B",
            "available_spots": 2,
            "total_spots": 8,
            "capacity_status": "limited"
        }
    ],
    "reschedule_policy": {
        "allowed": true,
        "deadline_hours": 24,
        "deadline": "2024-05-30T09:00:00Z",
        "can_reschedule": true,
        "max_reschedules": 2,
        "current_reschedules": 0,
        "reschedules_remaining": 2
    },
    "reschedule_fee_policy": "Free reschedules up to 24 hours before session"
}
```

### Client Reschedule Booking
**Endpoint:** `POST /api/booking/client/{booking_reference}/reschedule/`

**Payload:**
```json
{
    "identity_verification": {
        "email": "john@example.com"
    },
    "new_session_id": 123,
    "reason": "Need to change to a different time slot"
}
```

**Success Response:**
```json
{
    "success": true,
    "message": "Booking rescheduled successfully",
    "booking_reference": "BK240531001",
    "old_session": {
        "title": "Morning Yoga",
        "start_time": "2024-05-31T09:00:00Z",
        "end_time": "2024-05-31T10:00:00Z"
    },
    "new_session": {
        "title": "Evening Yoga",
        "start_time": "2024-06-01T18:00:00Z",
        "end_time": "2024-06-01T19:00:00Z"
    },
    "rescheduled_at": "2024-05-31T12:30:00Z"
}
```

**Error Responses:**
```json
// Identity verification failed
{
    "error": "Identity verification failed. Email or phone does not match booking records.",
    "code": "IDENTITY_VERIFICATION_FAILED"
}

// Reschedule not allowed
{
    "error": "This booking cannot be rescheduled by client.",
    "code": "RESCHEDULE_NOT_ALLOWED",
    "details": ["Reschedule deadline has passed"]
}

// Session not available
{
    "error": "The selected session is not available",
    "code": "SESSION_NOT_AVAILABLE"
}

// Same session selected
{
    "error": "You cannot reschedule to the same session.",
    "code": "SAME_SESSION_SELECTED"
}
```

---

## 4. Booking Settings API

### Get Current Settings
**Endpoint:** `GET /api/booking/settings/`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
    "requires_approval": true,
    "buffer_time_minutes": 15,
    "booking_expiry_hours": 24,
    "is_active": true,
    "auto_approve_returning_clients": false,
    "max_advance_booking_days": 30,
    "min_advance_booking_hours": 2,
    "allow_group_bookings": true,
    "max_group_size": 10,
    "group_booking_requires_approval": true,
    "allow_duplicate_bookings": false,
    "send_confirmation_emails": true,
    "send_reminder_emails": true,
    "reminder_hours_before": 24,
    "auto_release_expired": true,
    "send_expiry_notifications": true,
    "booking_page_title": "Book Your Session",
    "booking_page_description": "Select your preferred time slot",
    "success_message": "Thank you for your booking!",
    
    "allow_client_cancellation": true,
    "cancellation_deadline_hours": 24,
    "send_cancellation_emails": true,
    "cancellation_fee_policy": "Free cancellation up to 24 hours before session",
    
    "allow_admin_deletion": true,
    "require_deletion_reason": true,
    
    "allow_client_reschedule": true,
    "reschedule_deadline_hours": 24,
    "max_reschedules_per_booking": 2,
    "send_reschedule_emails": true,
    "reschedule_fee_policy": "Free reschedules up to 24 hours before session"
}
```

### Update Settings  
**Endpoint:** `PATCH /api/booking/settings/`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Payload Example:**
```json
{
    "allow_client_reschedule": true,
    "reschedule_deadline_hours": 12,
    "max_reschedules_per_booking": 3,
    "send_reschedule_emails": true,
    "reschedule_fee_policy": "First reschedule free, $5 fee for subsequent reschedules",
    
    "allow_client_cancellation": true,
    "cancellation_deadline_hours": 12,
    "send_cancellation_emails": true,
    "cancellation_fee_policy": "Free cancellation up to 12 hours before session"
}
```

---

## 5. Email Notifications System

### Email Types Sent:

#### Client Cancellation (Client→Admin):
- **To Client**: Cancellation confirmation
- **To Admin**: Notification of client cancellation

#### Admin Cancellation (Admin→Client):
- **To Client**: Cancellation notification with apology

#### Client Reschedule (Client→Admin):
- **To Client**: Reschedule confirmation
- **To Admin**: Notification of client reschedule

#### Admin Reschedule (Admin→Client):
- **To Client**: Reschedule notification with apology

### Email Templates:
- `booking_cancelled_client.html`
- `booking_cancelled_admin.html`
- `booking_rescheduled_client.html`
- `booking_rescheduled_admin.html`

---

## 6. Key Features Implemented

### ✅ Slot Management Fixed
- Cancelled bookings free up slots immediately
- Deleted bookings don't count toward capacity
- Reschedules properly transfer capacity

### ✅ Bidirectional Communication
- Client actions notify admins
- Admin actions notify clients
- Professional email templates for all scenarios

### ✅ Identity Verification
- Email or phone verification for client actions
- Prevents unauthorized cancellations/reschedules

### ✅ Business Logic Enforcement
- Configurable deadlines
- Maximum reschedule limits
- Capacity checking for new sessions

### ✅ Comprehensive Error Handling
- Clear error codes and messages
- Detailed validation feedback
- Graceful failure responses

### ✅ Audit Trail
- All actions logged with details
- IP and user agent tracking
- Full booking lifecycle history

---

## 7. Testing the Implementation

### Test Admin Reschedule:
```bash
curl -X PATCH "http://localhost:8000/api/booking/manage/42/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "reschedule",
    "new_session_id": 123,
    "reason": "Session time adjustment needed"
  }'
```

### Test Client Reschedule:
```bash
curl -X POST "http://localhost:8000/api/booking/client/BK240531001/reschedule/" \
  -H "Content-Type: application/json" \
  -d '{
    "identity_verification": {
      "email": "john@example.com"
    },
    "new_session_id": 123,
    "reason": "Need different time slot"
  }'
```

### Test Settings Update:
```bash
curl -X PATCH "http://localhost:8000/api/booking/settings/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allow_client_reschedule": true,
    "reschedule_deadline_hours": 12,
    "max_reschedules_per_booking": 3
  }'
```

---

## 8. Production Considerations

### ✅ Performance
- Optimized database queries
- Efficient capacity calculations
- Minimal API calls needed

### ✅ Security  
- Identity verification required
- Admin authentication enforced
- Input validation and sanitization

### ✅ Reliability
- Comprehensive error handling
- Transaction safety
- Graceful degradation

### ✅ Scalability
- Efficient database indexes
- Pagination for large datasets
- Background email processing

### ✅ User Experience
- Clear error messages with codes
- Intuitive API responses
- Professional email templates

---

## 🎉 Implementation Complete!

The booking reschedule and enhanced cancellation system is now fully implemented with:
- **Robust reschedule functionality** for both admins and clients
- **Fixed slot management** that properly frees up capacity
- **Bidirectional email notifications** for all stakeholders  
- **Professional email templates** for all scenarios
- **Comprehensive API documentation** with test payloads
- **Production-ready error handling** and validation

All functionality is ready for immediate use and testing! 