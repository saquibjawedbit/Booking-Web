'use client';
import { AlertCircle, CheckCircle, FileText, Upload } from 'lucide-react';
import { Label } from '../../../components/ui/label';

export const DocumentUpload = ({
  certificate,
  governmentId,
  onCertificateChange,
  onGovernmentIdChange,
}) => {
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'certificate') {
        onCertificateChange(file);
      } else if (type === 'governmentId') {
        onGovernmentIdChange(file);
      }
    }
  };

  const DocumentItem = ({ label, description, file, onChange, type }) => {
    return (
      <div className="border rounded-lg p-3 sm:p-4 lg:p-5 bg-white">
        <div className="flex items-start gap-2 sm:gap-3">
          <div
            className={`p-1.5 sm:p-2 rounded-full shrink-0 ${file ? 'bg-green-100' : 'bg-gray-100'}`}
          >
            {file ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            ) : (
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Label className="font-medium text-sm sm:text-base">{label}</Label>
            <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 leading-relaxed">
              {description}
            </p>

            {file ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <div className="bg-gray-100 rounded px-2 sm:px-3 py-1 sm:py-1.5 flex-1 truncate text-xs sm:text-sm">
                  {file?.name}
                </div>
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium self-start sm:self-auto"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-md transition-colors inline-flex items-center gap-1 sm:gap-2">
                <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Upload {label}</span>
                <span className="sm:hidden">Upload</span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, type)}
                />
              </label>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <div>
        <Label className="text-base sm:text-lg font-medium">
          Verification Documents
        </Label>
        <p className="text-sm sm:text-base text-gray-500 mb-3 leading-relaxed">
          Please upload the required documents for verification
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:gap-5">
        <DocumentItem
          label="Certification"
          description="Upload your diving or relevant adventure certification (PDF, JPG, PNG)"
          file={certificate}
          onChange={onCertificateChange}
          type="certificate"
        />

        <DocumentItem
          label="Government ID"
          description="Upload a valid government-issued ID for verification (PDF, JPG, PNG)"
          file={governmentId}
          onChange={onGovernmentIdChange}
          type="governmentId"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-sm sm:text-base text-blue-800 flex items-start gap-2 sm:gap-3">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Your documents will be securely stored and only used for verification
          purposes. They will not be shared with third parties.
        </p>
      </div>
    </div>
  );
};
