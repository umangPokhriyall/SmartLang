// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {

    // State variables
    address owner;
    mapping(address voters = > bool);
    mapping(uint256 votes = > uint256);
    uint256 totalVotes = 0;
    bool votingEnded = false;
    bool _reentrancyLock_vote = false;

    // Events
    event VoterAdded(address voter);
    event VoteCast(address voter, uint256 proposalId);
    event VotingEnded(uint256 totalVotes);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }
    modifier nonReentrant_vote() {
        require(_reentrancyLock_vote == false, "ReentrancyGuard: reentrant call");
        _reentrancyLock_vote = true;
        _;
        _reentrancyLock_vote = false;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Functions
    function addVoter(address voter) public onlyOwner {
        voters[voter] = true;
        emit VoterAdded(voter);
    }

    function vote(uint256 proposalId) public nonReentrant_vote {
        require(voters[msg.sender] == true, "Not authorized to vote");
        require(votingEnded == false, "Voting has ended");
        votes[proposalId] += 1;
        totalVotes += 1;
        voters[msg.sender] = false;
        emit VoteCast(msg.sender, proposalId);
    }

    function endVoting() public onlyOwner {
        votingEnded = true;
        emit VotingEnded(totalVotes);
    }

    function getVotes(uint256 proposalId) public returns (uint256) {
        return votes[proposalId];
    }

}