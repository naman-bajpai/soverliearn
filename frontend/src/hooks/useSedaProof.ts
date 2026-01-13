/**
 * useSedaProof Hook
 * Fetches and verifies SEDA proofs for educational content
 */

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

export interface SedaProof {
  factHash: string;
  isValid: boolean;
  source: string;
  contentId: string;
  timestamp: number;
  transactionHash?: string;
}

export interface SedaProofResult {
  proof: SedaProof | null;
  loading: boolean;
  error: string | null;
  verifyFact: (factHash: string) => Promise<void>;
  getContentProof: (contentId: string) => Promise<void>;
}

export function useSedaProof(): SedaProofResult {
  const [proof, setProof] = useState<SedaProof | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyFact = useCallback(async (factHash: string) => {
    setLoading(true);
    setError(null);

    try {
      // In production, this would connect to the SEDA network
      const rpcUrl = process.env.NEXT_PUBLIC_SEDA_RPC_URL || 'https://rpc.seda.network';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Get TruthOracle contract address from env
      const truthOracleAddress = process.env.NEXT_PUBLIC_TRUTH_ORACLE_ADDRESS;
      
      if (!truthOracleAddress) {
        throw new Error('TruthOracle address not configured');
      }

      // ABI for verifyFact function
      const abi = [
        'function verifyFact(bytes32 factHash) external view returns (bool isValid, string memory source)'
      ];

      const contract = new ethers.Contract(truthOracleAddress, abi, provider);
      
      // Call verifyFact
      const [isValid, source] = await contract.verifyFact(factHash);
      
      setProof({
        factHash,
        isValid,
        source,
        contentId: '', // Would need additional call to get contentId
        timestamp: Date.now(),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to verify fact');
      setProof(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getContentProof = useCallback(async (contentId: string) => {
    setLoading(true);
    setError(null);

    try {
      const rpcUrl = process.env.NEXT_PUBLIC_SEDA_RPC_URL || 'https://rpc.seda.network';
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      const truthOracleAddress = process.env.NEXT_PUBLIC_TRUTH_ORACLE_ADDRESS;
      
      if (!truthOracleAddress) {
        throw new Error('TruthOracle address not configured');
      }

      const abi = [
        'function getContent(bytes32 contentId) external view returns (tuple(bytes32 contentId, string subject, string topic, string source, bytes32 factHash, uint256 timestamp, address verifier, bool isValid))'
      ];

      const contract = new ethers.Contract(truthOracleAddress, abi, provider);
      
      const content = await contract.getContent(contentId);
      
      setProof({
        factHash: content.factHash,
        isValid: content.isValid,
        source: content.source,
        contentId: content.contentId,
        timestamp: Number(content.timestamp) * 1000, // Convert to milliseconds
      });
    } catch (err: any) {
      setError(err.message || 'Failed to get content proof');
      setProof(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    proof,
    loading,
    error,
    verifyFact,
    getContentProof,
  };
}
