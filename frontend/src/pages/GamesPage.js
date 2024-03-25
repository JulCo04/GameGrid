import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoggedInNavBar from '../components/LoggedInNavBar';

const GamesPage = () => {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState(""); // Track selected genre
  const [searchTerm, setSearchTerm] = useState(""); // Track search term

  // Add genres
  const genres = ["Shooter", "Adventure", "Role-playing (RPG)", "Puzzle", 
                  "Turn-based strategy (TBS)", "Indie", "Arcade", "Racing", 
                  "Sport", "Strategy", "Fighting"]; // Add more genres as needed

  useEffect(() => {
    fetchGames();
  }, [page, selectedGenre, searchTerm]); // Trigger fetchGames on page or genre change

  const nextPage = () => {
    setPage(page + 1);
  };

  const previousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const app_name = 'g26-big-project-6a388f7e71aa'
  function buildPath(route) {
      console.log("ENVIRONMENT " + process.env.NODE_ENV);
      if (process.env.NODE_ENV === 'production') {
          console.log('https://' + app_name + '.herokuapp.com/' + route);
          return 'https://' + app_name + '.herokuapp.com/' + route;
      }
      else {
          console.log('http://localhost:5000/' + route);
          return 'http://localhost:5000/' + route;
      }
  }

  const fetchGames = async () => {
    try {
        const limit = 15;
        const offset = limit * (page - 1);
        const response = await fetch(buildPath("api/games"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ limit, offset, genre: selectedGenre, search: searchTerm })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch games');
        }

        const gamesData = await response.json();

        if (searchTerm) {
          
          // Sort games by total_rating in descending order
          // filter out games without total rating
          const filteredGames = gamesData.filter(game => game.total_rating !== undefined);
          
          // Sort filtered games by total_rating in descending order
          const sortedGames = filteredGames.sort((a, b) => b.total_rating - a.total_rating);

          // Slice the first 15 games
          const slicedGames = sortedGames.slice(offset, offset + limit);
          setGames(slicedGames);
        }
        else {
          setGames(gamesData);
        }
        
        
        
    } catch (error) {
        console.error('Error fetching games:', error.message);
        setError('Failed to fetch games. Please try again later.');
    }
};

  const parseCoverUrl = (url) => {
    return url.replace('t_thumb', 't_cover_big');
  };

  const clearFilter = () => {
    setSelectedGenre(""); // Reset selected genre
    setPage(1); // Reset page to 1
  };

  return (
    <div className="page-container">
        <LoggedInNavBar />
        <div className="top-games-container">
            <h1 className="page-title">Games</h1>
            <div className="filter-container">
                <input
                  className="games-search-bar"
                  type="text"
                  placeholder="Search Game"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Update search term state
                />
                <select className="genre-dropdown" onChange={(e) => setSelectedGenre(e.target.value)} value={selectedGenre}>
                    <option value="">Select Genre</option>
                    {genres.map((genre, index) => (
                        <option key={index} value={genre}>{genre}</option>
                    ))}
                </select>
                <button className="clear-button" onClick={clearFilter}>Clear Filter</button>
            </div>
            <div className="games-grid">
                {games.map((game) => (
                    <div className="game-card" key={game.id}>
                        <Link to={{
                            pathname: `/games/${game.name}/${game.id}`,    
                        }}>
                            <div
                                className="game-image"
                                style={{
                                    backgroundImage: `url(${game.cover ? parseCoverUrl(game.cover.url) : 'placeholder_url'})`, // Check if cover exists before accessing url
                                }}
                            ></div>
                            <h3>{game.name}</h3>
                        </Link>
                    </div>
                ))}
            </div>
            <div className="pagination">
                <button className="page-button" onClick={previousPage} disabled={page === 1}> Previous </button>
                <button className="page-button" onClick={nextPage}>Next</button>
                <span className="current-page"> Page {page}</span>
            </div>
        </div>
    </div>
);
}

export default GamesPage;
