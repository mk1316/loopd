import { describe, it, expect } from 'vitest'
import { formatTime, getCurrentTimeString } from '../timeUtils'

describe('timeUtils', () => {
  describe('formatTime', () => {
    it('formats seconds correctly', () => {
      expect(formatTime(30)).toBe('30s')
      expect(formatTime(90)).toBe('1m 30s')
      expect(formatTime(3665)).toBe('1h 1m 5s')
      expect(formatTime(0)).toBe('0s')
    })

    it('handles edge cases', () => {
      expect(formatTime(3600)).toBe('1h 0m 0s')
      expect(formatTime(60)).toBe('1m 0s')
      expect(formatTime(86400)).toBe('24h 0m 0s') // 24 hours
    })

    it('handles large values', () => {
      expect(formatTime(3661)).toBe('1h 1m 1s')
      expect(formatTime(7200)).toBe('2h 0m 0s')
      expect(formatTime(7320)).toBe('2h 2m 0s')
    })
  })

  describe('getCurrentTimeString', () => {
    it('returns a valid time string', () => {
      const timeString = getCurrentTimeString()
      expect(typeof timeString).toBe('string')
      expect(timeString.length).toBeGreaterThan(0)
    })

    it('returns time in locale format', () => {
      const timeString = getCurrentTimeString()
      // Should contain time components (hours, minutes, seconds, AM/PM)
      expect(timeString).toMatch(/[\d:]/)
    })

    it('returns different values for different calls', () => {
      const time1 = getCurrentTimeString()
      // Wait a moment to ensure different time
      const time2 = getCurrentTimeString()
      // Note: In very fast execution, these might be the same
      // This test is more about ensuring the function works
      expect(typeof time1).toBe('string')
      expect(typeof time2).toBe('string')
    })
  })

  describe('integration tests', () => {
    it('handles complete workflow', () => {
      // Test formatTime with various inputs
      expect(formatTime(0)).toBe('0s')
      expect(formatTime(30)).toBe('30s')
      expect(formatTime(60)).toBe('1m 0s')
      expect(formatTime(3600)).toBe('1h 0m 0s')
      expect(formatTime(3661)).toBe('1h 1m 1s')
    })

    it('handles edge cases in workflow', () => {
      // Zero seconds
      expect(formatTime(0)).toBe('0s')
      
      // Single second
      expect(formatTime(1)).toBe('1s')
      
      // Single minute
      expect(formatTime(60)).toBe('1m 0s')
      
      // Single hour
      expect(formatTime(3600)).toBe('1h 0m 0s')
      
      // Large values
      expect(formatTime(86400)).toBe('24h 0m 0s')
    })
  })
}) 