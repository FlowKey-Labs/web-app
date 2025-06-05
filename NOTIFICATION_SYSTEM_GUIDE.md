# Booking Notification System & Audit Logging Guide

## Overview

The Booking Notification System provides comprehensive in-app notifications for business administrators and detailed audit logging for all booking-related activities. This system follows enterprise-level audit trail patterns based on [Microsoft Purview audit activities standards](https://learn.microsoft.com/en-us/purview/audit-log-activities).

## 🔧 System Architecture

### Components
- **Admin In-App Notifications**: Real-time notifications for business owners
- **Audit Logging**: Complete activity tracking with user attribution
- **Email Integration**: SendGrid email notifications with delivery tracking
- **API Endpoints**: RESTful APIs for frontend integration

### Data Flow
```
Booking Action → Audit Log → Admin Notification → Email (if applicable) → Frontend Update
```

## 📱 Admin Notification Features

### Notification Types
- `booking_request` - New booking requests requiring approval
- `booking_approved` - Confirmations of approved bookings
- `booking_rejected` - Record of rejected bookings with reasons
- `booking_expired` - Expired pending bookings
- `system_alert` - System-level notifications

### Automatic Trigger Events
1. **New Booking Request**: Admin notified immediately
2. **Booking Approval**: Confirmation notification created
3. **Booking Rejection**: Action logged with admin notification
4. **Email Failures**: Alerts for failed email deliveries
5. **Auto-Approvals**: Notifications for automatically approved bookings

## 🔗 API Endpoints

### Notification Management

#### List Notifications
```http
GET /api/booking/notifications/
```

**Query Parameters:**
- `read` (boolean): Filter by read status (`true`/`false`)
- `type` (string): Filter by notification type
- `page` (int): Pagination
- `page_size` (int): Items per page

**Response:**
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
      },
      "data": {
        "booking_reference": "ABC123",
        "client_name": "John Doe",
        "session_title": "Yoga Class"
      }
    }
  ],
  "unread_count": 5,
  "total_count": 25,
  "count": 10,
  "next": "/api/booking/notifications/?page=2",
  "previous": null
}
```

#### Mark Notification as Read/Unread
```http
PATCH /api/booking/notifications/{id}/
```

**Request Body:**
```json
{
  "action": "mark_read"  // or "mark_unread"
}
```

#### Mark All Notifications as Read
```http
POST /api/booking/notifications/mark_all_read/
```

**Response:**
```json
{
  "message": "Marked 5 notifications as read",
  "count": 5
}
```

### Audit Log Management

#### List Audit Logs
```http
GET /api/booking/audit-logs/
```

**Query Parameters:**
- `action` (string): Filter by action type
- `booking_id` (int): Filter by specific booking
- `date_from` (ISO 8601): Start date filter
- `date_to` (ISO 8601): End date filter
- `search` (string): Search in details and booking references

**Response:**
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

## 📋 Audit Log Actions

### Action Types
- `CREATED` - Booking request created
- `APPROVED` - Booking approved by admin
- `REJECTED` - Booking rejected by admin
- `EXPIRED` - Booking expired due to timeout
- `EMAIL_SENT` - Email notification sent successfully
- `EMAIL_FAILED` - Email notification failed
- `ADMIN_ACTION` - General admin actions (read notifications, etc.)

### Tracked Information
- **User Attribution**: Who performed the action
- **IP Address**: Source IP for security tracking
- **User Agent**: Browser/device information
- **Timestamps**: Precise timing of all actions
- **Context Details**: Relevant information about the action

## 🎯 Frontend Integration

### Notification Display Components

#### Notification Bell Icon
```javascript
// Get unread count for badge
fetch('/api/booking/notifications/?read=false')
  .then(response => response.json())
  .then(data => {
    updateNotificationBadge(data.unread_count);
  });
```

#### Notification List
```javascript
// Display notifications with pagination
const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    const response = await fetch('/api/booking/notifications/');
    const data = await response.json();
    setNotifications(data.results);
    setUnreadCount(data.unread_count);
  };
  
  const markAsRead = async (notificationId) => {
    await fetch(`/api/booking/notifications/${notificationId}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_read' })
    });
    fetchNotifications(); // Refresh list
  };
  
  return (
    <div className="notification-list">
      {notifications.map(notification => (
        <NotificationItem 
          key={notification.id}
          notification={notification}
          onMarkRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  );
};
```

#### Real-time Updates (WebSocket/Polling)
```javascript
// Poll for new notifications every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### Audit Log Dashboard
```javascript
const AuditLogDashboard = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: '',
    search: '',
    date_from: '',
    date_to: ''
  });
  
  const fetchAuditLogs = async () => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/booking/audit-logs/?${params}`);
    const data = await response.json();
    setAuditLogs(data.results);
  };
  
  return (
    <div className="audit-dashboard">
      <AuditFilters filters={filters} onChange={setFilters} />
      <AuditLogTable logs={auditLogs} />
    </div>
  );
};
```

## 🚀 Production Deployment

### Environment Variables
```bash
# Email settings (already configured)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database settings
DATABASE_URL=postgresql://user:pass@host:port/db

# Django settings
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

### Database Migrations
```bash
# Apply notification system migrations
python manage.py makemigrations booking
python manage.py migrate
```

### Performance Optimization

#### Database Indexes
```sql
-- Optimize notification queries
CREATE INDEX booking_notification_user_created_at_idx ON booking_notification(user_id, created_at DESC);
CREATE INDEX booking_notification_read_at_idx ON booking_notification(read_at);

-- Optimize audit log queries  
CREATE INDEX booking_auditlog_timestamp_idx ON booking_auditlog(timestamp DESC);
CREATE INDEX booking_auditlog_action_idx ON booking_auditlog(action);
```

#### Caching Strategy
```python
# Cache notification counts
from django.core.cache import cache

def get_unread_count(user_id):
    cache_key = f'notifications_unread_count_{user_id}'
    count = cache.get(cache_key)
    if count is None:
        count = BookingNotification.objects.filter(
            user_id=user_id, 
            read_at__isnull=True
        ).count()
        cache.set(cache_key, count, 300)  # 5 minutes
    return count
```

## 🧪 Testing

### Run Test Suite
```bash
# Run comprehensive notification system tests
python test_notification_system.py

# Or with custom base URL
python test_notification_system.py http://localhost:8000
```

### Manual Testing Checklist
- [ ] Create booking request → Admin notification appears
- [ ] Approve booking → Approval notification created
- [ ] Reject booking → Rejection notification with reason
- [ ] Mark notification as read/unread
- [ ] Mark all notifications as read
- [ ] Filter notifications by type and read status
- [ ] View audit logs with filtering
- [ ] Search audit logs
- [ ] Email delivery tracked in audit logs

## 🔒 Security Considerations

### Authentication & Authorization
- All notification endpoints require authentication
- Users only see notifications for their business
- Audit logs are read-only via API
- IP address and user agent tracking for security

### Data Privacy
- Sensitive client information is sanitized in logs
- Audit logs include only necessary context
- Old audit logs can be archived/purged based on retention policy

### Rate Limiting
```python
# Add rate limiting to notification endpoints
from django_ratelimit.decorators import ratelimit

@ratelimit(key='user', rate='100/h', method='GET')
def notification_list_view(request):
    # Implementation
    pass
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Notification delivery rate
- Average response time to booking requests
- Email delivery success rate
- Audit log volume and patterns
- User engagement with notifications

### Health Checks
```python
# Add health check for notification system
def notification_health_check():
    try:
        # Test notification creation
        # Test email delivery
        # Test audit logging
        return {"status": "healthy"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

## 🔮 Future Enhancements

### Planned Features
1. **Real-time WebSocket Notifications**: Instant updates without polling
2. **Staff Notifications**: Notifications for assigned staff members
3. **Push Notifications**: Mobile push notifications via FCM/APNS
4. **Email Templates**: More sophisticated email template management
5. **Notification Preferences**: User-configurable notification settings
6. **Analytics Dashboard**: Visual analytics for notification patterns

### Extensibility
The system is designed to be easily extended:
- Add new notification types by extending the `type` choices
- Implement custom notification channels (SMS, Slack, etc.)
- Add business-specific notification rules
- Integrate with external monitoring systems

---

## 📞 Support

For technical issues or questions:
1. Check the audit logs for error details
2. Run the test suite to validate system health
3. Review server logs for detailed error information
4. Consult this documentation for API usage

The notification system is production-ready and designed for high reliability and performance. 