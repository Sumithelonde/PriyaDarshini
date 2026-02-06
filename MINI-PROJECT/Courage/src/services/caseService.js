/**
 * Case API Service
 * Handles all API calls for case management using Axios
 */

import axios from 'axios';

// Base API URL - configure based on your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock case database
const MOCK_CASES = {
  'CC/2026/A7B3C': {
    caseNumber: 'CC/2026/A7B3C',
    caseType: 'Civil',
    courtName: 'District Court, Delhi',
    status: 'In Progress',
    filedDate: '2025-06-15',
    nextHearingDate: '2026-02-20',
    history: [
      { event: 'Case Filed', date: '2025-06-15' },
      { event: 'First Hearing', date: '2025-07-10' },
      { event: 'Arguments Heard', date: '2025-09-20' },
      { event: 'Evidence Submitted', date: '2025-12-01' }
    ]
  },
  'CC/2025/X9Y2Z': {
    caseNumber: 'CC/2025/X9Y2Z',
    caseType: 'Criminal',
    courtName: 'High Court, Mumbai',
    status: 'Pending',
    filedDate: '2025-03-20',
    nextHearingDate: '2026-03-15',
    history: [
      { event: 'FIR Registered', date: '2025-03-20' },
      { event: 'Investigation Started', date: '2025-04-01' }
    ]
  },
  'CC/2024/M5N8P': {
    caseNumber: 'CC/2024/M5N8P',
    caseType: 'Property',
    courtName: 'Civil Court, Bangalore',
    status: 'Closed',
    filedDate: '2024-01-10',
    nextHearingDate: null,
    history: [
      { event: 'Case Filed', date: '2024-01-10' },
      { event: 'Hearing Completed', date: '2024-08-15' },
      { event: 'Judgment Delivered', date: '2024-12-01' }
    ]
  },
  'CC/2025/M5N9P': {
    caseNumber: 'CC/2025/M5N9P',
    caseType: 'Property',
    courtName: 'Civil Court, Bangalore',
    status: 'Closed',
    filedDate: '2024-01-10',
    nextHearingDate: null,
    history: [
      { event: 'Case Filed', date: '2024-01-10' },
      { event: 'Hearing Completed', date: '2024-08-15' },
      { event: 'Judgment Delivered', date: '2024-12-01' }
    ]
  },
  'CC/2026/L2K9J': {
    caseNumber: 'CC/2026/L2K9J',
    caseType: 'Labor',
    courtName: 'Industrial Court, Pune',
    status: 'In Progress',
    filedDate: '2025-11-20',
    nextHearingDate: '2026-03-10',
    history: [
      { event: 'Case Filed', date: '2025-11-20' },
      { event: 'Preliminary Hearing', date: '2025-12-05' },
      { event: 'Arguments Scheduled', date: '2026-01-15' }
    ]
  },
  'CC/2025/F4G8H': {
    caseNumber: 'CC/2025/F4G8H',
    caseType: 'Family',
    courtName: 'Family Court, Chennai',
    status: 'Pending',
    filedDate: '2025-08-10',
    nextHearingDate: '2026-02-25',
    history: [
      { event: 'Case Filed', date: '2025-08-10' },
      { event: 'Mediation Started', date: '2025-09-05' },
      { event: 'Joint Statement Submitted', date: '2025-11-15' }
    ]
  },
  'CC/2026/T6R3Q': {
    caseNumber: 'CC/2026/T6R3Q',
    caseType: 'Tax',
    courtName: 'Income Tax Appellate Tribunal, Delhi',
    status: 'In Progress',
    filedDate: '2025-07-22',
    nextHearingDate: '2026-04-05',
    history: [
      { event: 'Appeal Filed', date: '2025-07-22' },
      { event: 'Notice Issued', date: '2025-08-10' },
      { event: 'Reply Submitted', date: '2025-10-20' },
      { event: 'Hearing Date Fixed', date: '2026-01-15' }
    ]
  },
  'CC/2024/E9S5P': {
    caseNumber: 'CC/2024/E9S5P',
    caseType: 'Environmental',
    courtName: 'National Green Tribunal, Bangalore',
    status: 'Closed',
    filedDate: '2023-05-15',
    nextHearingDate: null,
    history: [
      { event: 'Petition Filed', date: '2023-05-15' },
      { event: 'Site Inspection Done', date: '2023-09-20' },
      { event: 'Expert Report Submitted', date: '2024-03-10' },
      { event: 'Final Order Issued', date: '2024-11-30' }
    ]
  },
  'CC/2025/D7C2B': {
    caseNumber: 'CC/2025/D7C2B',
    caseType: 'Consumer',
    courtName: 'District Consumer Court, Hyderabad',
    status: 'Pending',
    filedDate: '2025-09-05',
    nextHearingDate: '2026-02-18',
    history: [
      { event: 'Complaint Filed', date: '2025-09-05' },
      { event: 'Notice to Opposite Party', date: '2025-09-20' },
      { event: 'Written Statement Received', date: '2025-10-25' }
    ]
  },

  'CC/2025/D7C45B': {
    caseNumber: 'CC/2025/D7C45B',
    caseType: 'Consumer',
    courtName: 'District Consumer Court, Hyderabad',
    status: 'Pending',
    filedDate: '2025-09-05',
    nextHearingDate: '2026-02-18',
    history: [
      { event: 'Complaint Filed', date: '2025-09-05' },
      { event: 'Notice to Opposite Party', date: '2025-09-20' },
      { event: 'Written Statement Received', date: '2025-10-25' }
    ]
  },


  'CC/2026/W8V1U': {
    caseNumber: 'CC/2026/W8V1U',
    caseType: 'Corporate',
    courtName: 'High Court, Calcutta',
    status: 'In Progress',
    filedDate: '2025-12-01',
    nextHearingDate: '2026-03-20',
    history: [
      { event: 'Petition Filed', date: '2025-12-01' },
      { event: 'Admission Granted', date: '2025-12-15' },
      { event: 'Interim Relief Applied', date: '2026-01-10' }
    ]
  }
};

/**
 * Format date to DD MMM YYYY format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Get all cases for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cases
 */
export const getCasesByUser = async (userId) => {
  try {
    // Try API first
    const response = await axios.get(`${API_BASE_URL}/cases/${userId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.log('API not available, using mock data');
    // Return all mock cases as fallback
    return Object.values(MOCK_CASES);
  }
};

/**
 * Track a case by case number
 * @param {string} caseNumber - Case number to track
 * @returns {Promise<Object>} Case details
 */
export const trackCase = async (caseNumber) => {
  try {
    // Check if case exists in mock data first
    if (MOCK_CASES[caseNumber]) {
      return MOCK_CASES[caseNumber];
    }

    // Try API if not in mock data
    const response = await axios.get(`${API_BASE_URL}/cases/track/${caseNumber}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error tracking case:', error);
    throw new Error('Case not found. Try: CC/2026/A7B3C, CC/2025/X9Y2Z, CC/2024/M5N8P, CC/2026/L2K9J, CC/2025/F4G8H, CC/2026/T6R3Q, CC/2024/E9S5P, CC/2025/D7C2B, or CC/2026/W8V1U');
  }
};

