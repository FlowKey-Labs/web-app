# Booking Cancellation & Settings API Reference

## 1. Client Self-Service Cancellation

### Get Booking Information (Client)
**Endpoint:** `GET /api/booking/client/{booking_reference}/`

**Example Request:**
```bash
curl -X GET "http://localhost:8000/api/booking/client/BK240531001/"
```

**Response Example:**
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
    "cancellation_deadline": "2024-05-30T09:00:00Z"
}
```

### Cancel Booking (Client)
**Endpoint:** `POST /api/booking/client/{booking_reference}/cancel/`

**Required Payload:**
```json
{
    "identity_verification": {
        "email": "john@example.com"
    },
    "reason": "Unable to attend due to schedule conflict"
}
```

**Alternative Identity Verification (using phone):**
```json
{
    "identity_verification": {
        "phone": "+1234567890"
    },
    "reason": "Personal emergency"
}
```

**Success Response:**
```json
{
    "success": true,
    "message": "Booking cancelled successfully",
    "booking_reference": "BK240531001",
    "cancelled_at": "2024-05-30T16:45:00Z"
}
```

**Error Responses:**
```json
// Identity verification failed
{
    "error": "Identity verification failed. Email or phone does not match booking records.",
    "code": "IDENTITY_VERIFICATION_FAILED"
}

// Cancellation deadline passed
{
    "error": "Cancellation deadline has passed. Please contact the business directly.",
    "code": "CANCELLATION_DEADLINE_PASSED"
}

// Already cancelled
{
    "error": "This booking has already been cancelled.",
    "code": "ALREADY_CANCELLED"
}

// Client cancellation disabled
{
    "error": "Client cancellation is not allowed for this business.",
    "code": "CLIENT_CANCELLATION_DISABLED"
}
```

---

## 2. Booking Settings Management (Admin)

### Get Current Booking Settings
**Endpoint:** `GET /api/booking/settings/`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Example:**
```json
{
    "requires_approval": false,
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
    "booking_page_title": "",
    "booking_page_description": "",
    "success_message": "",
    
    // New Cancellation Settings
    "allow_client_cancellation": true,
    "cancellation_deadline_hours": 24,
    "send_cancellation_emails": true,
    "cancellation_fee_policy": "Cancellations must be made at least 24 hours in advance. Late cancellations may incur a fee.",
    
    // New Admin Deletion Settings
    "allow_admin_deletion": true,
    "require_deletion_reason": true
}
```

### Update Booking Settings
**Endpoint:** `PATCH /api/booking/settings/`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Example Payload (Update Cancellation Settings):**
```json
{
    "allow_client_cancellation": true,
    "cancellation_deadline_hours": 48,
    "send_cancellation_emails": true,
    "cancellation_fee_policy": "Free cancellation up to 48 hours before. Cancellations within 48 hours will incur a 50% fee."
}
```

**Example Payload (Update Admin Deletion Settings):**
```json
{
    "allow_admin_deletion": false,
    "require_deletion_reason": true
}
```

**Example Payload (Update Multiple Settings):**
```json
{
    "requires_approval": true,
    "allow_client_cancellation": true,
    "cancellation_deadline_hours": 24,
    "send_cancellation_emails": true,
    "cancellation_fee_policy": "Cancellations must be made at least 24 hours in advance.",
    "allow_admin_deletion": true,
    "require_deletion_reason": true,
    "max_group_size": 15,
    "send_reminder_emails": true,
    "reminder_hours_before": 48
}
```

**Success Response:**
```json
{
    "message": "Booking settings updated successfully",
    "updated_fields": [
        "requires_approval",
        "allow_client_cancellation",
        "cancellation_deadline_hours",
        "send_cancellation_emails",
        "cancellation_fee_policy",
        "allow_admin_deletion",
        "require_deletion_reason"
    ]
}
```

---

## 3. Admin Booking Management (Enhanced)

### Get All Bookings (Including Cancelled/Deleted)
**Endpoint:** `GET /api/booking/manage/`

**Query Parameters:**
- `status`: Filter by status (pending, approved, rejected, expired, cancelled)
- `include_deleted`: Include soft-deleted bookings (true/false)

**Examples:**
```bash
# Get all active bookings
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:8000/api/booking/manage/"

# Get cancelled bookings
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:8000/api/booking/manage/?status=cancelled"

# Get all bookings including soft-deleted ones
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:8000/api/booking/manage/?include_deleted=true"
```

### Cancel Booking (Admin)
**Endpoint:** `PATCH /api/booking/manage/{booking_id}/`

**Payload:**
```json
{
    "action": "cancel",
    "reason": "Client requested cancellation via phone"
}
```

### Soft Delete Booking (Admin)
**Endpoint:** `PATCH /api/booking/manage/{booking_id}/`

**Payload:**
```json
{
    "action": "soft_delete",
    "reason": "Duplicate booking created by mistake"
}
```

### Restore Soft-Deleted Booking (Admin)
**Endpoint:** `PATCH /api/booking/manage/{booking_id}/`

**Payload:**
```json
{
    "action": "restore"
}
```

### Hard Delete Booking (Admin)
**Endpoint:** `DELETE /api/booking/manage/{booking_id}/`

**Payload:**
```json
{
    "reason": "Test booking - permanent removal requested"
}
```

---

## 4. Testing Commands

### Test Client Cancellation
```bash
# 1. Get booking info
curl -X GET "http://localhost:8000/api/booking/client/BK240531001/"

# 2. Cancel the booking
curl -X POST "http://localhost:8000/api/booking/client/BK240531001/cancel/" \
  -H "Content-Type: application/json" \
  -d '{
    "identity_verification": {
      "email": "john@example.com"
    },
    "reason": "Schedule conflict"
  }'
```

### Test Settings Management
```bash
# 1. Get current settings
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:8000/api/booking/settings/"

# 2. Update cancellation settings
curl -X PATCH "http://localhost:8000/api/booking/settings/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "allow_client_cancellation": true,
    "cancellation_deadline_hours": 48,
    "cancellation_fee_policy": "Free cancellation up to 48 hours before the session."
  }'
```

### Test Admin Management
```bash
# 1. Get all bookings
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:8000/api/booking/manage/"

# 2. Cancel a booking as admin
curl -X PATCH "http://localhost:8000/api/booking/manage/1/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cancel",
    "reason": "Client called to cancel"
  }'
```

---

## 5. Key Points

### Cancellation Settings Integration
**Yes, cancellation settings are bundled with other booking settings.** They're part of the same `BookingSettings` model and managed through the same `/api/booking/settings/` endpoint.

### New Settings Added:
- `allow_client_cancellation`: Enable/disable client self-service cancellation
- `cancellation_deadline_hours`: Hours before session when cancellation is no longer allowed
- `send_cancellation_emails`: Send email notifications for cancellations
- `cancellation_fee_policy`: Text describing cancellation fees (displayed to clients)
- `allow_admin_deletion`: Allow admins to permanently delete bookings
- `require_deletion_reason`: Require reason when deleting bookings

### Security Features:
- Client cancellation requires identity verification (email or phone match)
- Time-based restrictions respect business policies
- All actions are logged in audit trail
- IP address and user agent tracking for security

### Business Logic:
- Soft delete is the default/recommended approach
- Hard delete is available but should be used sparingly
- Cancellation emails are automatically sent when enabled
- Returning client logic is preserved across cancellations 