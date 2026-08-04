
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error: error }; }
  componentDidCatch(error, info) { console.error(error, info); }
  render() { 
    if (this.state.hasError) return <div style={{color:'red',padding:'20px'}}><h1>Crash!</h1><pre>{this.state.error.toString()}</pre><pre>{this.state.error.stack}</pre></div>; 
    return this.props.children; 
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>,
);

