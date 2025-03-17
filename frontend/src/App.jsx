import './css/App.css';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import NavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
import MovieDetail from './pages/MovieDetail';
import GenreRatings from './pages/GenreRatings';
import UserRatings from './pages/UserRatings';
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

            {/* Protect these routes so only logged-in users can access */}
            <Route
              path="/dashboard"
              element={
                  <Home />
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
                  <Analysis />
              }
            />
            <Route
              path="/audience-rating"
              element={
                  <AudienceRating />
              }
            />
            <Route
              path="/predict-ratings"
              element={
                  <PredictRatings />
              }
            />
            <Route
              path="/viewer-personality"
              element={
                  <ViewerPersonality />
              }
            />
            <Route
              path="/reports"
              element={
                  <Reports />
              }
            />
            <Route
              path="/genre-ratings"
              element={
                  <GenreRatings />
              }
            />
             <Route
              path="/user-ratings"
              element={
                  <UserRatings />
              }
            />
            <Route
              path="/dashboard/:id"
              element={
                  <MovieDetail />
              }
            />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
