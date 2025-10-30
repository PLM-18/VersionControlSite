import React from 'react';
import { CheckCircle } from 'lucide-react';

const VerifiedBadge = ({ size = 16, className = '' }) => {
  return (
    <CheckCircle
      size={size}
      className={`text-blue-400 fill-blue-400 ${className}`}
      title="Verified Account"
    />
  );
};

export default VerifiedBadge;
