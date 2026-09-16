import React, { useState, useRef } from 'react';
import axios from 'axios';

const categorizeFile = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return 'Images';
  if (['pdf', 'doc', 'docx', 'txt', 'xlsx', 'csv'].includes(ext)) return 'Documents';
  if (['mp4', 'mkv', 'avi'].includes(ext)) return 'Videos';
  if (['mp3', 'wav'].includes(ext)) return 'Audio';
  if (['zip', 'rar', 'tar'].includes(ext)) return 'Archives';
  return 'Others';
};

function App() {
  const [chat, setChat] = useState([{ sender: 'System', text: 'Waiting for command...' }]);
  const [input, setInput] = useState('');
  const [scannedFiles, setScannedFiles] = useState([]);

  
  const [waitingForFolder, setWaitingForFolder] = useState(false);
  const [uploading, setUploading] = useState(false);

  const folderInputRef = useRef(null);

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
      addMessage('Mady', 'Sure Boss! Boss, please select your folder once using the button below:');
      setWaitingForFolder(true);
    } else if (lowerCmd.includes('need that file') || lowerCmd.includes('where is')) {
      addMessage('Mady', "Boss, I am operating from the cloud now! I've automatically organized all your files and packed them into a ZIP folder. Please check the downloaded file");
      
    } else {
      addMessage('Mady', "Boss: I didn't catch that. Type 'mady help' to organize files.");
    }
  };

  
  const handleFolderSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) {
      addMessage('System', "Error: Boss, I couldn't find any files in this folder!");
      return;
    }

    const preview = selected.map(f => ({
      name: f.name,
      category: categorizeFile(f.name)
    }));
    setScannedFiles(preview);
    addMessage('System', `${selected.length} files has been selected --> Uploading...`);
    uploadFiles(selected);
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    const formData = new FormData();
    fileList.forEach(file => formData.append('files', file));

    try {
      const res = await axios.post(
        'https://mady-a-file-organizer.onrender.com/api/organize-zip/',
        formData,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Mady_Organized_Files.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();

      addMessage('Mady', `Done Boss! ${fileList.length} files have been organized and downloaded as a ZIP`);
    } catch (error) {
      addMessage('Mady', 'System: Error connecting to backend.');
    } finally {
      setUploading(false);
      setWaitingForFolder(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'monospace', maxWidth: '1000px', margin: '0 auto' }}>

      <div style={{ flex: 2 }}>
        <h2>File Organizer Assistant (Web Mode)</h2>
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
            placeholder="Type command... (e.g. mady help)"
            style={{ flex: 1, padding: '12px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
          />
          <button type="submit" style={{ padding: '12px 20px', marginLeft: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Send</button>
        </form>

        {waitingForFolder && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="file"
              webkitdirectory="true"
              directory=""
              multiple
              ref={folderInputRef}
              onChange={handleFolderSelect}
              disabled={uploading}
              style={{ color: 'white' }}
            />
            {uploading && <p style={{ color: '#00ff00' }}>Organizing... please wait</p>}
          </div>
        )}
      </div>

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
