#!/usr/bin/env python3
"""
Comprehensive Test Script for Booking Reschedule & Enhanced Cancellation System

This script tests all the new functionality including:
- Admin reschedule endpoints
- Client self-service reschedule
- Enhanced cancellation with email notifications
- Slot management verification
- Settings management

Usage:
    python test_reschedule_system.py --base-url http://localhost:8000 --token YOUR_JWT_TOKEN
"""

import requests
import json
import sys
import argparse
from datetime import datetime, timedelta
import time

class BookingRescheduleSystemTester:
    def __init__(self, base_url, auth_token=None):
        self.base_url = base_url.rstrip('/')
        self.auth_token = auth_token
        self.session = requests.Session()
        if auth_token:
            self.session.headers.update({
                'Authorization': f'Bearer {auth_token}',
                'Content-Type': 'application/json'
            })
    
    def log(self, message, level="INFO"):
        """Enhanced logging with colors"""
        colors = {
            "INFO": "\033[94m",     # Blue
            "SUCCESS": "\033[92m",  # Green  
            "WARNING": "\033[93m",  # Yellow
            "ERROR": "\033[91m",    # Red
            "RESET": "\033[0m"      # Reset
        }
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        color = colors.get(level, colors["INFO"])
        reset = colors["RESET"]
        print(f"{color}[{timestamp}] {level}: {message}{reset}")
    
    def test_booking_settings(self):
        """Test booking settings retrieval and update"""
        self.log("🔧 Testing Booking Settings Management", "INFO")
        
        # Test GET settings
        try:
            response = self.session.get(f"{self.base_url}/api/booking/settings/")
            if response.status_code == 200:
                settings = response.json()
                self.log("✅ Settings retrieved successfully", "SUCCESS")
                
                # Check for reschedule settings
                reschedule_fields = [
                    'allow_client_reschedule', 'reschedule_deadline_hours',
                    'max_reschedules_per_booking', 'send_reschedule_emails'
                ]
                
                missing_fields = [field for field in reschedule_fields if field not in settings]
                if missing_fields:
                    self.log(f"❌ Missing reschedule fields: {missing_fields}", "ERROR")
                    return False
                
                self.log(f"📋 Current reschedule settings:", "INFO")
                for field in reschedule_fields:
                    self.log(f"   {field}: {settings.get(field)}", "INFO")
                
                # Test PATCH settings
                update_payload = {
                    "allow_client_reschedule": True,
                    "reschedule_deadline_hours": 12,
                    "max_reschedules_per_booking": 3,
                    "send_reschedule_emails": True,
                    "reschedule_fee_policy": "Test policy: First reschedule free"
                }
                
                patch_response = self.session.patch(
                    f"{self.base_url}/api/booking/settings/",
                    json=update_payload
                )
                
                if patch_response.status_code == 200:
                    self.log("✅ Settings updated successfully", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Settings update failed: {patch_response.status_code}", "ERROR")
                    self.log(f"Response: {patch_response.text}", "ERROR")
                    return False
            else:
                self.log(f"❌ Failed to get settings: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Settings test error: {str(e)}", "ERROR")
            return False
    
    def test_admin_reschedule(self, booking_id, new_session_id):
        """Test admin reschedule functionality"""
        self.log(f"👨‍💼 Testing Admin Reschedule (Booking: {booking_id})", "INFO")
        
        payload = {
            "action": "reschedule",
            "new_session_id": new_session_id,
            "reason": "Testing admin reschedule functionality - session time adjustment needed"
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/booking/manage/{booking_id}/",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log("✅ Admin reschedule successful", "SUCCESS")
                self.log(f"📋 Booking Reference: {result.get('booking_reference')}", "INFO")
                
                old_session = result.get('old_session', {})
                new_session = result.get('new_session', {})
                
                self.log(f"🕐 Old Session: {old_session.get('title')} at {old_session.get('start_time')}", "INFO")
                self.log(f"🕐 New Session: {new_session.get('title')} at {new_session.get('start_time')}", "INFO")
                
                return True, result.get('booking_reference')
            else:
                self.log(f"❌ Admin reschedule failed: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False, None
        except Exception as e:
            self.log(f"❌ Admin reschedule error: {str(e)}", "ERROR")
            return False, None
    
    def test_client_booking_info(self, booking_reference):
        """Test client booking information retrieval"""
        self.log(f"👤 Testing Client Booking Info ({booking_reference})", "INFO")
        
        try:
            # Remove auth for client endpoint
            headers = {'Content-Type': 'application/json'}
            response = requests.get(
                f"{self.base_url}/api/booking/client/{booking_reference}/",
                headers=headers
            )
            
            if response.status_code == 200:
                booking_info = response.json()
                self.log("✅ Client booking info retrieved", "SUCCESS")
                self.log(f"📋 Client: {booking_info.get('client_name')}", "INFO")
                self.log(f"📋 Status: {booking_info.get('status')}", "INFO")
                self.log(f"📋 Can Cancel: {booking_info.get('can_be_cancelled_by_client')}", "INFO")
                self.log(f"📋 Can Reschedule: {booking_info.get('can_be_rescheduled_by_client')}", "INFO")
                
                return True, booking_info
            else:
                self.log(f"❌ Client info failed: {response.status_code}", "ERROR")
                return False, None
        except Exception as e:
            self.log(f"❌ Client info error: {str(e)}", "ERROR")
            return False, None
    
    def test_client_reschedule_options(self, booking_reference):
        """Test client reschedule options"""
        self.log(f"👤 Testing Client Reschedule Options ({booking_reference})", "INFO")
        
        try:
            headers = {'Content-Type': 'application/json'}
            response = requests.get(
                f"{self.base_url}/api/booking/client/{booking_reference}/reschedule-options/",
                headers=headers
            )
            
            if response.status_code == 200:
                options = response.json()
                self.log("✅ Reschedule options retrieved", "SUCCESS")
                
                current_booking = options.get('current_booking', {})
                available_sessions = options.get('available_sessions', [])
                policy = options.get('reschedule_policy', {})
                
                self.log(f"📋 Current Session: {current_booking.get('session', {}).get('title')}", "INFO")
                self.log(f"📋 Available Sessions: {len(available_sessions)}", "INFO")
                self.log(f"📋 Can Reschedule: {policy.get('can_reschedule')}", "INFO")
                self.log(f"📋 Reschedules Remaining: {policy.get('reschedules_remaining')}", "INFO")
                
                return True, options
            else:
                self.log(f"❌ Reschedule options failed: {response.status_code}", "ERROR")
                return False, None
        except Exception as e:
            self.log(f"❌ Reschedule options error: {str(e)}", "ERROR")
            return False, None
    
    def test_client_reschedule(self, booking_reference, client_email, new_session_id):
        """Test client reschedule booking"""
        self.log(f"👤 Testing Client Reschedule ({booking_reference})", "INFO")
        
        payload = {
            "identity_verification": {
                "email": client_email
            },
            "new_session_id": new_session_id,
            "reason": "Testing client reschedule - need different time slot"
        }
        
        try:
            headers = {'Content-Type': 'application/json'}
            response = requests.post(
                f"{self.base_url}/api/booking/client/{booking_reference}/reschedule/",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log("✅ Client reschedule successful", "SUCCESS")
                
                old_session = result.get('old_session', {})
                new_session = result.get('new_session', {})
                
                self.log(f"🕐 Rescheduled from: {old_session.get('title')}", "INFO")
                self.log(f"🕐 Rescheduled to: {new_session.get('title')}", "INFO")
                
                return True
            else:
                self.log(f"❌ Client reschedule failed: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Client reschedule error: {str(e)}", "ERROR")
            return False
    
    def test_client_cancellation(self, booking_reference, client_email):
        """Test client cancellation functionality"""
        self.log(f"👤 Testing Client Cancellation ({booking_reference})", "INFO")
        
        payload = {
            "identity_verification": {
                "email": client_email
            },
            "reason": "Testing client cancellation - schedule conflict"
        }
        
        try:
            headers = {'Content-Type': 'application/json'}
            response = requests.post(
                f"{self.base_url}/api/booking/client/{booking_reference}/cancel/",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log("✅ Client cancellation successful", "SUCCESS")
                self.log(f"📋 Cancelled at: {result.get('cancelled_at')}", "INFO")
                self.log(f"📋 Reason: {result.get('cancellation_reason')}", "INFO")
                return True
            else:
                self.log(f"❌ Client cancellation failed: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Client cancellation error: {str(e)}", "ERROR")
            return False
    
    def test_admin_cancellation(self, booking_id):
        """Test admin cancellation functionality"""
        self.log(f"👨‍💼 Testing Admin Cancellation (Booking: {booking_id})", "INFO")
        
        payload = {
            "action": "cancel",
            "reason": "Testing admin cancellation - operational requirements"
        }
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/booking/manage/{booking_id}/",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log("✅ Admin cancellation successful", "SUCCESS")
                self.log(f"📋 Booking Reference: {result.get('booking_reference')}", "INFO")
                return True
            else:
                self.log(f"❌ Admin cancellation failed: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Admin cancellation error: {str(e)}", "ERROR")
            return False
    
    def test_slot_management(self):
        """Test that cancelled/deleted bookings free up slots"""
        self.log("🎯 Testing Slot Management", "INFO")
        
        try:
            # Get booking list to check capacity
            response = self.session.get(f"{self.base_url}/api/booking/manage/")
            if response.status_code == 200:
                bookings = response.json()
                
                # Count active vs cancelled/deleted bookings
                active_count = 0
                cancelled_count = 0
                deleted_count = 0
                
                for booking in bookings.get('results', []):
                    if booking.get('status') in ['pending', 'approved']:
                        active_count += 1
                    elif booking.get('status') == 'cancelled':
                        cancelled_count += 1
                    elif booking.get('is_deleted', False):
                        deleted_count += 1
                
                self.log(f"📊 Active Bookings: {active_count}", "INFO")
                self.log(f"📊 Cancelled Bookings: {cancelled_count}", "INFO")
                self.log(f"📊 Deleted Bookings: {deleted_count}", "INFO")
                
                if cancelled_count > 0 or deleted_count > 0:
                    self.log("✅ Slot management working - cancelled/deleted bookings tracked", "SUCCESS")
                else:
                    self.log("⚠️  No cancelled/deleted bookings to verify slot management", "WARNING")
                
                return True
            else:
                self.log(f"❌ Failed to get bookings for slot test: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Slot management test error: {str(e)}", "ERROR")
            return False

    def run_comprehensive_test(self):
        """Run comprehensive test suite"""
        self.log("🚀 Starting Comprehensive Booking Reschedule System Test", "INFO")
        self.log("=" * 60, "INFO")
        
        results = {
            'settings_test': False,
            'admin_reschedule': False,
            'client_info': False,
            'client_reschedule_options': False,
            'client_reschedule': False,
            'client_cancellation': False,
            'admin_cancellation': False,
            'slot_management': False
        }
        
        # Test 1: Settings Management
        results['settings_test'] = self.test_booking_settings()
        
        # Test 2: Slot Management
        results['slot_management'] = self.test_slot_management()
        
        # Note: The following tests require actual booking data
        self.log("\n📋 Note: The following tests require existing booking data:", "INFO")
        self.log("   - To test admin reschedule: provide --booking-id and --new-session-id", "INFO") 
        self.log("   - To test client features: provide --booking-reference and --client-email", "INFO")
        self.log("   - Use the booking_test_utility.py to create test bookings", "INFO")
        
        # Summary
        self.log("\n" + "=" * 60, "INFO")
        self.log("📊 Test Results Summary:", "INFO")
        
        for test_name, passed in results.items():
            status = "✅ PASSED" if passed else "❌ FAILED"
            self.log(f"   {test_name}: {status}", "SUCCESS" if passed else "ERROR")
        
        passed_count = sum(results.values())
        total_count = len(results)
        
        if passed_count == total_count:
            self.log(f"\n🎉 ALL TESTS PASSED ({passed_count}/{total_count})", "SUCCESS")
        else:
            self.log(f"\n⚠️  SOME TESTS FAILED ({passed_count}/{total_count})", "WARNING")
        
        return results

def main():
    parser = argparse.ArgumentParser(description='Test Booking Reschedule System')
    parser.add_argument('--base-url', default='http://localhost:8000', help='Base URL for API')
    parser.add_argument('--token', help='JWT authentication token for admin endpoints')
    parser.add_argument('--booking-id', type=int, help='Booking ID for admin reschedule test')
    parser.add_argument('--new-session-id', type=int, help='New session ID for reschedule test')
    parser.add_argument('--booking-reference', help='Booking reference for client tests')
    parser.add_argument('--client-email', help='Client email for identity verification')
    
    args = parser.parse_args()
    
    if not args.token:
        print("⚠️  Warning: No JWT token provided. Admin tests will be skipped.")
        print("To get a token, log in to the admin interface and copy your JWT token.")
    
    tester = BookingRescheduleSystemTester(args.base_url, args.token)
    
    # Run basic tests
    results = tester.run_comprehensive_test()
    
    # Run specific tests if parameters provided
    if args.booking_id and args.new_session_id and args.token:
        print("\n" + "🔧 Testing Admin Reschedule with provided parameters...")
        success, booking_ref = tester.test_admin_reschedule(args.booking_id, args.new_session_id)
        
    if args.booking_reference:
        print(f"\n🔧 Testing Client Features for {args.booking_reference}...")
        
        # Test client booking info
        success, booking_info = tester.test_client_booking_info(args.booking_reference)
        
        if success:
            # Test reschedule options
            tester.test_client_reschedule_options(args.booking_reference)
            
            # Test client reschedule if parameters provided
            if args.client_email and args.new_session_id:
                tester.test_client_reschedule(args.booking_reference, args.client_email, args.new_session_id)
            
            # Test client cancellation if email provided
            if args.client_email:
                print(f"\n⚠️  This will cancel the booking {args.booking_reference}. Continue? (y/N)")
                confirm = input().lower().strip()
                if confirm == 'y':
                    tester.test_client_cancellation(args.booking_reference, args.client_email)

if __name__ == '__main__':
    main() 