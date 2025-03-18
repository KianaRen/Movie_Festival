import './css/App.css';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import NavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
import MovieDetail from './pages/MovieDetail';
import GenreRatings from './pages/GenreRatings';
import AudienceRating from './pages/AudienceRating';
import PredictRatings from './pages/PredictRatings';
import ViewerPersonality from './pages/ViewerPersonality';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <div>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 🚀 Only "My List" requires authentication */}
            <Route
              path="/mylist"
              element={
                <ProtectedRoute>
                  <MyList />
                </ProtectedRoute>
              }
            />

            {/* All other pages are open to everyone */}
            <Route path="/dashboard" element={<Home />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/audience-rating" element={<AudienceRating />} />
            <Route path="/predict-ratings" element={<PredictRatings />} />
            <Route path="/viewer-personality" element={<ViewerPersonality />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/genre-ratings" element={<GenreRatings />} />
            <Route path="/dashboard/:id" element={<MovieDetail />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
