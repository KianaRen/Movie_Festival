import { Link } from 'react-router-dom'
import '../css/MovieCard.css'

function MovieCard({movie}){

    function onListBtnClick(){
        alert("clicked")
    }

    return <div className="movie-card">
        <Link to={`/dashboard/${movie.id}`} className="movie-link">
        <div className="movie-poster">
            <img src = {movie.posterURL} alt = {movie.title}/>
            <div className="movie-overlay">
                <button className="list-btn" onClick={onListBtnClick}>ADD TO LIST</button>
            </div>
        </div>
        <div className="movie-info">
            <h3>{movie.title}</h3>
            <p>{movie.releaseYear}</p>
            <p>{movie.criticScore}</p>
        </div>
        </Link>
    </div>

}

export default MovieCard