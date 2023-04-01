import './App.css';
import { useState} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from "@chatscope/chat-ui-kit-react";
import { Configuration, OpenAIApi } from 'openai';


function App() {
  //states for Dall E
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState("")

const api_key=process.env.REACT_APP_APIKEY;

const configuration = new Configuration({
  apiKey: api_key
})

const openai = new OpenAIApi(configuration);

const generateImage = async () => {
  const res = await openai.createImage({
    prompt: prompt,
    n:1,
    size: "512x512"
  })
setResult(res.data.data[0].url)
}

  // ***ChatGPT below***
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "I'm ChatGPT, ask me anything.",
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
  content: "Explain all concepts as if explaining to a ten-year old."
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
  <div className='ai-container'>
      <div className="chat">
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
            <MessageInput id="messageInput" placeholder='Type message here' onSend={handleSend} autoFocus={true} sendButton={false} attachButton={false}></MessageInput>
          </ChatContainer>
        </MainContainer>
        </div>
          <div className="dall"> 
            <h2>Dall-E Image Generator</h2>
              <textarea placeholder='Enter image terms'
              onChange={(e) => setPrompt(e.target.value)}
              /><br />
              <button onClick={generateImage}>Generate an Image</button>
                <div>
                  <hr />
                  {result.length > 0 ? (
                    <img src={result} alt={result} />
                  ) : (
                    <p>Typically takes about 5 seconds to return an image <br />
                      A 512 x 512 pixel image will appear here</p>
                  )}
                </div>
          </div>
        </div>
  );
}
export default App;