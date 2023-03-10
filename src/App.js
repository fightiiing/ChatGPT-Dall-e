import './App.css';
import { useState } from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";

const api_key='';

function App() {
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hi, I'm ChatGPT.",
      sender: "ChatGPT"
    }
  ]);

  const handleSend = async (message) => {
    const newMessage = {
          message: message,
          sender: "user",
          direction: "outgoing"
    }
  

  const newMessages = [...messages, newMessage];

  //update message state
  setMessages(newMessages);
  // set a typing indicator for ChatGPT
  setTyping(true);
    await processMessageToChatGPT(newMessages);
}

async function processMessageToChatGPT(chatMessages) {
  let apiMessages = chatMessages.map((messageObject)=> {
    let role = "";
    if (messageObject.sender === "ChatGPT") {
      role="assistant"
    } else {
      role="user"
    }
    return {role: role, content: messageObject.message}
  });

const systemMessage = {
  role: "system",
  content: "Explain all concepts like I am 10 years old."
}

  const apiRequestBody = {
    "model": "gpt-3.5-turbo",
    "messages": [systemMessage, ...apiMessages]
  }

  await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", 
    headers: {
      "Authorization": "Bearer " + api_key,
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify(apiRequestBody)
  }).then((data)=>{
    return data.json();
  }).then((data) => {
   setMessages(
    [...chatMessages, {
      message: data.choices[0].message.content,
      sender: "ChatGPT"
    }]
   );
   setTyping(false);
  })
}
  return (
    <div className="App">
      <div className='chat'>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing"/> : null}
            >
              {messages.map((message,i)=>{
                return <Message key={i} model={message} />
              })}
              </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend} attachButton={false}></MessageInput>
          </ChatContainer>
        </MainContainer>
        </div>
    </div>
  );
}
export default App;
