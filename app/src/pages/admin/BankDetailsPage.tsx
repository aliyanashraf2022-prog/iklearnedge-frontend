import React, { useState, useEffect } from 'react';
import { Save, Edit2, XCircle, CheckCircle, Building2, CreditCard, Hash, FileText, User } from 'lucide-react';
import { settingsAPI } from '@/services/api';

interface BankDetails {
  bankName: string;
  accountNumber: string;
  iban: string;
  accountHolderName: string;
  swiftCode: string;
  branchAddress: string;
  isActive: boolean;
}

const BankDetailsPage: React.FC = () => {
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    accountNumber: '',
    iban: '',
    accountHolderName: '',
    swiftCode: '',
    branchAddress: '',
    isActive: true
  });
  const [originalDetails, setOriginalDetails] = useState<BankDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const res = await settingsAPI.getBankDetails();
      const data = res.data || res;
      if (data) {
        setBankDetails({
          bankName: data.bankName || data.bank_name || '',
          accountNumber: data.accountNumber || data.account_number || '',
          iban: data.iban || '',
          accountHolderName: data.accountHolderName || data.account_holder_name || '',
          swiftCode: data.swiftCode || data.swift_code || '',
          branchAddress: data.branchAddress || data.branch_address || '',
          isActive: data.isActive ?? data.is_active ?? true
        });
        setOriginalDetails({
          bankName: data.bankName || data.bank_name || '',
          accountNumber: data.accountNumber || data.account_number || '',
          iban: data.iban || '',
          accountHolderName: data.accountHolderName || data.account_holder_name || '',
          swiftCode: data.swiftCode || data.swift_code || '',
          branchAddress: data.branchAddress || data.branch_address || '',
          isActive: data.isActive ?? data.is_active ?? true
        });
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
      setMessage({ type: 'error', text: 'Failed to load bank details' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await settingsAPI.updateBankDetails({
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        iban: bankDetails.iban,
        accountHolderName: bankDetails.accountHolderName,
        swiftCode: bankDetails.swiftCode,
        branchAddress: bankDetails.branchAddress
      });
      if (result.success) {
        setOriginalDetails(bankDetails);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Bank details saved successfully!' });
      } else {
        throw new Error(result.message || 'Failed to save');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save bank details' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalDetails) {
      setBankDetails(originalDetails);
    }
    setIsEditing(false);
    setMessage(null);
  };

  const hasChanges = originalDetails && (
    bankDetails.bankName !== originalDetails.bankName ||
    bankDetails.accountNumber !== originalDetails.accountNumber ||
    bankDetails.iban !== originalDetails.iban ||
    bankDetails.accountHolderName !== originalDetails.accountHolderName ||
    bankDetails.swiftCode !== originalDetails.swiftCode ||
    bankDetails.branchAddress !== originalDetails.branchAddress
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#4a4a4a] font-['Poppins']">Bank Transfer Details</h3>
          <p className="text-gray-500 mt-1">Configure the bank details shown to students for payments</p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                disabled={saving}
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
                disabled={saving || !hasChanges}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`flex items-center space-x-2 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>Bank Name</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bankDetails.bankName}
                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                className="form-input"
                placeholder="e.g., Dubai Islamic Bank"
              />
            ) : (
              <p className="form-input bg-gray-50">{bankDetails.bankName || '-'}</p>
            )}
          </div>

          <div>
            <label className="form-label flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>Account Holder Name</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                className="form-input"
                placeholder="e.g., IkLearnEdge"
              />
            ) : (
              <p className="form-input bg-gray-50">{bankDetails.accountHolderName || '-'}</p>
            )}
          </div>

          <div>
            <label className="form-label flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>Account Number</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                className="form-input"
                placeholder="e.g., 1234567890"
              />
            ) : (
              <p className="form-input bg-gray-50">{bankDetails.accountNumber || '-'}</p>
            )}
          </div>

          <div>
            <label className="form-label flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span>IBAN</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bankDetails.iban}
                onChange={(e) => setBankDetails({...bankDetails, iban: e.target.value})}
                className="form-input"
                placeholder="e.g., AE123456789012345678901"
              />
            ) : (
              <p className="form-input bg-gray-50">{bankDetails.iban || '-'}</p>
            )}
          </div>

          <div>
            <label className="form-label flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>SWIFT/BIC Code</span>
            </label>
            {isEditing ? (
              <input
                type="text"
                value={bankDetails.swiftCode}
                onChange={(e) => setBankDetails({...bankDetails, swiftCode: e.target.value})}
                className="form-input"
                placeholder="e.g., UAEBAEAS"
              />
            ) : (
              <p className="form-input bg-gray-50">{bankDetails.swiftCode || '-'}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="form-label flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span>Branch Address</span>
            </label>
            {isEditing ? (
              <textarea
                value={bankDetails.branchAddress}
                onChange={(e) => setBankDetails({...bankDetails, branchAddress: e.target.value})}
                className="form-input min-h-[80px]"
                placeholder="Enter bank branch address"
              />
            ) : (
              <p className="form-input bg-gray-50 min-h-[80px]">{bankDetails.branchAddress || '-'}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Preview</h4>
        <p className="text-sm text-blue-700 mb-3">This is how students will see the bank details:</p>
        <div className="bg-white rounded-lg p-4 space-y-2">
          <p className="text-sm"><span className="font-medium">Bank:</span> {bankDetails.bankName || 'Not set'}</p>
          <p className="text-sm"><span className="font-medium">Account:</span> {bankDetails.accountNumber || 'Not set'}</p>
          <p className="text-sm"><span className="font-medium">IBAN:</span> {bankDetails.iban || 'Not set'}</p>
          <p className="text-sm"><span className="font-medium">Account Holder:</span> {bankDetails.accountHolderName || 'Not set'}</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Changes to bank details will be immediately visible to all students</li>
          <li>• Always verify bank details before saving</li>
          <li>• Keep a record of any changes for your reference</li>
          <li>• Students will see these details when making payments for classes</li>
        </ul>
      </div>
    </div>
  );
};

export default BankDetailsPage;
