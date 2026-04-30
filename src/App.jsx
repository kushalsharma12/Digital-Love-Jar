import { Routes, Route } from 'react-router-dom';
import CreatorHome from './pages/CreatorHome';
import CreatorDashboard from './pages/CreatorDashboard';
import ViewerApp from './pages/ViewerApp';
import Footer from './components/Footer';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<CreatorHome />} />
          <Route path="/create" element={<CreatorDashboard />} />
          <Route path="/jar/:jarId" element={<ViewerApp />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
