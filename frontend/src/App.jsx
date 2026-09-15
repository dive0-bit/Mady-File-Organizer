import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [chat, setChat] = useState([{ sender: 'System', text: 'Waiting for command...' }]);
  const [input, setInput] = useState('');
  const [scannedFiles, setScannedFiles] = useState([]);
  
  // States to control Mady's flow
  const [waitingForPath, setWaitingForPath] = useState(false);
  const [lastRequestedFile, setLastRequestedFile] = useState(null);

  const addMessage = (sender, text) => {
    setChat(prev => [...prev, { sender, text }]);
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    const command = input.trim();
    const lowerCmd = command.toLowerCase();
    addMessage('You', command);
    setInput('');

    if ((lowerCmd.includes('mady') && lowerCmd.includes('help')) || lowerCmd.includes('organize')) {
      addMessage('Mady', 'Sure Boss! Just give me the path to folder whose files need to be organized :');
      setWaitingForPath(true);
    }
    
    // Flow 2: User gives the path
    else if (waitingForPath) {
      addMessage('System', 'Processing Queue and Hashing files...');
      try {
        const res = await axios.post('http://localhost:8000/api/organize/', { folder_path: command });
        addMessage('Mady', res.data.message);
        setScannedFiles(res.data.files_data);
        setWaitingForPath(false);
      } catch (error) {
        addMessage('Mady', error.response?.data?.error || 'System: Error connecting to backend.');
        setWaitingForPath(false);
      }
    } 
    
    // Flow 3: Request a specific file
    else if (lowerCmd.startsWith('i need that file')) {
      const filename = command.substring(16).trim(); // extract filename
      if (filename) {
        try {
          const res = await axios.get(`http://localhost:8000/api/retrieve/?filename=${filename}`);
          addMessage('Mady', res.data.message);
          if (res.data.found) {
            setLastRequestedFile(filename);
            addMessage('System', 'Type "Done" to send the file back to its original location.');
          }
        } catch (error) {
          addMessage('System', 'Error searching file.');
        }
      } else {
        addMessage('Mady', 'Boss: You forgot to tell me the filename!');
      }
    } 
    
    // Flow 4: User says Done, restore the file
    else if (lowerCmd === 'done' && lastRequestedFile) {
      try {
        const res = await axios.post('http://localhost:8000/api/restore/', { filename: lastRequestedFile });
        addMessage('Mady', res.data.message);
        setLastRequestedFile(null); // Reset
      } catch (error) {
        addMessage('System', 'Error restoring file.');
      }
    } 
    
    else {
      addMessage('Mady', "Boss: I didn't catch that.");
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'monospace', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Left Side: Chatbox */}
      <div style={{ flex: 2 }}>
        <h2>File Organizer Assistant (CLI Mode)</h2>
        <div style={{ height: '500px', overflowY: 'scroll', backgroundColor: '#1e1e1e', color: '#00ff00', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
          {chat.map((msg, idx) => (
            <div key={idx} style={{ margin: '10px 0', color: msg.sender === 'You' ? '#00bfff' : (msg.sender === 'System' ? '#ff4500' : '#00ff00') }}>
              <strong>{msg.sender}: </strong> {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleCommand} style={{ display: 'flex' }}>
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)} 
            placeholder={waitingForPath ? "Paste folder path here..." : "Type command..."}
            style={{ flex: 1, padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '12px 20px', marginLeft: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Send</button>
        </form>
      </div>

      {/* Right Side: Dashboard/Scanned Files Box */}
      <div style={{ flex: 1, backgroundColor: '#2a2a2a', color: 'white', padding: '15px', borderRadius: '8px', height: '500px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ borderBottom: '1px solid #444', paddingBottom: '10px' }}>Scanned Files ({scannedFiles.length})</h3>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {scannedFiles.length === 0 ? (
            <p style={{ color: '#888' }}>No files scanned yet.</p>
          ) : (
            <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
              {scannedFiles.map((file, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <strong>{file.name}</strong> <br/>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>➜ {file.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
    </div>
  );
}

export default App;