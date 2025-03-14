// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './css/App.css'
import Home from './pages/Home'
import MyList from './pages/MyList'
import Reports from './pages/Reports'
import Analysis from './pages/Analysis'
import NavBar from './components/NavBar'
import {Routes, Route} from 'react-router-dom'
import BreadCrumbs from './components/BreadCrumbs'
import MovieDetail from './pages/MovieDetail'
import GenreRatings from './pages/GenreRatings'
import AudienceRating from './pages/AudienceRating'
import PredictRatings from './pages/PredictRatings'
import ViewerPersonality from './pages/ViewerPersonality'
import UserRatings from './pages/UserRatings'



function App() {
  return (
    <div>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element = {<Home />}/>
          <Route path="/dashboard" element={<Home />} />
          <Route path="/mylist" element = {<MyList />}/>
          <Route path="/analysis" element = {<Analysis />}/>
          <Route path="/audience-rating" element = {<AudienceRating />}/>
          <Route path="/user-ratings" element = {<UserRatings />}/>
          <Route path="/predict-ratings" element = {<PredictRatings />}/>
          <Route path="/viewer-personality" element = {<ViewerPersonality />}/>
          <Route path="/reports" element = {<Reports />}/>
          <Route path="/genre-ratings" element={<GenreRatings />} />
          <Route path="/dashboard/:id" element={<MovieDetail />}></Route>
        </Routes>
      </main>
    </div>
    
  );
}


export default App
