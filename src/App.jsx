import { Routes, Route } from 'react-router-dom';
import CreatorHome from './pages/CreatorHome';
import CreatorDashboard from './pages/CreatorDashboard';
import ViewerApp from './pages/ViewerApp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<CreatorHome />} />
      <Route path="/create" element={<CreatorDashboard />} />
      <Route path="/jar/:jarId" element={<ViewerApp />} />
    </Routes>
  );
}

export default App;
