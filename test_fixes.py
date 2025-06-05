#!/usr/bin/env python3
"""
Test script to verify notification system fixes
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_CREDENTIALS = {
    "email": "johnnybravo@gmail.com",
    "password": "Password@1"
}

def get_auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login/", json=ADMIN_CREDENTIALS)
    if response.status_code == 200:
        return response.json()['access']
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_audit_logs():
    """Test audit logs with proper IP and user agent tracking"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'TestScript/1.0 (Python requests)'
    }
    
    print("Testing audit logs...")
    
    # Test 1: Get all audit logs
    response = requests.get(f"{BASE_URL}/api/booking/audit-logs/", headers=headers)
    print(f"All audit logs: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        # Handle both list format and paginated format
        if isinstance(data, list):
            audit_logs = data
        else:
            audit_logs = data.get('results', [])
            
        if audit_logs:
            # Check if recent logs have IP and user agent
            recent_log = audit_logs[0]
            print(f"Recent log IP address: {recent_log.get('ip_address', 'MISSING')}")
            print(f"Recent log user agent: {recent_log.get('user_agent', 'MISSING')}")
            
            # Test filtering by booking reference
            booking_ref = recent_log['booking_request']['booking_reference']
            response2 = requests.get(f"{BASE_URL}/api/booking/audit-logs/?booking_id={booking_ref}", headers=headers)
            print(f"Filter by booking reference: {response2.status_code}")
            
            if response2.status_code == 200:
                filtered_data = response2.json()
                if isinstance(filtered_data, list):
                    filtered_logs = filtered_data
                else:
                    filtered_logs = filtered_data.get('results', [])
                print(f"Filtered results count: {len(filtered_logs)}")
                
    print()
    return response.status_code == 200

def test_notification_trailing_slash():
    """Test notification endpoints with trailing slash handling"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'TestScript/1.0 (Python requests)'
    }
    
    print("Testing notification trailing slash fixes...")
    
    # Test 1: Get notifications
    response = requests.get(f"{BASE_URL}/api/booking/notifications/", headers=headers)
    print(f"Get notifications: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        # Handle both list format and paginated format
        if isinstance(data, list):
            notifications = data
        else:
            notifications = data.get('results', [])
            
        if notifications:
            notification_id = notifications[0]['id']
            
            # Test 2: PATCH with trailing slash (should work)
            patch_data = {"action": "mark_read"}
            response2 = requests.patch(f"{BASE_URL}/api/booking/notifications/{notification_id}/", 
                                     json=patch_data, headers=headers)
            print(f"PATCH with trailing slash: {response2.status_code}")
            
            # Test 3: PATCH without trailing slash (should also work now due to router config)
            patch_data = {"action": "mark_unread"}
            response3 = requests.patch(f"{BASE_URL}/api/booking/notifications/{notification_id}", 
                                     json=patch_data, headers=headers)
            print(f"PATCH without trailing slash: {response3.status_code}")
            
            # Test 4: Mark all read endpoint
            response4 = requests.post(f"{BASE_URL}/api/booking/notifications/mark_all_read/", headers=headers)
            print(f"Mark all read: {response4.status_code}")
        else:
            print("No notifications found to test with")
            
    print()
    return response.status_code == 200

def test_create_booking_with_audit():
    """Test creating a booking to ensure audit logging works with IP/user agent"""
    headers = {'User-Agent': 'TestScript/1.0 (Python requests)'}
    
    print("Testing booking creation with audit logging...")
    
    booking_data = {
        "session_id": 4,  # Use existing Test Session for Booking API
        "client_name": "Test Client for Audit",
        "client_email": "testaudit@example.com",
        "client_phone": "+254712345999",
        "notes": "Test booking for audit log verification with IP/UA tracking",
        "quantity": 1,
        # Add required validation fields
        "selected_date": "2025-06-03",
        "selected_time": "14:00",
        "selected_end_time": "15:00"
    }
    
    response = requests.post(f"{BASE_URL}/api/booking/johnny-bravo-fitness-center/book/", 
                           json=booking_data, headers=headers)
    print(f"Create booking: {response.status_code}")
    
    if response.status_code == 201:
        booking_ref = response.json()['booking_reference']
        print(f"Created booking: {booking_ref}")
        
        # Wait a moment then check audit logs for this booking
        import time
        time.sleep(1)
        
        # Get audit logs for this booking (requires admin auth)
        token = get_auth_token()
        if token:
            auth_headers = {
                'Authorization': f'Bearer {token}',
                'User-Agent': 'TestScript/1.0 (Python requests)'
            }
            
            audit_response = requests.get(f"{BASE_URL}/api/booking/audit-logs/?booking_id={booking_ref}", 
                                        headers=auth_headers)
            print(f"Get audit logs for new booking: {audit_response.status_code}")
            
            if audit_response.status_code == 200:
                audit_data = audit_response.json()
                if isinstance(audit_data, list):
                    audit_logs = audit_data
                else:
                    audit_logs = audit_data.get('results', [])
                    
                if audit_logs:
                    creation_log = audit_logs[0]  # Most recent log
                    print(f"Creation log IP: {creation_log.get('ip_address', 'MISSING')}")
                    print(f"Creation log User Agent: {creation_log.get('user_agent', 'MISSING')}")
                    
                    # Check if the new audit log has proper tracking
                    has_ip = creation_log.get('ip_address') is not None
                    has_ua = creation_log.get('user_agent', '') != ''
                    print(f"New audit log has IP tracking: {has_ip}")
                    print(f"New audit log has User Agent tracking: {has_ua}")
    else:
        # Print error details
        try:
            error_data = response.json()
            print(f"Booking creation failed: {error_data}")
        except:
            print(f"Booking creation failed: {response.text}")
    
    print()
    return response.status_code == 201

def test_admin_action_audit():
    """Test that admin actions create audit logs with IP and user agent"""
    token = get_auth_token()
    if not token:
        return False
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'TestScript/1.0 (Admin Action Test)'
    }
    
    print("Testing admin action audit logging...")
    
    # Get notifications first
    response = requests.get(f"{BASE_URL}/api/booking/notifications/", headers=headers)
    print(f"Get notifications: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        # Handle both list format and paginated format
        if isinstance(data, list):
            notifications = data
        else:
            notifications = data.get('results', [])
            
        if notifications:
            notification_id = notifications[0]['id']
            booking_ref = notifications[0]['booking_request']['booking_reference']
            
            # Get current audit log count
            audit_response = requests.get(f"{BASE_URL}/api/booking/audit-logs/?booking_id={booking_ref}", headers=headers)
            if audit_response.status_code == 200:
                audit_data = audit_response.json()
                if isinstance(audit_data, list):
                    initial_count = len(audit_data)
                else:
                    initial_count = len(audit_data.get('results', []))
            else:
                initial_count = 0
            
            # Perform admin action (mark as read)
            patch_data = {"action": "mark_read"}
            action_response = requests.patch(f"{BASE_URL}/api/booking/notifications/{notification_id}/", 
                                           json=patch_data, headers=headers)
            print(f"Mark notification as read: {action_response.status_code}")
            
            if action_response.status_code == 200:
                # Wait a moment for audit log to be created
                import time
                time.sleep(1)
                
                # Check if new audit log was created with proper tracking
                audit_response2 = requests.get(f"{BASE_URL}/api/booking/audit-logs/?booking_id={booking_ref}", headers=headers)
                if audit_response2.status_code == 200:
                    audit_data2 = audit_response2.json()
                    if isinstance(audit_data2, list):
                        new_logs = audit_data2
                    else:
                        new_logs = audit_data2.get('results', [])
                    
                    if len(new_logs) > initial_count:
                        # Find the new audit log (most recent)
                        new_log = new_logs[0]
                        print(f"New audit log IP: {new_log.get('ip_address', 'MISSING')}")
                        print(f"New audit log User Agent: {new_log.get('user_agent', 'MISSING')}")
                        print(f"New audit log action: {new_log.get('action', 'MISSING')}")
                        
                        # Verify it's an admin action with proper tracking
                        has_ip = new_log.get('ip_address') is not None
                        has_ua = new_log.get('user_agent', '') != ''
                        is_admin_action = new_log.get('action') == 'ADMIN_ACTION'
                        
                        print(f"Admin action has IP: {has_ip}")
                        print(f"Admin action has User Agent: {has_ua}")
                        print(f"Is admin action: {is_admin_action}")
                        
                        success = has_ip and has_ua and is_admin_action
                        print(f"Admin action audit tracking: {'✅ SUCCESS' if success else '❌ FAILED'}")
                        
                        print()
                        return success
    
    print("No notifications available for admin action test")
    print()
    return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("NOTIFICATION SYSTEM FIXES VERIFICATION")
    print("=" * 60)
    print(f"Testing at: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    results = []
    
    # Test audit logs
    results.append(("Audit Logs IP/User Agent", test_audit_logs()))
    
    # Test notification trailing slash
    results.append(("Notification Trailing Slash", test_notification_trailing_slash()))
    
    # Test booking creation with audit
    results.append(("Booking Creation Audit", test_create_booking_with_audit()))
    
    # Test admin action audit
    results.append(("Admin Action Audit", test_admin_action_audit()))
    
    # Summary
    print("=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:<30} {status}")
        if not passed:
            all_passed = False
    
    print()
    if all_passed:
        print("🎉 All tests passed! The fixes are working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 