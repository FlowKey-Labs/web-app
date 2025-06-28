/**
 * Comprehensive Timezone Testing Utility
 * Tests timezone conversion accuracy and edge cases for production deployment
 */

import { DateTime } from 'luxon';
import {
  safeConvertTimezone,
  convertBookingTime,
  formatBookingTime,
  processAvailabilitySlots,
  validateBookingTimezone,
  getTimezoneOptions,
  getUserTimezone,
  isValidTimezone
} from './timezone';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  error?: string;
  expected?: any;
  actual?: any;
}

interface TestSuite {
  suiteName: string;
  results: TestResult[];
  passed: number;
  failed: number;
  total: number;
}

export class TimezoneTestSuite {
  private results: TestSuite[] = [];

  /**
   * Run all timezone tests
   */
  async runAllTests(): Promise<{ 
    overallPass: boolean; 
    suites: TestSuite[]; 
    summary: { 
      totalTests: number; 
      passed: number; 
      failed: number; 
      passRate: number;
    } 
  }> {
    console.log('🧪 Starting comprehensive timezone testing...');

    // Run test suites
    await this.testBasicConversions();
    await this.testBookingTimeConversions();
    await this.testAvailabilitySlotProcessing();
    await this.testEdgeCases();
    await this.testValidation();
    await this.testRealWorldScenarios();

    // Calculate summary
    const totalTests = this.results.reduce((sum, suite) => sum + suite.total, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    const summary = {
      totalTests,
      passed: totalPassed,
      failed: totalFailed,
      passRate
    };

    console.log('📊 Test Summary:', summary);
    
    return {
      overallPass: totalFailed === 0,
      suites: this.results,
      summary
    };
  }

  private createTest(testName: string, testFn: () => void | Promise<void>): TestResult {
    try {
      const result = testFn();
      if (result instanceof Promise) {
        throw new Error('Async test functions not supported in this context');
      }
      return {
        testName,
        passed: true,
        details: 'Test passed successfully'
      };
    } catch (error) {
      return {
        testName,
        passed: false,
        details: 'Test failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async testBasicConversions(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Basic Timezone Conversions',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test 1: EAT to UTC conversion
    suite.results.push(this.createTest('EAT to UTC conversion', () => {
      const result = safeConvertTimezone('2025-06-25T14:00:00', 'Africa/Nairobi', 'UTC');
      if (!result.success || !result.convertedTime) {
        throw new Error('Conversion failed');
      }
      const expected = '11:00';
      const actual = result.convertedTime.toFormat('HH:mm');
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    }));

    // Test 2: UTC to New York conversion
    suite.results.push(this.createTest('UTC to New York conversion', () => {
      const result = safeConvertTimezone('2025-06-25T14:00:00', 'UTC', 'America/New_York');
      if (!result.success || !result.convertedTime) {
        throw new Error('Conversion failed');
      }
      // Should be EDT in June (UTC-4)
      const expectedHour = 10; // 14:00 UTC - 4 hours = 10:00 EDT
      const actualHour = result.convertedTime.hour;
      if (actualHour !== expectedHour) {
        throw new Error(`Expected hour ${expectedHour}, got ${actualHour}`);
      }
    }));

    // Test 3: Cross-date conversion
    suite.results.push(this.createTest('Cross-date conversion', () => {
      const result = safeConvertTimezone('2025-06-25T01:00:00', 'America/Los_Angeles', 'Asia/Singapore');
      if (!result.success || !result.convertedTime) {
        throw new Error('Conversion failed');
      }
      // LA is UTC-7 in June, Singapore is UTC+8
      // 01:00 PDT (UTC-7) = 08:00 UTC = 16:00 SGT (UTC+8)
      const expected = '16:00';
      const actual = result.convertedTime.toFormat('HH:mm');
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    }));

    this.calculateSuiteResults(suite);
    this.results.push(suite);
  }

  private async testBookingTimeConversions(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Booking Time Conversions',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test booking time conversion from string inputs
    suite.results.push(this.createTest('Booking time conversion', () => {
      const result = convertBookingTime('2025-06-25', '14:00', 'Africa/Nairobi', 'America/New_York');
      if (!result.success || !result.convertedTime) {
        throw new Error('Conversion failed');
      }
      // EAT is UTC+3, EDT is UTC-4, so 14:00 EAT = 07:00 EDT
      const expected = '07:00';
      const actual = result.convertedTime.toFormat('HH:mm');
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    }));

    // Test format booking time
    suite.results.push(this.createTest('Format booking time', () => {
      const formatted = formatBookingTime('14:00', '2025-06-25', 'Africa/Nairobi', 'America/New_York', false);
      if (!formatted.includes('7:00')) {
        throw new Error(`Expected time around 7:00, got ${formatted}`);
      }
    }));

    this.calculateSuiteResults(suite);
    this.results.push(suite);
  }

  private async testAvailabilitySlotProcessing(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Availability Slot Processing',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    const mockSlots = [
      {
        id: '1',
        session_id: 1,
        date: '2025-06-25',
        start_time: '14:00',
        end_time: '15:00',
        duration_minutes: 60,
        session_title: 'Test Session',
        available_spots: 20,
        total_spots: 20,
        confirmed_bookings: 0,
        pending_bookings: 0,
        capacity_status: 'available' as const,
        location: 'Main Location',
        staff_name: 'Staff',
        is_bookable: true
      }
    ];

    suite.results.push(this.createTest('Process availability slots', () => {
      const processed = processAvailabilitySlots(mockSlots, 'Africa/Nairobi', 'America/New_York');
      if (processed.length !== 1) {
        throw new Error(`Expected 1 slot, got ${processed.length}`);
      }
      
      const slot = processed[0];
      if (!slot.timezone_converted) {
        throw new Error('Slot should be marked as timezone converted');
      }
      
      if (!slot.start_time_display || !slot.end_time_display) {
        throw new Error('Display times not generated');
      }
      
      // Check that original values are preserved
      if (slot.original_date !== '2025-06-25' || slot.original_start_time !== '14:00') {
        throw new Error('Original values not preserved');
      }
    }));

    this.calculateSuiteResults(suite);
    this.results.push(suite);
  }

  private async testEdgeCases(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Edge Cases',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test invalid timezone handling
    suite.results.push(this.createTest('Invalid timezone handling', () => {
      const result = safeConvertTimezone('2025-06-25T14:00:00', 'Invalid/Timezone', 'UTC');
      if (result.success) {
        throw new Error('Should have failed with invalid timezone');
      }
      if (!result.fallbackTime) {
        throw new Error('Should provide fallback time');
      }
    }));

    // Test empty time handling
    suite.results.push(this.createTest('Empty time handling', () => {
      const result = safeConvertTimezone('', 'UTC', 'America/New_York');
      if (result.success) {
        throw new Error('Should have failed with empty time');
      }
    }));

    // Test DST transition
    suite.results.push(this.createTest('DST transition handling', () => {
      // Test a date during DST transition
      const result = safeConvertTimezone('2025-03-09T07:00:00', 'UTC', 'America/New_York');
      if (!result.success || !result.convertedTime) {
        throw new Error('DST conversion should succeed');
      }
      // During DST, New York is UTC-4, so 07:00 UTC = 03:00 EDT
      const expectedHour = 3;
      const actualHour = result.convertedTime.hour;
      if (actualHour !== expectedHour) {
        throw new Error(`Expected hour ${expectedHour} during DST, got ${actualHour}`);
      }
    }));

    this.calculateSuiteResults(suite);
    this.results.push(suite);
  }

  private async testValidation(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Validation Functions',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test timezone validation
    suite.results.push(this.createTest('Timezone validation', () => {
      const validResult = validateBookingTimezone('Africa/Nairobi');
      if (!validResult.isValid) {
        throw new Error('Valid timezone should pass validation');
      }

      const invalidResult = validateBookingTimezone('Invalid/Timezone');
      if (invalidResult.isValid) {
        throw new Error('Invalid timezone should fail validation');
      }
    }));

    // Test timezone options
    suite.results.push(this.createTest('Timezone options generation', () => {
      const options = getTimezoneOptions();
      if (options.length === 0) {
        throw new Error('Should return timezone options');
      }
      
      const eatGroup = options.find(group => group.group === 'East African Time');
      if (!eatGroup || eatGroup.items.length === 0) {
        throw new Error('Should include East African Time group');
      }
    }));

    // Test user timezone detection
    suite.results.push(this.createTest('User timezone detection', () => {
      const userTz = getUserTimezone();
      if (!userTz || !isValidTimezone(userTz)) {
        throw new Error('Should return valid user timezone');
      }
    }));

    this.calculateSuiteResults(suite);
    this.results.push(suite);
  }

  private async testRealWorldScenarios(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'Real World Scenarios',
      results: [],
      passed: 0,
      failed: 0,
      total: 0
    };

    // Test image scenario: EAT sessions viewed from different timezones
    suite.results.push(this.createTest('Image scenario replication', () => {
      // Test Session: 2:00 PM - 3:00 PM EAT
      // Toner Class: 7:00 PM - 8:00 PM EAT
      
      const testSession = convertBookingTime('2025-06-25', '14:00', 'Africa/Nairobi', 'America/New_York');
      const tonerClass = convertBookingTime('2025-06-25', '19:00', 'Africa/Nairobi', 'America/New_York');
      
      if (!testSession.success || !tonerClass.success) {
        throw new Error('EAT to EDT conversion should succeed');
      }
      
      // 14:00 EAT (UTC+3) = 11:00 UTC = 07:00 EDT (UTC-4)
      // 19:00 EAT (UTC+3) = 16:00 UTC = 12:00 EDT (UTC-4)
      
      const testSessionTime = testSession.convertedTime!.toFormat('h:mm a');
      const tonerClassTime = tonerClass.convertedTime!.toFormat('h:mm a');
      
      if (!testSessionTime.includes('7:00')) {
        throw new Error(`Test session should be around 7:00 AM EDT, got ${testSessionTime}`);
      }
      
      if (!tonerClassTime.includes('12:00')) {
        throw new Error(`Toner class should be around 12:00 PM EDT, got ${tonerClassTime}`);
      }
    }));

    // Test multiple timezone scenario
    suite.results.push(this.createTest('Multiple timezone consistency', () => {
      const baseTime = '2025-06-25T14:00:00';
      const sourceTimezone = 'Africa/Nairobi';
      
      const timezones = ['UTC', 'America/New_York', 'Asia/Singapore', 'Europe/London'];
      const conversions = timezones.map(tz => safeConvertTimezone(baseTime, sourceTimezone, tz));
      
      // All conversions should succeed
      if (!conversions.every(c => c.success)) {
        throw new Error('All timezone conversions should succeed');
      }
      
      // Convert back to source timezone - should match original
      const backConversions = conversions.map((c, i) => 
        safeConvertTimezone(c.convertedTime!.toISO()!, timezones[i], sourceTimezone)
      );
      
      if (!backConversions.every(c => c.success)) {
        throw new Error('All back conversions should succeed');
      }
      
      // All should result in the same time when converted back
      const originalHour = DateTime.fromISO(baseTime, { zone: sourceTimezone }).hour;
      backConversions.forEach((c, i) => {
        if (c.convertedTime!.hour !== originalHour) {
          throw new Error(`Back conversion for ${timezones[i]} failed: expected hour ${originalHour}, got ${c.convertedTime!.hour}`);
        }
      });
    }));

    this.calculateSuiteResults(suite);
    this.results.push(suite);
  }

  private calculateSuiteResults(suite: TestSuite): void {
    suite.total = suite.results.length;
    suite.passed = suite.results.filter(r => r.passed).length;
    suite.failed = suite.results.filter(r => !r.passed).length;
  }

  /**
   * Generate a detailed test report
   */
  generateReport(): string {
    let report = '# Timezone Implementation Test Report\n\n';
    
    const totalTests = this.results.reduce((sum, suite) => sum + suite.total, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const passRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;
    
    report += `## Summary\n`;
    report += `- **Total Tests**: ${totalTests}\n`;
    report += `- **Passed**: ${totalPassed}\n`;
    report += `- **Failed**: ${totalFailed}\n`;
    report += `- **Pass Rate**: ${passRate.toFixed(1)}%\n\n`;
    
    // Add suite details
    this.results.forEach(suite => {
      report += `## ${suite.suiteName}\n`;
      report += `**Results**: ${suite.passed}/${suite.total} passed\n\n`;
      
      suite.results.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        report += `${status} **${test.testName}**: ${test.details}\n`;
        if (test.error) {
          report += `   Error: ${test.error}\n`;
        }
        report += '\n';
      });
    });
    
    return report;
  }
}

/**
 * Quick test function for development
 */
export async function runQuickTimezoneTest(): Promise<boolean> {
  const testSuite = new TimezoneTestSuite();
  const results = await testSuite.runAllTests();
  
  console.log('🧪 Quick Timezone Test Results:');
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  console.log(`📊 Pass Rate: ${results.summary.passRate.toFixed(1)}%`);
  
  if (results.summary.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.suites.forEach(suite => {
      suite.results.filter(r => !r.passed).forEach(test => {
        console.log(`  - ${suite.suiteName}: ${test.testName} - ${test.error}`);
      });
    });
  }
  
  return results.overallPass;
}

/**
 * Test specific timezone conversion scenario
 */
export function testTimezoneScenario(
  date: string,
  time: string,
  fromTimezone: string,
  toTimezone: string
): { success: boolean; result?: string; error?: string } {
  try {
    const conversion = convertBookingTime(date, time, fromTimezone, toTimezone);
    
    if (!conversion.success) {
      return {
        success: false,
        error: conversion.error
      };
    }
    
    const formatted = conversion.convertedTime!.toFormat('h:mm a');
    return {
      success: true,
      result: `${date} ${time} ${fromTimezone} → ${formatted} ${toTimezone}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 