/**
 * VerificationBadge Component
 * Shows "Sovereign Verified" checkmark with proof details
 */

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { SedaProof } from '../hooks/useSedaProof';

export interface VerificationBadgeProps {
  sedaProof: SedaProof | null;
  kairoAudit: {
    isCompliant: boolean;
    violations: any[];
    action: string;
  } | null;
  overshootStatus: {
    clusterId: string | null;
    latency: number | null;
  } | null;
  loading?: boolean;
}

export function VerificationBadge({
  sedaProof,
  kairoAudit,
  overshootStatus,
  loading = false,
}: VerificationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine overall verification status
  const isVerified = 
    sedaProof?.isValid === true &&
    kairoAudit?.isCompliant === true &&
    !loading;

  const hasWarnings = 
    kairoAudit?.action === 'warn' ||
    (sedaProof && !sedaProof.isValid);

  const hasErrors = 
    kairoAudit?.action === 'block' ||
    kairoAudit?.violations?.some((v: any) => v.severity === 'critical');

  return (
    <div className="inline-flex items-center gap-2">
      {/* Main Badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium
          transition-colors duration-200
          ${isVerified 
            ? 'bg-sovereign-verified/10 text-sovereign-verified border border-sovereign-verified/20' 
            : hasErrors
            ? 'bg-sovereign-error/10 text-sovereign-error border border-sovereign-error/20'
            : hasWarnings
            ? 'bg-sovereign-warning/10 text-sovereign-warning border border-sovereign-warning/20'
            : 'bg-gray-100 text-gray-600 border border-gray-200'
          }
          hover:opacity-80
        `}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Verifying...</span>
          </>
        ) : isVerified ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Sovereign Verified</span>
          </>
        ) : hasErrors ? (
          <>
            <XCircle className="w-4 h-4" />
            <span>Verification Failed</span>
          </>
        ) : hasWarnings ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Warning</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Unverified</span>
          </>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="absolute mt-10 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[400px] max-w-[600px]">
          <div className="space-y-4">
            {/* SEDA Proof Section */}
            <div className="border-b pb-3">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${sedaProof?.isValid ? 'text-sovereign-verified' : 'text-gray-400'}`} />
                SEDA Proof
              </h4>
              {sedaProof ? (
                <div className="text-xs space-y-1 text-gray-600">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {sedaProof.isValid ? (
                      <span className="text-sovereign-verified">Verified</span>
                    ) : (
                      <span className="text-sovereign-error">Unverified</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Source:</span> {sedaProof.source}
                  </p>
                  <p>
                    <span className="font-medium">Fact Hash:</span>{' '}
                    <code className="text-xs bg-gray-100 px-1 rounded">
                      {sedaProof.factHash.slice(0, 16)}...
                    </code>
                  </p>
                  {sedaProof.contentId && (
                    <p>
                      <span className="font-medium">Content ID:</span>{' '}
                      <code className="text-xs bg-gray-100 px-1 rounded">
                        {sedaProof.contentId.slice(0, 16)}...
                      </code>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Verified:</span>{' '}
                    {new Date(sedaProof.timestamp).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No SEDA proof available</p>
              )}
            </div>

            {/* Kairo Audit Section */}
            <div className="border-b pb-3">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${kairoAudit?.isCompliant ? 'text-sovereign-verified' : 'text-sovereign-error'}`} />
                Kairo Audit
              </h4>
              {kairoAudit ? (
                <div className="text-xs space-y-1 text-gray-600">
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    {kairoAudit.isCompliant ? (
                      <span className="text-sovereign-verified">No jailbreak attempts detected</span>
                    ) : (
                      <span className="text-sovereign-error">Compliance violations detected</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Action:</span>{' '}
                    <span className="capitalize">{kairoAudit.action}</span>
                  </p>
                  {kairoAudit.violations && kairoAudit.violations.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Violations:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {kairoAudit.violations.map((violation: any, idx: number) => (
                          <li key={idx} className="text-xs">
                            <span className="font-medium">{violation.rule_name}:</span>{' '}
                            {violation.description}
                            {violation.severity && (
                              <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                                violation.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                violation.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {violation.severity}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No Kairo audit available</p>
              )}
            </div>

            {/* Overshoot Status Section */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Overshoot Status
              </h4>
              {overshootStatus ? (
                <div className="text-xs space-y-1 text-gray-600">
                  {overshootStatus.clusterId && (
                    <p>
                      <span className="font-medium">Cluster:</span>{' '}
                      <code className="text-xs bg-gray-100 px-1 rounded">
                        {overshootStatus.clusterId}
                      </code>
                    </p>
                  )}
                  {overshootStatus.latency !== null && (
                    <p>
                      <span className="font-medium">Latency:</span>{' '}
                      <span className="text-blue-600">
                        {overshootStatus.latency.toFixed(0)}ms
                      </span>
                    </p>
                  )}
                  <p className="text-gray-500 italic">
                    Computed on distributed GPU cluster
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No compute status available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
