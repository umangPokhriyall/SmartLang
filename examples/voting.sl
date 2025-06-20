contract VotingSystem:
    @safe_math
    state:
        owner: address = msg.sender
        voters: mapping(address => bool)
        votes: mapping(uint256 => uint256)
        totalVotes: uint256 = 0
        votingEnded: bool = false
    
    @only_owner
    function addVoter(voter: address):
        voters[voter] = true
        emit VoterAdded(voter)
    
    @reentrancy_guard
    function vote(proposalId: uint256):
        require(voters[msg.sender] == true, "Not authorized to vote")
        require(votingEnded == false, "Voting has ended")
        votes[proposalId] += 1
        totalVotes += 1
        voters[msg.sender] = false
        emit VoteCast(msg.sender, proposalId)
    
    @only_owner
    function endVoting():
        votingEnded = true
        emit VotingEnded(totalVotes)
    
    function getVotes(proposalId: uint256) -> uint256:
        return votes[proposalId]

    event VoterAdded(voter: address)
    event VoteCast(voter: address, proposalId: uint256)
    event VotingEnded(totalVotes: uint256) 