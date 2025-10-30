import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Clock, Calendar, FolderGit2, GitBranch, AlertCircle } from 'lucide-react';
import { verificationAPI } from '../services/api.js';
import { useToast } from '../context/ToastContext.js';

const VerificationRequestModal = ({ onClose, onSuccess }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [status, setStatus] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  useEffect(() => {
    fetchEligibilityAndStatus();
  }, []);

  const fetchEligibilityAndStatus = async () => {
    try {
      setLoading(true);
      const [eligibilityData, statusData] = await Promise.all([
        verificationAPI.checkEligibility(),
        verificationAPI.getVerificationStatus()
      ]);
      setEligibility(eligibilityData);
      setStatus(statusData);
    } catch (err) {
      console.error('Error fetching verification data:', err);
      toast.error(err.message || 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await verificationAPI.requestVerification(requestMessage);
      toast.success('Verification request submitted successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting request:', err);
      toast.error(err.message || 'Failed to submit verification request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8">
          <div className="loading w-8 h-8 mx-auto"></div>
        </div>
      </div>
    );
  }

  // If user already has a pending request
  if (status?.userStatus?.verificationRequestStatus === 'pending') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <Clock className="mr-2 text-yellow-400" size={24} />
              Verification Pending
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-300 mb-4">
              Your verification request is currently pending review by an administrator.
            </p>

            {status.request?.requestMessage && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">Your message:</p>
                <p className="text-white">{status.request.requestMessage}</p>
              </div>
            )}

            <div className="text-sm text-gray-400">
              Submitted: {new Date(status.userStatus.verificationRequestedAt).toLocaleDateString()}
            </div>
          </div>

          <div className="p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user is already verified
  if (status?.userStatus?.isVerified) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center">
              <CheckCircle className="mr-2 text-blue-400" size={24} />
              Already Verified
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-300">
              Your account is already verified! You have access to all verification benefits.
            </p>
          </div>

          <div className="p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const requirements = eligibility?.requirements;
  const canRequest = eligibility?.eligible;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center">
            <CheckCircle className="mr-2 text-blue-400" size={24} />
            Request Account Verification
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-lg">Verification Requirements</h4>
            <p className="text-gray-400 text-sm mb-4">
              To request verification, you must meet all of the following criteria:
            </p>

            <div className="space-y-3">
              <div className={`flex items-start p-3 rounded-lg ${
                requirements?.accountOldEnough ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <Calendar
                  size={20}
                  className={`mr-3 mt-0.5 ${requirements?.accountOldEnough ? 'text-green-400' : 'text-red-400'}`}
                />
                <div className="flex-1">
                  <p className="font-medium">Account Age: At least 7 days old</p>
                  <p className="text-sm text-gray-400">
                    Your account: {eligibility?.accountAge || 0} days old
                  </p>
                </div>
                {requirements?.accountOldEnough ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <X size={20} className="text-red-400" />
                )}
              </div>

              <div className={`flex items-start p-3 rounded-lg ${
                requirements?.hasProject ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <FolderGit2
                  size={20}
                  className={`mr-3 mt-0.5 ${requirements?.hasProject ? 'text-green-400' : 'text-red-400'}`}
                />
                <div className="flex-1">
                  <p className="font-medium">Projects: At least 1 project created</p>
                  <p className="text-sm text-gray-400">
                    You have created: {eligibility?.projectCount || 0} project(s)
                  </p>
                </div>
                {requirements?.hasProject ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <X size={20} className="text-red-400" />
                )}
              </div>

              <div className={`flex items-start p-3 rounded-lg ${
                requirements?.hasCheckOut ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
              }`}>
                <GitBranch
                  size={20}
                  className={`mr-3 mt-0.5 ${requirements?.hasCheckOut ? 'text-green-400' : 'text-red-400'}`}
                />
                <div className="flex-1">
                  <p className="font-medium">Activity: At least 1 project checked out</p>
                  <p className="text-sm text-gray-400">
                    You have checked out: {eligibility?.checkOutCount || 0} project(s)
                  </p>
                </div>
                {requirements?.hasCheckOut ? (
                  <CheckCircle size={20} className="text-green-400" />
                ) : (
                  <X size={20} className="text-red-400" />
                )}
              </div>
            </div>
          </div>

          {canRequest ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Message to Admin (Optional)
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell us why you'd like to be verified..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  rows="4"
                  maxLength="500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {requestMessage.length}/500 characters
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <p className="font-medium mb-1">What happens next?</p>
                    <p>
                      An administrator will review your request. You'll be notified once your
                      request has been approved or requires additional information.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center space-x-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="loading w-4 h-4"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium mb-1">Not Eligible Yet</p>
                  <p>
                    You don't meet all the requirements for verification yet. Complete the
                    requirements above and come back to request verification.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {!canRequest && (
          <div className="p-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationRequestModal;
