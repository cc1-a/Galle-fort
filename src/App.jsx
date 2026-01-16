import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GalleFortTour from './components/GalleFortTour';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GalleFortTour />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;