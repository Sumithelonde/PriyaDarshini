/**
 * CaseDetails Component
 * Displays full case information including timeline of events
 */

import React, { useState, useEffect } from 'react';
import { trackCase, formatDate } from '@/services/caseService';
import './CaseDetails.css';

const CaseDetails = ({ caseNumber, onBack }) => {
  // State management
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Fetch case details when component mounts
  useEffect(() => {
    loadCaseDetails();
  }, [caseNumber]);

  /**
   * Load case details by case number
   */
  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trackCase(caseNumber);
      setCaseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return '#f59e0b';
      case 'In Progress':
        return '#3b82f6';
      case 'Closed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  /**
   * Send WhatsApp reminder
   */
  const sendWhatsAppReminder = () => {
    if (!phoneNumber.trim()) {
      alert('Please enter your WhatsApp number');
      return;
    }

    // Validate phone number (should be 10 digits)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      alert('Please enter a valid phone number');
      return;
    }

    const message = `🔔 *HEARING REMINDER*

Case Number: *${caseData.caseNumber}*
Court: ${caseData.courtName}
Case Type: ${caseData.caseType}
Status: ${caseData.status}
Hearing Date: *${formatDate(caseData.nextHearingDate)}*

Please be prepared for your hearing!`;

    const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    setMessageSent(true);

    // Reset message status after 3 seconds
    setTimeout(() => setMessageSent(false), 3000);
  };

  // Loading state
  if (loading) {
    return (
      <div className="case-details">
        <button className="back-button" onClick={onBack}>
          ← Back to Cases
        </button>
        <div className="loading-state">Loading case details...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="case-details">
        <button className="back-button" onClick={onBack}>
          ← Back to Cases
        </button>
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  // No data state
  if (!caseData) {
    return (
      <div className="case-details">
        <button className="back-button" onClick={onBack}>
          ← Back to Cases
        </button>
        <div className="empty-box">Case not found</div>
      </div>
    );
  }

  return (
    <div className="case-details">
      {/* Back Button */}
      <button className="back-button" onClick={onBack}>
        ← Back to Cases
      </button>

      <h1 className="details-title">Case Details</h1>

      {/* Case Information Card */}
      <div className="details-card">
        <div className="details-header">
          <h2 className="case-number-large">{caseData.caseNumber}</h2>
          <span
            className="status-badge-large"
            style={{ backgroundColor: getStatusColor(caseData.status) }}
          >
            {caseData.status}
          </span>
        </div>

        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Case Type</span>
            <span className="detail-value">{caseData.caseType}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Court Name</span>
            <span className="detail-value">{caseData.courtName}</span>
          </div>

          <div className="detail-item">
            <span className="detail-label">Filed Date</span>
            <span className="detail-value">{formatDate(caseData.filedDate)}</span>
          </div>

          {caseData.nextHearingDate && (
            <div className="detail-item highlighted">
              <span className="detail-label">Next Hearing Date</span>
              <span className="detail-value">{formatDate(caseData.nextHearingDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Reminder Section */}
      {caseData.nextHearingDate && (
        <div className="whatsapp-card">
          <h3 className="whatsapp-title">📱 Get WhatsApp Reminder</h3>
          <p className="whatsapp-subtitle">Send hearing reminder to your WhatsApp</p>
          
          <div className="whatsapp-form">
            <input
              type="tel"
              placeholder="Enter WhatsApp number (e.g., 919876543210)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="phone-input"
              maxLength="15"
            />
            <button
              onClick={sendWhatsAppReminder}
              className="whatsapp-btn"
              disabled={messageSent}
            >
              {messageSent ? '✓ Opening WhatsApp...' : '📤 Send Reminder'}
            </button>
          </div>
          
          {messageSent && (
            <p className="success-message">
              WhatsApp is opening... Check your phone and send the message!
            </p>
          )}
        </div>
      )}

      {/* Case History Timeline */}
      <div className="timeline-card">
        <h2 className="timeline-title">Case History</h2>
        
        {!caseData.history || caseData.history.length === 0 ? (
          <p className="empty-timeline">No case history available</p>
        ) : (
          <div className="timeline">
            {caseData.history.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  {index < caseData.history.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                </div>
                
                <div className="timeline-content">
                  <h3 className="event-title">{event.event}</h3>
                  <p className="event-date">{formatDate(event.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDetails;
