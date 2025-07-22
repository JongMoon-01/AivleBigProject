import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="container">
      <div className="tab-buttons">
        <button 
          className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          로그인
        </button>
        <button 
          className={`tab-button ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          회원가입
        </button>
      </div>
      
      {activeTab === 'login' && <Login />}
      {activeTab === 'register' && <Register />}
    </div>
  );
}

export default App;