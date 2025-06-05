# Booking API Testing Plan

## Overview
Comprehensive testing plan for the booking system API including booking management, notifications, audit logs, and admin/staff workflows.

## Base URLs
- **Backend**: `http://localhost:8000`
- **Frontend**: `http://localhost:3000`

---

## 1. Public Booking Endpoints

### 1.1 Business Information
```bash
# Get business info for booking page
GET /api/booking/johnny-bravo-fitness-center/info/
```

**Expected Response:**
```json
{
  "business_name": "Johnny Bravo Fitness Center",
  "slug": "johnny-bravo-fitness-center",
  "description": "...",
  "booking_settings": {
    "requires_approval": true,
    "auto_approve_returning_clients": false,
    "send_confirmation_emails": true
  }
}
```

### 1.2 Available Services
```bash
# Get available services/categories
GET /api/booking/johnny-bravo-fitness-center/services/
```

### 1.3 Availability Check
```bash
# Check availability for specific date and service
GET /api/booking/johnny-bravo-fitness-center/availability/?date=2025-05-31&service_id=1
```

### 1.4 Create Booking
```bash
# Create new booking request
POST /api/booking/johnny-bravo-fitness-center/book/
Content-Type: application/json

{
  "session_id": 1,
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "+254712345678",
  "notes": "First time client",
  "quantity": 1
}
```

**Test Cases:**
- ✅ Single booking
- ✅ Group booking (quantity > 1)  
- ✅ Duplicate booking validation
- ✅ Session capacity validation
- ✅ Auto-approval vs manual approval flow

### 1.5 Booking Status Check  
```bash
# Check booking status
GET /api/booking/status/ABC123XYZ/
```

---

## 2. Admin Booking Management

### 2.1 List Bookings
```bash
# Get all business bookings (requires authentication)
GET /api/booking/manage/
Authorization: Bearer <admin_token>

# Filter by status
GET /api/booking/manage/?status=pending
GET /api/booking/manage/?status=approved
GET /api/booking/manage/?status=rejected
```

### 2.2 Approve Booking
```bash
# Approve pending booking
PATCH /api/booking/manage/<booking_id>/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "approve"
}
```

**Test Cases:**
- ✅ Approve pending booking
- ✅ Email notification sent to client
- ✅ Calendar links generated
- ✅ Audit log created
- ✅ **NEW**: Admin in-app notification created
- ✅ **NEW**: Staff notification sent (if staff assigned)

### 2.3 Reject Booking
```bash
# Reject pending booking
PATCH /api/booking/manage/<booking_id>/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "reject",
  "reason": "Session is fully booked"
}
```

**Test Cases:**
- ✅ Reject pending booking
- ✅ Email notification sent to client
- ✅ Audit log created with rejection reason
- ✅ **NEW**: Admin in-app notification created

---

## 3. **NEW: Notification System Testing**

### 3.1 Admin Notification Endpoints

#### List Admin Notifications
```bash
# Get admin notifications
GET /api/booking/notifications/
Authorization: Bearer <admin_token>

# Filter by read status
GET /api/booking/notifications/?read=false
GET /api/booking/notifications/?read=true

# Filter by type
GET /api/booking/notifications/?type=booking_request
```

**Expected Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "type": "booking_request",
      "title": "New Booking Request",
      "message": "John Doe requested to book Yoga Class on May 31, 2025",
      "read_at": null,
      "created_at": "2025-05-30T10:00:00Z",
      "booking_request": {
        "id": 1,
        "booking_reference": "ABC123",
        "client_name": "John Doe",
        "session": {
          "title": "Yoga Class",
          "start_time": "2025-05-31T09:00:00Z"
        }
      }
    }
  ]
}
```

#### Mark Notification as Read
```bash
# Mark specific notification as read
PATCH /api/booking/notifications/<notification_id>/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "mark_read"
}
```

#### Mark All Notifications as Read
```bash
# Mark all notifications as read
POST /api/booking/notifications/mark_all_read/
Authorization: Bearer <admin_token>
```

#### Mark Notification as Unread
```bash
# Mark notification as unread
PATCH /api/booking/notifications/<notification_id>/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "mark_unread"
}
```

### 3.2 Admin Notification Triggers

**Test Cases for Admin Notifications:**

1. **New Booking Request** 
   - ✅ Create booking → Admin gets in-app notification
   - ✅ Admin gets email notification
   - ✅ Notification type: `booking_request`

2. **Booking Status Changes**
   - ✅ Booking approved → Admin gets notification
   - ✅ Booking rejected → Admin gets notification  
   - ✅ Booking expired → Admin gets notification

3. **High Priority Notifications**
   - ✅ Group bookings → Admin gets immediate notification
   - ✅ VIP client bookings → Admin gets priority notification
   - ✅ Session capacity warnings → Admin gets alert

### 3.3 **NEW: Staff Notification System**

#### Staff Notification Endpoints
```bash
# Get staff notifications (when staff is assigned to sessions)
GET /api/staff/notifications/
Authorization: Bearer <staff_token>

# Staff-specific booking confirmations
GET /api/staff/notifications/?type=session_confirmed
```

#### Staff Notification Triggers

**Test Cases for Staff Notifications:**

1. **Session Confirmation**
   - ✅ Booking approved → Staff assigned to session gets email
   - ✅ Staff gets in-app notification
   - ✅ Notification includes client details and session info

2. **Session Updates**
   - ✅ Session time change → Staff gets notification
   - ✅ Session cancellation → Staff gets notification
   - ✅ Last-minute bookings → Staff gets immediate alert

---

## 4. **NEW: Audit Log Testing**

### 4.1 Audit Log Endpoints
```bash
# Get audit logs for specific booking
GET /api/booking/manage/<booking_id>/audit-logs/
Authorization: Bearer <admin_token>

# Get all audit logs for business
GET /api/booking/audit-logs/
Authorization: Bearer <admin_token>

# Filter by action type
GET /api/booking/audit-logs/?action=STATUS_CHANGED
GET /api/booking/audit-logs/?action=EMAIL_SENT
```

**Expected Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "booking_request": "ABC123",
      "action": "STATUS_CHANGED",
      "details": "Booking approved by John Admin",
      "user": {
        "id": 1,
        "first_name": "John",
        "last_name": "Admin"
      },
      "timestamp": "2025-05-30T10:30:00Z",
      "ip_address": "192.168.1.1"
    }
  ]
}
```

### 4.2 Audit Log Triggers

**Test Cases for Audit Logs:**

1. **Booking Lifecycle**
   - ✅ Booking created → `CREATED` audit log
   - ✅ Status changed → `STATUS_CHANGED` audit log
   - ✅ Email sent → `EMAIL_SENT` audit log
   - ✅ Email failed → `EMAIL_FAILED` audit log

2. **Admin Actions**
   - ✅ Admin approval → `ADMIN_ACTION` audit log
   - ✅ Admin rejection → `ADMIN_ACTION` audit log
   - ✅ Settings change → `ADMIN_ACTION` audit log

3. **System Actions**
   - ✅ Auto-approval → `SYSTEM_ACTION` audit log
   - ✅ Auto-expiry → `SYSTEM_ACTION` audit log
   - ✅ Calendar generation → `CALENDAR_GENERATED` audit log

---

## 5. Calendar Integration

### 5.1 ICS File Download
```bash
# Download calendar file
GET /api/booking/calendar/ABC123XYZ.ics
```

**Test Cases:**
- ✅ Valid booking reference returns ICS file
- ✅ ICS file contains correct event details
- ✅ Timezone handling (Africa/Nairobi)
- ✅ Audit log created for download

---

## 6. Email Template Testing

### 6.1 Email Templates
- ✅ **Booking Confirmed** (`booking_confirmed.html`)
- ✅ **Pending Approval** (`pending_approval.html`) 
- ✅ **Admin Approved** (`admin_approved.html`)
- ✅ **Booking Rejected** (`booking_rejected.html`)
- ✅ **Booking Expired** (`booking_expired.html`)

### 6.2 Email Rendering Tests
```bash
# Run email template tests
python web-app/test_email_templates.py
```

**Test Cases:**
- ✅ All templates render without errors
- ✅ Cross-email client compatibility
- ✅ Inline CSS validation
- ✅ Table-based layout verification

---

## 7. **NEW: Frontend Integration Considerations**

### 7.1 Notification UI Components

**Admin Dashboard Notifications:**

1. **Notification Bell Icon**
   - ✅ Shows unread count badge
   - ✅ Real-time updates via WebSocket/polling
   - ✅ Click shows notification dropdown

2. **Notification Dropdown**
   - ✅ Lists recent notifications (last 10)
   - ✅ Mark as read on click
   - ✅ "View All" link to full notification page

3. **Notification Center Page**
   - ✅ Paginated notification list
   - ✅ Filter by type (booking_request, booking_approved, etc.)
   - ✅ Filter by read/unread status
   - ✅ Bulk mark as read functionality
   - ✅ Search notifications

### 7.2 Admin Booking Management UI

**Booking Management Dashboard:**

1. **Pending Bookings Section**
   - ✅ Highlighted pending count
   - ✅ Quick approve/reject actions
   - ✅ Bulk actions for multiple bookings

2. **Booking Detail Modal**
   - ✅ Client information display
   - ✅ Session details
   - ✅ Approve/Reject buttons with reason input
   - ✅ Audit log history tab

3. **Real-time Updates**
   - ✅ New booking notifications appear immediately
   - ✅ Status changes reflect across all open tabs
   - ✅ Auto-refresh booking lists

### 7.3 Staff Dashboard

**Staff Notification System:**

1. **Staff Session View**
   - ✅ Confirmed bookings display
   - ✅ Client details accessible
   - ✅ Session preparation notifications

2. **Staff Notifications**
   - ✅ Email notifications for confirmed sessions
   - ✅ In-app alerts for session updates
   - ✅ Mobile-friendly notification format

---

## 8. **NEW: Advanced Testing Scenarios**

### 8.1 Notification Stress Testing

```bash
# Create multiple bookings simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/booking/johnny-bravo-fitness-center/book/ \
    -H "Content-Type: application/json" \
    -d "{\"session_id\": 1, \"client_name\": \"Client $i\", \"client_email\": \"client$i@example.com\"}" &
done
```

**Test Cases:**
- ✅ All notifications created successfully
- ✅ No duplicate notifications
- ✅ Audit logs maintained correctly
- ✅ Email queue handled properly

### 8.2 Error Handling

**Test Cases:**
- ✅ Email service down → Graceful degradation
- ✅ Database timeout → Proper error responses
- ✅ Invalid notification data → Validation errors
- ✅ Network issues → Retry mechanisms

### 8.3 Performance Testing

**Notification Performance:**
- ✅ Response time < 200ms for notification list
- ✅ Mark as read response < 100ms
- ✅ Bulk operations handle 100+ notifications
- ✅ Real-time updates with minimal latency

---

## 9. **NEW: Security Testing**

### 9.1 Authorization Tests

```bash
# Test unauthorized access
GET /api/booking/notifications/
# Should return 401 Unauthorized

# Test cross-business access
GET /api/booking/notifications/
Authorization: Bearer <different_business_token>
# Should only return notifications for authenticated user's business
```

### 9.2 Data Privacy

**Test Cases:**
- ✅ Admin only sees their business notifications
- ✅ Staff only sees relevant session notifications
- ✅ Client data properly masked in logs
- ✅ GDPR compliance for notification data

---

## 10. Test Execution Checklist

### 10.1 Manual Testing Sequence

1. **Setup**
   - [ ] Start backend server (`python manage.py runserver`)
   - [ ] Create test business and admin user
   - [ ] Create test sessions with different settings
   - [ ] Set up email configuration (SendGrid)

2. **Core Booking Flow**
   - [ ] Create booking (auto-approval disabled)
   - [ ] Verify admin email notification received
   - [ ] Verify admin in-app notification created
   - [ ] Check audit log entry created
   - [ ] Approve booking via admin dashboard
   - [ ] Verify client email notification sent
   - [ ] Verify staff notification sent (if staff assigned)
   - [ ] Check updated audit logs

3. **Notification Management**
   - [ ] List admin notifications
   - [ ] Mark notifications as read/unread
   - [ ] Test bulk mark as read
   - [ ] Verify notification filtering

4. **Audit Log Verification**
   - [ ] Check all audit log entries created
   - [ ] Verify user attribution
   - [ ] Test audit log filtering and search

5. **Email Template Testing**
   - [ ] Run email template validation script
   - [ ] Send test emails via SendGrid
   - [ ] Verify cross-client compatibility

### 10.2 Automated Testing

```bash
# Run Django tests
python manage.py test apps.booking

# Run email template tests  
python web-app/test_email_templates.py

# Run API integration tests
python web-app/test_booking_api.py
```

---

## 11. **NEW: Production Readiness Checklist**

### 11.1 Notification System
- [ ] Email templates cross-client tested
- [ ] Notification rate limiting configured
- [ ] Email queue monitoring set up
- [ ] Failed notification retry mechanism active

### 11.2 Audit Logging
- [ ] Log retention policy configured
- [ ] Audit log archiving set up
- [ ] Performance monitoring for large datasets
- [ ] Data anonymization for GDPR compliance

### 11.3 Admin Experience
- [ ] Real-time notification system tested
- [ ] Mobile-responsive notification UI
- [ ] Notification preferences configurable
- [ ] Bulk action performance validated

### 11.4 Staff Experience  
- [ ] Staff notification preferences set up
- [ ] Mobile email templates optimized
- [ ] Session confirmation workflow tested
- [ ] Staff-specific notification filtering

---

## Expected Outcomes

After completing this testing plan:

1. **✅ Robust Notification System**: Admins and staff receive timely, relevant notifications via email and in-app
2. **✅ Complete Audit Trail**: All booking actions tracked with user attribution and timestamps  
3. **✅ Intuitive Admin Experience**: Dashboard provides clear overview of pending actions and notification status
4. **✅ Staff Integration**: Assigned staff receive session confirmations and updates automatically
5. **✅ Production-Ready Email System**: Cross-client compatible templates with professional appearance
6. **✅ Scalable Architecture**: System handles high notification volume and concurrent users
7. **✅ Security & Privacy**: Proper authorization and data protection measures implemented

This comprehensive testing plan ensures the booking system provides an excellent user experience for both administrators and staff while maintaining complete audit trails and reliable notification delivery. 

## 5. Admin Notification System

### 5.1 List Admin Notifications
```bash
# Get all notifications for authenticated admin
GET /api/booking/notifications/
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": 1,
      "type": "booking_request",
      "title": "New Booking Request",
      "message": "John Doe requested to book Yoga Class on March 15, 2024",
      "is_read": false,
      "time_since": "2 hours ago",
      "read_at": null,
      "created_at": "2024-03-15T10:30:00Z",
      "booking_request": {
        "id": 123,
        "booking_reference": "ABC123",
        "client_name": "John Doe",
        "status": "pending",
        "session": {
          "title": "Yoga Class",
          "start_time": "2024-03-15T18:00:00Z"
        }
      }
    }
  ],
  "unread_count": 5,
  "total_count": 25
}
```

### 5.2 Filter Notifications by Read Status
```bash
# Get only unread notifications
GET /api/booking/notifications/?read=false

# Get only read notifications  
GET /api/booking/notifications/?read=true
```

### 5.3 Filter Notifications by Type
```bash
# Get booking request notifications
GET /api/booking/notifications/?type=booking_request

# Get approval notifications
GET /api/booking/notifications/?type=booking_approved
```

### 5.4 Mark Notification as Read
```bash
PATCH /api/booking/notifications/1/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "mark_read"
}
```

### 5.5 Mark Notification as Unread
```bash
PATCH /api/booking/notifications/1/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "mark_unread"
}
```

### 5.6 Mark All Notifications as Read
```bash
POST /api/booking/notifications/mark_all_read/
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "message": "Marked 5 notifications as read",
  "count": 5
}
```

---

## 6. Audit Log System

### 6.1 List Audit Logs
```bash
# Get all audit logs for authenticated admin's business
GET /api/booking/audit-logs/
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "results": [
    {
      "id": 1,
      "action": "CREATED",
      "action_display": "Booking Created",
      "details": "Booking created for John Doe - 1 spot(s)",
      "timestamp": "2024-03-15T10:30:00Z",
      "time_since": "2 hours ago",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "booking_request": {
        "id": 123,
        "booking_reference": "ABC123",
        "client_name": "John Doe",
        "status": "pending"
      },
      "user": {
        "id": 1,
        "full_name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ]
}
```

### 6.2 Filter Audit Logs by Action
```bash
# Get only booking creation logs
GET /api/booking/audit-logs/?action=CREATED

# Get only email-related logs
GET /api/booking/audit-logs/?action=EMAIL_SENT

# Get only admin actions
GET /api/booking/audit-logs/?action=ADMIN_ACTION
```

### 6.3 Filter Audit Logs by Booking
```bash
# Get logs for specific booking
GET /api/booking/audit-logs/?booking_id=123
```

### 6.4 Filter Audit Logs by Date Range
```bash
# Get logs from specific date range
GET /api/booking/audit-logs/?date_from=2024-03-01T00:00:00Z&date_to=2024-03-31T23:59:59Z
```

### 6.5 Search Audit Logs
```bash
# Search in details and booking references
GET /api/booking/audit-logs/?search=john+doe

# Search for specific booking reference
GET /api/booking/audit-logs/?search=ABC123
```

---

## 7. Enhanced Booking Management

### 7.1 Approve Booking with Notifications
```bash
PATCH /api/booking/manage/123/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "approve"
}
```

**What Happens:**
1. Booking status changes to "approved"
2. Client receives approval email
3. Admin notification created
4. Audit log entry created
5. Calendar links sent to client

### 7.2 Reject Booking with Notifications
```bash
PATCH /api/booking/manage/123/
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "action": "reject",
  "reason": "Session is fully booked"
}
```

**What Happens:**
1. Booking status changes to "rejected"
2. Client receives rejection email with reason
3. Admin notification created
4. Audit log entry created

---

## 8. Testing Complete Notification Flow

### 8.1 End-to-End Booking Test
```bash
# Step 1: Create booking (triggers notifications)
POST /api/booking/johnny-bravo-fitness-center/book/
Content-Type: application/json

{
  "session_id": 1,
  "client_name": "Test Client",
  "client_email": "test@example.com",
  "client_phone": "+254712345678",
  "notes": "Test booking",
  "quantity": 1
}

# Step 2: Check admin received notification
GET /api/booking/notifications/?type=booking_request
Authorization: Bearer <admin_token>

# Step 3: Check audit log was created
GET /api/booking/audit-logs/?action=CREATED
Authorization: Bearer <admin_token>

# Step 4: Approve the booking
PATCH /api/booking/manage/{booking_id}/
Authorization: Bearer <admin_token>
{
  "action": "approve"
}

# Step 5: Verify approval notification and audit logs
GET /api/booking/notifications/?type=booking_approved
GET /api/booking/audit-logs/?action=APPROVED
Authorization: Bearer <admin_token>
```

### 8.2 Notification Read/Unread Test
```bash
# Get unread count
GET /api/booking/notifications/?read=false

# Mark specific notification as read
PATCH /api/booking/notifications/{id}/
{
  "action": "mark_read"
}

# Verify count decreased
GET /api/booking/notifications/?read=false

# Mark all as read
POST /api/booking/notifications/mark_all_read/

# Verify all marked as read
GET /api/booking/notifications/?read=false
```

---

## 9. Frontend Integration Examples

### 9.1 React Notification Component
```javascript
const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const response = await fetch('/api/booking/notifications/?read=false');
      const data = await response.json();
      setUnreadCount(data.unread_count);
    };
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="notification-bell">
      <BellIcon />
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}
    </div>
  );
};
```

### 9.2 Audit Log Dashboard
```javascript
const AuditDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  
  const fetchLogs = async () => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/booking/audit-logs/?${params}`);
    const data = await response.json();
    setLogs(data.results);
  };
  
  return (
    <div>
      <FilterForm filters={filters} onChange={setFilters} />
      <LogTable logs={logs} />
    </div>
  );
};
```

---

## 10. Error Handling & Validation

### 10.1 Authentication Errors
```bash
# Missing or invalid token
GET /api/booking/notifications/
# Returns 401 Unauthorized
```

### 10.2 Notification Not Found
```bash
# Non-existent notification ID
PATCH /api/booking/notifications/999/
# Returns 404 Not Found
```

### 10.3 Invalid Action
```bash
# Invalid mark action
PATCH /api/booking/notifications/1/
{
  "action": "invalid_action"
}
# Returns 400 Bad Request
```

---

## 11. Performance & Scalability

### 11.1 Pagination
All list endpoints support pagination:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

### 11.2 Database Optimization
- Indexes on frequently queried fields
- Read replicas for audit log queries
- Caching for notification counts

### 11.3 Rate Limiting
- 100 requests per hour for notification endpoints
- 500 requests per hour for audit log endpoints
- Burst allowance for urgent operations

---

## 12. Production Checklist

### 12.1 Before Deployment
- [ ] Run notification system tests: `python test_notification_system.py`
- [ ] Verify email templates render correctly
- [ ] Test all notification types are created
- [ ] Validate audit logs capture all actions
- [ ] Check read/unread functionality
- [ ] Test pagination and filtering
- [ ] Verify authentication and authorization

### 12.2 After Deployment
- [ ] Monitor notification delivery rates
- [ ] Check audit log volume and performance
- [ ] Validate email sending works in production
- [ ] Test real user workflows
- [ ] Monitor API response times
- [ ] Set up alerting for failed operations

---

## 13. Troubleshooting

### 13.1 Common Issues
**Notifications not appearing:**
- Check user authentication
- Verify business ownership
- Check notification creation in logs

**Emails not sending:**
- Verify SendGrid configuration
- Check email template rendering
- Review audit logs for EMAIL_FAILED entries

**Performance issues:**
- Check database indexes
- Monitor query performance
- Consider caching strategies

### 13.2 Debug Commands
```bash
# Check recent audit logs
GET /api/booking/audit-logs/?search=ERROR

# Check failed email notifications
GET /api/booking/audit-logs/?action=EMAIL_FAILED

# Monitor notification creation
GET /api/booking/notifications/?created_at__gte=2024-03-15T00:00:00Z
```

The notification system provides comprehensive tracking and alerting for all booking activities, ensuring administrators are informed of all relevant events while maintaining detailed audit trails for compliance and debugging purposes. 