'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

interface InlineCitationProps {
  citationNumber: number;
  source: string;
  page?: number;
  content: string;
  relevanceScore?: number;
}

export default function InlineCitation({
  citationNumber,
  source,
  page,
  content,
  relevanceScore
}: InlineCitationProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span className="relative inline-block">
      <sup
        className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium px-0.5 transition-colors"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        [{citationNumber}]
      </sup>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4">
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-gray-800"></div>
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-100 text-sm truncate">
                    {source}
                  </div>
                  {page && (
                    <div className="text-xs text-gray-400">
                      Page {page}
                    </div>
                  )}
                </div>
                {relevanceScore && (
                  <div className="text-xs font-medium text-blue-400">
                    {(relevanceScore * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-300 leading-relaxed border-t border-gray-700 pt-2">
                {content}
              </div>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
