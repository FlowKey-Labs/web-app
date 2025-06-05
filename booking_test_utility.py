#!/usr/bin/env python3
"""
Booking Test Utility Script

This script helps with testing the booking system by:
1. Cleaning up test booking data
2. Creating contiguous test sessions for easy testing
3. Generating test bookings with various statuses

Usage:
    python booking_test_utility.py --help
    python booking_test_utility.py clean --all
    python booking_test_utility.py create-sessions --business-slug=johnny-bravo-fitness-center
    python booking_test_utility.py create-bookings --count=10
"""

import os
import sys
import argparse
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict

# Configuration
BASE_URL = "http://127.0.0.1:8000"
ADMIN_EMAIL = "johnnybravo@gmail.com"
ADMIN_PASSWORD = "securepassword123"

class BookingTestUtility:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.business_slug = None
        
    def authenticate(self) -> bool:
        """Authenticate with the admin user"""
        try:
            login_data = {
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login/", json=login_data)
            
            if response.status_code == 200:
                result = response.json()
                self.auth_token = result.get('access')
                self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                print(f"✅ Authenticated successfully as {ADMIN_EMAIL}")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {str(e)}")
            return False
    
    def clean_bookings(self, delete_all: bool = False, delete_specific_emails: List[str] = None) -> int:
        """Clean up booking data"""
        if not self.auth_token:
            print("❌ Not authenticated")
            return 0
        
        try:
            # Get all bookings
            response = self.session.get(f"{BASE_URL}/api/booking/manage/?include_deleted=true")
            
            if response.status_code != 200:
                print(f"❌ Failed to fetch bookings: {response.status_code}")
                return 0
            
            bookings = response.json().get('bookings', [])
            print(f"📊 Found {len(bookings)} total bookings")
            
            deleted_count = 0
            
            for booking in bookings:
                should_delete = False
                booking_id = booking['id']
                client_email = booking.get('client_email', '').lower()
                client_name = booking.get('client_name', '')
                
                if delete_all:
                    should_delete = True
                elif delete_specific_emails:
                    should_delete = any(email.lower() in client_email for email in delete_specific_emails)
                else:
                    # Default: delete test emails and common test patterns
                    test_patterns = [
                        'test@', 'example@', 'fake@', 'demo@', 'temp@',
                        '@test.', '@example.', '@fake.', '@demo.', '@temp.',
                        'test', 'example', 'fake', 'demo', 'temp', 'sample'
                    ]
                    should_delete = any(pattern in client_email.lower() or pattern in client_name.lower() 
                                      for pattern in test_patterns)
                
                if should_delete:
                    try:
                        # Try soft delete first
                        delete_response = self.session.patch(
                            f"{BASE_URL}/api/booking/manage/{booking_id}/",
                            json={
                                "action": "soft_delete",
                                "reason": "Test data cleanup"
                            }
                        )
                        
                        if delete_response.status_code == 200:
                            print(f"🗑️  Soft deleted booking {booking['booking_reference']} ({client_name})")
                            deleted_count += 1
                        else:
                            # Try hard delete if soft delete fails
                            hard_delete_response = self.session.delete(f"{BASE_URL}/api/booking/manage/{booking_id}/")
                            
                            if hard_delete_response.status_code == 200:
                                print(f"🗑️  Hard deleted booking {booking['booking_reference']} ({client_name})")
                                deleted_count += 1
                            else:
                                print(f"❌ Failed to delete booking {booking['booking_reference']}: {hard_delete_response.status_code}")
                    
                    except Exception as e:
                        print(f"❌ Error deleting booking {booking_id}: {str(e)}")
            
            print(f"✅ Cleaned up {deleted_count} bookings")
            return deleted_count
            
        except Exception as e:
            print(f"❌ Error during cleanup: {str(e)}")
            return 0
    
    def create_test_sessions(self, business_slug: str, count: int = 7) -> List[Dict]:
        """Create contiguous test sessions for easy testing"""
        print(f"🔧 Creating {count} test sessions for business: {business_slug}")
        
        # This would typically require direct database access or admin APIs
        # For now, let's create a guide for manual session creation
        
        start_date = datetime.now() + timedelta(days=1)
        sessions = []
        
        for i in range(count):
            session_date = start_date + timedelta(days=i)
            session_info = {
                'title': f'Test Session {i+1}',
                'date': session_date.strftime('%Y-%m-%d'),
                'start_time': '10:00:00',
                'end_time': '11:00:00',
                'capacity': 10,
                'category': 'Fitness Class',
                'description': f'Test session for booking system testing - Day {i+1}'
            }
            sessions.append(session_info)
        
        print(f"📋 Session creation guide:")
        print(f"Create the following sessions manually in the admin panel:")
        print(f"Business: {business_slug}")
        print("-" * 50)
        
        for i, session in enumerate(sessions, 1):
            print(f"{i}. {session['title']}")
            print(f"   Date: {session['date']}")
            print(f"   Time: {session['start_time']} - {session['end_time']}")
            print(f"   Capacity: {session['capacity']}")
            print()
        
        return sessions
    
    def create_test_bookings(self, business_slug: str, count: int = 5) -> List[Dict]:
        """Create test bookings with various statuses"""
        print(f"🎯 Creating {count} test bookings for business: {business_slug}")
        
        if not self.auth_token:
            print("❌ Not authenticated")
            return []
        
        # Test email patterns that are easy to remember and clean up
        test_emails = [
            'test1@example.com',
            'test2@example.com', 
            'test3@example.com',
            'demo@test.com',
            'sample@demo.com'
        ]
        
        test_names = [
            'Test User One',
            'Test User Two',
            'Test User Three', 
            'Demo Client',
            'Sample Customer'
        ]
        
        # First, get available sessions
        try:
            sessions_response = self.session.get(f"{BASE_URL}/api/booking/{business_slug}/services/")
            
            if sessions_response.status_code != 200:
                print(f"❌ Failed to fetch sessions: {sessions_response.status_code}")
                return []
            
            # This would need to be adapted based on your actual API structure
            print("📋 To create test bookings, use the following data:")
            print("-" * 50)
            
            created_bookings = []
            
            for i in range(min(count, len(test_emails))):
                booking_data = {
                    'client_name': test_names[i],
                    'client_email': test_emails[i],
                    'client_phone': f'+1234567890{i}',
                    'notes': f'Test booking {i+1} - Safe to delete',
                    'quantity': 1 if i < 3 else 2,  # Mix of single and group bookings
                }
                
                print(f"{i+1}. {booking_data}")
                created_bookings.append(booking_data)
            
            print("\n💡 Use these details to create bookings through the booking form")
            print("💡 These emails are marked as test data and will be cleaned up automatically")
            
            return created_bookings
            
        except Exception as e:
            print(f"❌ Error creating test bookings: {str(e)}")
            return []
    
    def show_current_bookings(self) -> None:
        """Display current bookings for review"""
        if not self.auth_token:
            print("❌ Not authenticated")
            return
        
        try:
            response = self.session.get(f"{BASE_URL}/api/booking/manage/")
            
            if response.status_code != 200:
                print(f"❌ Failed to fetch bookings: {response.status_code}")
                return
            
            bookings = response.json().get('bookings', [])
            
            print(f"📊 Current Bookings ({len(bookings)} total)")
            print("=" * 80)
            
            if not bookings:
                print("No bookings found.")
                return
            
            for booking in bookings[:20]:  # Show first 20
                status_emoji = {
                    'pending': '⏳',
                    'approved': '✅', 
                    'rejected': '❌',
                    'cancelled': '🚫',
                    'expired': '⏰'
                }.get(booking['status'], '❓')
                
                print(f"{status_emoji} {booking['booking_reference']} | "
                      f"{booking['client_name']} ({booking.get('client_email', 'No email')}) | "
                      f"{booking['status']} | "
                      f"Qty: {booking.get('quantity', 1)}")
            
            if len(bookings) > 20:
                print(f"... and {len(bookings) - 20} more bookings")
                
        except Exception as e:
            print(f"❌ Error fetching bookings: {str(e)}")


def main():
    parser = argparse.ArgumentParser(description='Booking System Test Utility')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Clean command
    clean_parser = subparsers.add_parser('clean', help='Clean up test booking data')
    clean_parser.add_argument('--all', action='store_true', help='Delete all bookings (use with caution)')
    clean_parser.add_argument('--emails', nargs='+', help='Delete bookings with specific email patterns')
    
    # Create sessions command
    sessions_parser = subparsers.add_parser('create-sessions', help='Create test sessions')
    sessions_parser.add_argument('--business-slug', required=True, help='Business slug to create sessions for')
    sessions_parser.add_argument('--count', type=int, default=7, help='Number of sessions to create')
    
    # Create bookings command
    bookings_parser = subparsers.add_parser('create-bookings', help='Create test bookings')
    bookings_parser.add_argument('--business-slug', required=True, help='Business slug to create bookings for')
    bookings_parser.add_argument('--count', type=int, default=5, help='Number of bookings to create')
    
    # Show bookings command
    subparsers.add_parser('show', help='Show current bookings')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Initialize utility
    utility = BookingTestUtility()
    
    if not utility.authenticate():
        return
    
    # Execute command
    if args.command == 'clean':
        if args.all:
            print("⚠️  WARNING: This will delete ALL bookings!")
            confirm = input("Type 'DELETE ALL' to confirm: ")
            if confirm == 'DELETE ALL':
                utility.clean_bookings(delete_all=True)
            else:
                print("❌ Operation cancelled")
        elif args.emails:
            utility.clean_bookings(delete_specific_emails=args.emails)
        else:
            utility.clean_bookings()  # Clean test patterns
    
    elif args.command == 'create-sessions':
        utility.create_test_sessions(args.business_slug, args.count)
    
    elif args.command == 'create-bookings':
        utility.create_test_bookings(args.business_slug, args.count)
    
    elif args.command == 'show':
        utility.show_current_bookings()


if __name__ == '__main__':
    main() 