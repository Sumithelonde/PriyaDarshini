/**
 * CaseTracker Component
 * Displays all cases for a user with search functionality
 */

import React, { useState, useEffect } from 'react';
import { getCasesByUser, trackCase, formatDate } from '@/services/caseService';
import CaseDetails from './CaseDetails.tsx';
import './CaseTracker.css';

const CaseTracker = () => {
  // State management
  const userId = 'demo-user';
  
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaseNumber, setSelectedCaseNumber] = useState(null);

  // Fetch all cases when component mounts
  useEffect(() => {
    // Don't load cases on mount - only show when user searches
    // Cases will only appear after user enters a case number and clicks Track
  }, [userId]);

  /**
   * Load all cases for the current user
   */
  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCasesByUser(userId);
      
      // If no data from API, use mock data for demonstration
      if (!data || data.length === 0) {
        const mockData = [
          {
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
          {
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
          {
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
          }
        ];
        setCases(mockData);
      } else {
        setCases(data);
      }
    } catch (err) {
      // On error, show mock data for demonstration
      const mockData = [
        {
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
        {
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
        {
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
        }
      ];
      setCases(mockData);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Track case by case number (e-Courts style search)
   */
  const handleTrackCase = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a case number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const caseData = await trackCase(searchQuery.trim());
      
      // Add to list if not already present
      const exists = cases.find(c => c.caseNumber === caseData.caseNumber);
      if (!exists) {
        setCases([caseData, ...cases]);
      }
      
      // Open the case details
      setSelectedCaseNumber(caseData.caseNumber);
      setSearchQuery('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get status badge color based on case status
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b'; // Orange
      case 'In Progress':
        return '#3b82f6'; // Blue
      case 'Closed':
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  };

  // Show case details if a case is selected
  if (selectedCaseNumber) {
    return (
      <CaseDetails
        caseNumber={selectedCaseNumber}
        onBack={() => setSelectedCaseNumber(null)}
      />
    );
  }

  return (
    <div className="case-tracker">
      <h1 className="tracker-title">Case Tracker</h1>
      
      {/* Track Case by Number Section */}
      <div className="track-section">
        <h2>Track Case Status</h2>
        <p className="subtitle">Enter case number to track (e.g., CC/2026/A7B3C)</p>
        
        <form onSubmit={handleTrackCase} className="track-form">
          <input
            type="text"
            placeholder="Enter Case Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="track-input"
          />
          <button type="submit" className="track-button" disabled={loading}>
            {loading ? 'Searching...' : 'Track Case'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Cases List */}
      <div className="cases-section">
        <h2>Tracked Cases ({cases.length})</h2>
        
        {loading && cases.length === 0 ? (
          <div className="loading">Loading case...</div>
        ) : cases.length === 0 ? (
          <div className="empty-state">
            <p>📋 No cases tracked yet.</p>
            <p className="empty-subtitle">Enter a case number above and click "Track Case" to get started.</p>
          </div>
        ) : (
          <div className="cases-grid">
            {cases.map((caseItem) => (
              <div
                key={caseItem.caseNumber}
                className="case-card"
                onClick={() => setSelectedCaseNumber(caseItem.caseNumber)}
              >
                {/* Case Header */}
                <div className="case-header">
                  <h3 className="case-number">{caseItem.caseNumber}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(caseItem.status) }}
                  >
                    {caseItem.status}
                  </span>
                </div>

                {/* Case Info */}
                <div className="case-info">
                  <div className="info-row">
                    <span className="label">Case Type:</span>
                    <span className="value">{caseItem.caseType}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Court:</span>
                    <span className="value">{caseItem.courtName}</span>
                  </div>
                  
                  <div className="info-row">
                    <span className="label">Filed:</span>
                    <span className="value">{formatDate(caseItem.filedDate)}</span>
                  </div>
                  
                  {caseItem.nextHearingDate && (
                    <div className="info-row highlight">
                      <span className="label">Next Hearing:</span>
                      <span className="value">{formatDate(caseItem.nextHearingDate)}</span>
                    </div>
                  )}
                </div>

                {/* View Details Link */}
                <div className="case-footer">
                  <button className="view-details-btn">
                    View Full Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseTracker;
