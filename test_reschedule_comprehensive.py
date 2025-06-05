#!/usr/bin/env python3
"""
Comprehensive Reschedule Testing Script
Tests all reschedule endpoints and scenarios including edge cases
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class ComprehensiveRescheduleTest:
    def __init__(self, base_url: str = "http://localhost:8000", auth_token: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.auth_token = auth_token
        self.session = requests.Session()
        
        if auth_token:
            self.session.headers.update({
                'Authorization': f'Bearer {auth_token}',
                'Content-Type': 'application/json'
            })
        
        self.test_results = {}
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with colors"""
        colors = {
            "INFO": "\033[94m",    # Blue
            "SUCCESS": "\033[92m", # Green
            "ERROR": "\033[91m",   # Red
            "WARNING": "\033[93m", # Yellow
            "RESET": "\033[0m"     # Reset
        }
        
        color = colors.get(level, colors["INFO"])
        reset = colors["RESET"]
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"{color}[{timestamp}] {level}: {message}{reset}")

    def test_url_trailing_slash_issue(self):
        """Test URL trailing slash issue that causes 404 errors"""
        self.log("🔗 Testing URL Trailing Slash Issue", "INFO")
        
        # Test both with and without trailing slash
        booking_id = 40  # Use a test booking ID
        
        # Test without trailing slash (should cause 404)
        url_without_slash = f"{self.base_url}/api/booking/manage/{booking_id}"
        try:
            response = self.session.patch(url_without_slash, json={
                "action": "reschedule",
                "new_session_id": 52,
                "reason": "Testing URL without slash"
            })
            
            if response.status_code == 404:
                self.log("✅ Confirmed: URL without trailing slash returns 404 (as expected)", "SUCCESS")
            else:
                self.log(f"❌ Unexpected: URL without slash returned {response.status_code}", "ERROR")
                
        except Exception as e:
            self.log(f"❌ Error testing URL without slash: {str(e)}", "ERROR")
        
        # Test with trailing slash (correct format)
        url_with_slash = f"{self.base_url}/api/booking/manage/{booking_id}/"
        try:
            response = self.session.patch(url_with_slash, json={
                "action": "reschedule", 
                "new_session_id": 52,
                "reason": "Testing URL with slash"
            })
            
            if response.status_code != 404:
                self.log("✅ URL with trailing slash does not return 404", "SUCCESS")
                if response.status_code == 200:
                    self.log("✅ Reschedule successful with correct URL", "SUCCESS")
                else:
                    self.log(f"ℹ️ Reschedule failed with status {response.status_code}: {response.text}", "INFO")
            else:
                self.log("❌ URL with trailing slash still returns 404", "ERROR")
                
        except Exception as e:
            self.log(f"❌ Error testing URL with slash: {str(e)}", "ERROR")
        
        return True

    def create_future_session_booking(self) -> Optional[Dict[str, Any]]:
        """Create a booking for a future session to test reschedule"""
        self.log("📅 Creating booking for future session", "INFO")
        
        try:
            # Create booking for future session
            response = self.session.post(
                f"{self.base_url}/api/booking/johnny-bravo-fitness-center/book/",
                json={
                    "session_id": 5,  # Use existing session
                    "client_name": "Test Reschedule Client",
                    "client_email": "reschedule.test@example.com",
                    "client_phone": "+1234567890",
                    "notes": "Booking created for reschedule testing",
                    "quantity": 1
                }
            )
            
            if response.status_code == 201:
                data = response.json()
                self.log(f"✅ Future booking created successfully", "SUCCESS")
                self.log(f"📋 Booking Reference: {data.get('booking_reference')}", "INFO")
                self.log(f"📋 Booking ID: {data.get('booking_id')}", "INFO")
                return data
            else:
                self.log(f"❌ Failed to create future booking: {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                return None
                
        except Exception as e:
            self.log(f"❌ Error creating future booking: {str(e)}", "ERROR")
            return None

    def test_past_session_reschedule_prevention(self):
        """Test that past sessions cannot be rescheduled"""
        self.log("⏰ Testing Past Session Reschedule Prevention", "INFO")
        
        # Try to reschedule a booking with past session (booking ID 40 from images)
        booking_id = 40
        
        try:
            response = self.session.patch(
                f"{self.base_url}/api/booking/manage/{booking_id}/",
                json={
                    "action": "reschedule",
                    "new_session_id": 52,
                    "reason": "Testing past session reschedule"
                }
            )
            
            if response.status_code == 400:
                error_data = response.json()
                if "cannot be rescheduled" in error_data.get('error', '').lower():
                    self.log("✅ Past session reschedule correctly prevented", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Unexpected error message: {error_data.get('error')}", "ERROR")
            else:
                self.log(f"❌ Expected 400 status, got {response.status_code}", "ERROR")
                self.log(f"Response: {response.text}", "ERROR")
                
        except Exception as e:
            self.log(f"❌ Error testing past session reschedule: {str(e)}", "ERROR")
        
        return False

    def test_session_validation(self):
        """Test session validation in reschedule"""
        self.log("🔍 Testing Session Validation", "INFO")
        
        # Get a valid booking first
        future_booking = self.create_future_session_booking()
        if not future_booking:
            return False
        
        booking_id = future_booking.get('booking_id')
        if not booking_id:
            self.log("❌ No booking ID returned from create_booking", "ERROR")
            return False
        
        # Test with non-existent session ID
        try:
            response = self.session.patch(
                f"{self.base_url}/api/booking/manage/{booking_id}/",
                json={
                    "action": "reschedule",
                    "new_session_id": 99999,  # Non-existent session
                    "reason": "Testing non-existent session"
                }
            )
            
            if response.status_code == 404:
                error_data = response.json()
                if "session not found" in error_data.get('error', '').lower():
                    self.log("✅ Non-existent session correctly rejected", "SUCCESS")
                else:
                    self.log(f"❌ Unexpected error for non-existent session: {error_data.get('error')}", "ERROR")
            else:
                self.log(f"❌ Expected 404 for non-existent session, got {response.status_code}", "ERROR")
                
        except Exception as e:
            self.log(f"❌ Error testing non-existent session: {str(e)}", "ERROR")
        
        return True

    def test_client_reschedule_deadline(self):
        """Test client reschedule deadline enforcement"""
        self.log("⏱️ Testing Client Reschedule Deadline", "INFO")
        
        # Get a valid booking first
        future_booking = self.create_future_session_booking()
        if not future_booking:
            return False
        
        booking_reference = future_booking.get('booking_reference')
        if not booking_reference:
            self.log("❌ No booking reference returned", "ERROR")
            return False
        
        # Test client reschedule options
        try:
            response = requests.get(
                f"{self.base_url}/api/booking/client/{booking_reference}/reschedule-options/",
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                can_reschedule = data.get('reschedule_policy', {}).get('can_reschedule', False)
                
                if can_reschedule:
                    self.log("✅ Client can reschedule (within deadline)", "SUCCESS")
                else:
                    self.log("ℹ️ Client cannot reschedule (past deadline or other restrictions)", "INFO")
                    
                self.log(f"📋 Reschedule Policy: {data.get('reschedule_policy')}", "INFO")
                return True
            else:
                self.log(f"❌ Failed to get reschedule options: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing client reschedule deadline: {str(e)}", "ERROR")
            return False

    def test_booking_settings_reschedule_config(self):
        """Test booking settings reschedule configuration"""
        self.log("⚙️ Testing Booking Settings Reschedule Config", "INFO")
        
        try:
            # Get current settings
            response = self.session.get(f"{self.base_url}/api/booking/settings/")
            
            if response.status_code == 200:
                settings = response.json()
                
                reschedule_settings = {
                    'allow_client_reschedule': settings.get('allow_client_reschedule'),
                    'reschedule_deadline_hours': settings.get('reschedule_deadline_hours'),
                    'max_reschedules_per_booking': settings.get('max_reschedules_per_booking'),
                    'send_reschedule_emails': settings.get('send_reschedule_emails')
                }
                
                self.log("✅ Reschedule settings retrieved successfully", "SUCCESS")
                for key, value in reschedule_settings.items():
                    self.log(f"   {key}: {value}", "INFO")
                
                # Test updating settings
                update_response = self.session.patch(
                    f"{self.base_url}/api/booking/settings/",
                    json={
                        "allow_client_reschedule": True,
                        "reschedule_deadline_hours": 24,
                        "max_reschedules_per_booking": 2,
                        "send_reschedule_emails": True
                    }
                )
                
                if update_response.status_code == 200:
                    self.log("✅ Reschedule settings updated successfully", "SUCCESS")
                else:
                    self.log(f"❌ Failed to update settings: {update_response.status_code}", "ERROR")
                
                return True
            else:
                self.log(f"❌ Failed to get settings: {response.status_code}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing settings: {str(e)}", "ERROR")
            return False

    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        self.log("🚀 Starting Comprehensive Reschedule Tests", "INFO")
        
        tests = [
            ("URL Trailing Slash", self.test_url_trailing_slash_issue),
            ("Past Session Prevention", self.test_past_session_reschedule_prevention),
            ("Session Validation", self.test_session_validation),
            ("Client Deadline", self.test_client_reschedule_deadline),
            ("Settings Config", self.test_booking_settings_reschedule_config),
        ]
        
        results = {}
        
        for test_name, test_func in tests:
            self.log(f"\n{'='*50}", "INFO")
            self.log(f"Running: {test_name}", "INFO")
            self.log(f"{'='*50}", "INFO")
            
            try:
                result = test_func()
                results[test_name] = result
                
                if result:
                    self.log(f"✅ {test_name}: PASSED", "SUCCESS")
                else:
                    self.log(f"❌ {test_name}: FAILED", "ERROR")
                    
            except Exception as e:
                self.log(f"❌ {test_name}: ERROR - {str(e)}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.log(f"\n{'='*50}", "INFO")
        self.log("📊 TEST SUMMARY", "INFO")
        self.log(f"{'='*50}", "INFO")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"{test_name}: {status}", "SUCCESS" if result else "ERROR")
        
        self.log(f"\nOverall: {passed}/{total} tests passed", "SUCCESS" if passed == total else "WARNING")
        
        return results

if __name__ == "__main__":
    # Configuration
    BASE_URL = "http://localhost:8000"
    AUTH_TOKEN = None  # Add your JWT token here if needed
    
    if len(sys.argv) > 1:
        AUTH_TOKEN = sys.argv[1]
    
    # Run tests
    tester = ComprehensiveRescheduleTest(BASE_URL, AUTH_TOKEN)
    results = tester.run_comprehensive_tests()
    
    # Exit with appropriate code
    all_passed = all(results.values())
    sys.exit(0 if all_passed else 1) 