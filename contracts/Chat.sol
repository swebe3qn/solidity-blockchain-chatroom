pragma solidity ^0.8.7;

contract Chat {
    uint public messageCount;
    
    event newMessage(address fromAddress, string message, uint timestamp);
    event login(address fromAddress);
    
    struct Message {
        string message;
        address fromAddress;
        uint timestamp;
    }
    
    mapping(uint => Message) public messages;
    
    function addMessage(string memory _message) public {
        messages[messageCount].message = _message;
        messages[messageCount].fromAddress = msg.sender;
        messages[messageCount].timestamp = block.timestamp;
        
        emit newMessage(msg.sender, _message, block.timestamp);
        
        messageCount++;
    }
    
    function handleLogin() public {
        emit login(msg.sender);
    }
}