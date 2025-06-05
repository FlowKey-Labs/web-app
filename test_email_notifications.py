#!/usr/bin/env python3
"""
Test script for email notifications in the booking system
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
BUSINESS_SLUG = "johnny-bravo-fitness-center"

def colored_print(message, color="white"):
    """Print colored messages"""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m", 
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "purple": "\033[95m",
        "cyan": "\033[96m",
        "white": "\033[97m",
        "reset": "\033[0m"
    }
    print(f"{colors.get(color, colors['white'])}{message}{colors['reset']}")

def test_booking_creation():
    """Test booking creation"""
    colored_print("\n=== Testing Booking Creation ===", "blue")
    
    booking_data = {
        "session_id": 5,
        "client_name": "Email Test User",
        "client_email": "thismyr2@gmail.com",
        "client_phone": "+1234567891",
        "notes": "Testing email notifications",
        "selected_date": "2025-06-04",
        "selected_time": "10:00",
        "selected_end_time": "11:00",
        "quantity": 1
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/booking/{BUSINESS_SLUG}/book/",
            json=booking_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            result = response.json()
            colored_print(f"✅ Booking created: {result.get('booking_reference')}", "green")
            colored_print(f"   Status: {result.get('status')}", "green")
            return result.get('booking_reference')
        else:
            colored_print(f"❌ Failed to create booking: {response.text}", "red")
            return None
            
    except Exception as e:
        colored_print(f"❌ Error creating booking: {str(e)}", "red")
        return None

def test_client_cancellation(booking_ref):
    """Test client cancellation and admin email notification"""
    colored_print(f"\n=== Testing Client Cancellation: {booking_ref} ===", "blue")
    
    cancel_data = {
        "client_email": "thismyr2@gmail.com",
        "reason": "Testing admin email notification system"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/booking/client/{booking_ref}/cancel/",
            json=cancel_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            colored_print(f"✅ Cancellation successful", "green")
            colored_print(f"   Reference: {result.get('booking_reference')}", "green")
            colored_print(f"   Status: {result.get('status')}", "green")
            colored_print(f"   Reason: {result.get('cancellation_reason')}", "green")
            return True
        else:
            colored_print(f"❌ Failed to cancel booking: {response.text}", "red")
            return False
            
    except Exception as e:
        colored_print(f"❌ Error cancelling booking: {str(e)}", "red")
        return False

def check_booking_status(booking_ref):
    """Check booking status"""
    colored_print(f"\n=== Checking Booking Status: {booking_ref} ===", "blue")
    
    try:
        response = requests.get(f"{BASE_URL}/api/booking/status/{booking_ref}/")
        
        if response.status_code == 200:
            result = response.json()
            colored_print(f"✅ Status retrieved", "green")
            colored_print(f"   Status: {result.get('status')}", "green")
            colored_print(f"   Cancelled: {result.get('cancellation_info', {}).get('cancelled_at', 'No')}", "green")
            return result
        else:
            colored_print(f"❌ Failed to get status: {response.text}", "red")
            return None
            
    except Exception as e:
        colored_print(f"❌ Error checking status: {str(e)}", "red")
        return None

def main():
    """Main test function"""
    colored_print("🧪 EMAIL NOTIFICATION TEST SUITE", "purple")
    colored_print("=" * 50, "purple")
    
    # Test 1: Create a booking
    booking_ref = test_booking_creation()
    if not booking_ref:
        colored_print("❌ Cannot proceed without booking reference", "red")
        return
        
    time.sleep(2)  # Wait for emails to be processed
    
    # Test 2: Check status before cancellation
    colored_print(f"\n📊 Before cancellation:", "yellow")
    check_booking_status(booking_ref)
    
    time.sleep(1)
    
    # Test 3: Cancel the booking (should trigger client + admin emails)
    if test_client_cancellation(booking_ref):
        time.sleep(2)  # Wait for emails to be processed
        
        # Test 4: Check status after cancellation
        colored_print(f"\n📊 After cancellation:", "yellow")
        check_booking_status(booking_ref)
    
    colored_print("\n✨ Test completed! Check email inboxes:", "purple")
    colored_print("   📧 Client email: thismyr2@gmail.com (cancellation confirmation)", "cyan")
    colored_print("   📧 Admin emails:", "cyan")
    colored_print("      - karanimwangi.dev@gmail.com (business contact)", "cyan")
    colored_print("      - johnnybravo@gmail.com (business owner)", "cyan")

if __name__ == "__main__":
    main() 