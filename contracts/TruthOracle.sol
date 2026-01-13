// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TruthOracle
 * @notice Pulls verified educational content from SEDA network
 * @dev This contract acts as an oracle that verifies educational facts
 *      against trusted sources (Khan Academy, OpenStax, etc.)
 */
contract TruthOracle {
    // Event emitted when a fact is verified
    event FactVerified(
        bytes32 indexed factHash,
        string source,
        uint256 timestamp,
        bool isValid
    );

    // Event emitted when educational content is registered
    event ContentRegistered(
        bytes32 indexed contentId,
        string subject,
        string topic,
        address indexed verifier
    );

    // Struct to store verified educational content
    struct VerifiedContent {
        bytes32 contentId;
        string subject;      // e.g., "Mathematics", "Physics"
        string topic;        // e.g., "Calculus", "Quantum Mechanics"
        string source;       // e.g., "Khan Academy", "OpenStax"
        bytes32 factHash;    // Hash of the educational fact
        uint256 timestamp;
        address verifier;
        bool isValid;
    }

    // Mapping from content ID to verified content
    mapping(bytes32 => VerifiedContent) public verifiedContent;

    // Mapping from fact hash to verification status
    mapping(bytes32 => bool) public factVerifications;

    // List of authorized verifiers (educational institutions, APIs)
    mapping(address => bool) public authorizedVerifiers;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Add an authorized verifier (e.g., Khan Academy API, OpenStax)
     * @param verifier Address of the verifier to authorize
     */
    function addVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = true;
    }

    /**
     * @notice Remove an authorized verifier
     * @param verifier Address of the verifier to remove
     */
    function removeVerifier(address verifier) external onlyOwner {
        authorizedVerifiers[verifier] = false;
    }

    /**
     * @notice Register verified educational content from a trusted source
     * @param contentId Unique identifier for the content
     * @param subject Subject area (e.g., "Mathematics")
     * @param topic Specific topic (e.g., "Calculus")
     * @param source Source of the content (e.g., "Khan Academy")
     * @param factHash Hash of the educational fact/statement
     * @return success Whether the registration was successful
     */
    function registerContent(
        bytes32 contentId,
        string memory subject,
        string memory topic,
        string memory source,
        bytes32 factHash
    ) external onlyVerifier returns (bool) {
        require(verifiedContent[contentId].contentId == bytes32(0), "Content already registered");

        verifiedContent[contentId] = VerifiedContent({
            contentId: contentId,
            subject: subject,
            topic: topic,
            source: source,
            factHash: factHash,
            timestamp: block.timestamp,
            verifier: msg.sender,
            isValid: true
        });

        factVerifications[factHash] = true;

        emit ContentRegistered(contentId, subject, topic, msg.sender);
        emit FactVerified(factHash, source, block.timestamp, true);

        return true;
    }

    /**
     * @notice Verify if a fact matches verified educational content
     * @param factHash Hash of the fact to verify
     * @return isValid Whether the fact is verified
     * @return source Source of the verification
     */
    function verifyFact(bytes32 factHash) external view returns (bool isValid, string memory source) {
        isValid = factVerifications[factHash];
        
        // Find the content that matches this fact hash
        // Note: In production, you'd want a reverse mapping for efficiency
        source = isValid ? "Verified" : "Unverified";
    }

    /**
     * @notice Get verified content by ID
     * @param contentId Content identifier
     * @return content The verified content struct
     */
    function getContent(bytes32 contentId) external view returns (VerifiedContent memory content) {
        content = verifiedContent[contentId];
        require(content.contentId != bytes32(0), "Content not found");
    }

    /**
     * @notice Invalidate content (e.g., if found to be incorrect)
     * @param contentId Content identifier to invalidate
     */
    function invalidateContent(bytes32 contentId) external onlyVerifier {
        VerifiedContent storage content = verifiedContent[contentId];
        require(content.contentId != bytes32(0), "Content not found");
        
        content.isValid = false;
        factVerifications[content.factHash] = false;
        
        emit FactVerified(content.factHash, content.source, block.timestamp, false);
    }
}
