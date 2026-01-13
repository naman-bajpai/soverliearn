// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TruthOracle.sol";

/**
 * @title TutorRegistry
 * @notice Maps student IDs to their tutoring session hashes
 * @dev Maintains an immutable record of all tutoring sessions for audit purposes
 */
contract TutorRegistry {
    // Event emitted when a session is registered
    event SessionRegistered(
        bytes32 indexed sessionId,
        string indexed studentId,
        bytes32 sessionHash,
        uint256 timestamp,
        address indexed tutorContract
    );

    // Event emitted when a session is verified
    event SessionVerified(
        bytes32 indexed sessionId,
        bool isValid,
        bytes32[] factHashes
    );

    // Struct to store tutoring session metadata
    struct TutoringSession {
        bytes32 sessionId;
        string studentId;
        bytes32 sessionHash;      // Hash of the entire session transcript
        bytes32[] factHashes;     // Hashes of facts used in this session
        uint256 timestamp;
        address tutorContract;    // Address of the tutoring contract
        bool isVerified;
    }

    // Mapping from session ID to session data
    mapping(bytes32 => TutoringSession) public sessions;

    // Mapping from student ID to array of session IDs
    mapping(string => bytes32[]) public studentSessions;

    // Reference to TruthOracle for fact verification
    TruthOracle public truthOracle;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _truthOracle) {
        owner = msg.sender;
        truthOracle = TruthOracle(_truthOracle);
    }

    /**
     * @notice Register a new tutoring session
     * @param sessionId Unique identifier for the session
     * @param studentId Student identifier
     * @param sessionHash Hash of the session transcript
     * @param factHashes Array of fact hashes used in this session
     * @return success Whether registration was successful
     */
    function registerSession(
        bytes32 sessionId,
        string memory studentId,
        bytes32 sessionHash,
        bytes32[] memory factHashes
    ) external returns (bool) {
        require(sessions[sessionId].sessionId == bytes32(0), "Session already exists");

        sessions[sessionId] = TutoringSession({
            sessionId: sessionId,
            studentId: studentId,
            sessionHash: sessionHash,
            factHashes: factHashes,
            timestamp: block.timestamp,
            tutorContract: msg.sender,
            isVerified: false
        });

        studentSessions[studentId].push(sessionId);

        emit SessionRegistered(sessionId, studentId, sessionHash, block.timestamp, msg.sender);

        // Auto-verify facts used in this session
        verifySessionFacts(sessionId, factHashes);

        return true;
    }

    /**
     * @notice Verify all facts used in a session against TruthOracle
     * @param sessionId Session identifier
     * @param factHashes Array of fact hashes to verify
     */
    function verifySessionFacts(bytes32 sessionId, bytes32[] memory factHashes) internal {
        bool allValid = true;
        
        for (uint256 i = 0; i < factHashes.length; i++) {
            (bool isValid, ) = truthOracle.verifyFact(factHashes[i]);
            if (!isValid) {
                allValid = false;
                break;
            }
        }

        sessions[sessionId].isVerified = allValid;
        emit SessionVerified(sessionId, allValid, factHashes);
    }

    /**
     * @notice Get session data by ID
     * @param sessionId Session identifier
     * @return session The session struct
     */
    function getSession(bytes32 sessionId) external view returns (TutoringSession memory session) {
        session = sessions[sessionId];
        require(session.sessionId != bytes32(0), "Session not found");
    }

    /**
     * @notice Get all sessions for a student
     * @param studentId Student identifier
     * @return sessionIds Array of session IDs for this student
     */
    function getStudentSessions(string memory studentId) external view returns (bytes32[] memory) {
        return studentSessions[studentId];
    }

    /**
     * @notice Get verification status of a session
     * @param sessionId Session identifier
     * @return isVerified Whether all facts in the session are verified
     * @return factHashes Array of fact hashes used in the session
     */
    function getSessionVerification(bytes32 sessionId) 
        external 
        view 
        returns (bool isVerified, bytes32[] memory factHashes) 
    {
        TutoringSession memory session = sessions[sessionId];
        require(session.sessionId != bytes32(0), "Session not found");
        
        isVerified = session.isVerified;
        factHashes = session.factHashes;
    }

    /**
     * @notice Update TruthOracle reference
     * @param _truthOracle New TruthOracle contract address
     */
    function setTruthOracle(address _truthOracle) external onlyOwner {
        truthOracle = TruthOracle(_truthOracle);
    }
}
