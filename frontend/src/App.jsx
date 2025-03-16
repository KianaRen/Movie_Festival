import './css/App.css';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import NavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
import BreadCrumbs from './components/BreadCrumbs';
import MovieDetail from './pages/MovieDetail';
import GenreRatings from './pages/GenreRatings';
import AudienceRating from './pages/AudienceRating';
import PredictRatings from './pages/PredictRatings';
import ViewerPersonality from './pages/ViewerPersonality';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
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

            {/* Protect these routes so only logged-in users can access */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mylist"
              element={
                <ProtectedRoute>
                  <MyList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audience-rating"
              element={
                <ProtectedRoute>
                  <AudienceRating />
                </ProtectedRoute>
              }
            />
            <Route
              path="/predict-ratings"
              element={
                <ProtectedRoute>
                  <PredictRatings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/viewer-personality"
              element={
                <ProtectedRoute>
                  <ViewerPersonality />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/genre-ratings"
              element={
                <ProtectedRoute>
                  <GenreRatings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                <ProtectedRoute>
                  <MovieDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
