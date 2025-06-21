import React from 'react';
import { NavLink, useNavigate, useRouteError } from 'react-router-dom';
import clockIcon from '../../assets/error/material-symbols_nest-clock-farsight-analog-outline.svg';
import '../../sass/pages/error.scss';

const Error: React.FC = () => {
  const error = useRouteError() as { message?: string };
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-GB');

  return (
    <main className="error-layout">
      <header className="error-header">
        <button className="btn-home" onClick={() => navigate('/')}>
          ⬅ Home
        </button>
        <nav className="error-nav">
          {['headphones', 'speakers', 'earphones'].map((item) => (
            <NavLink key={item} to={`/${item}`} className="error-link">
              {item}
            </NavLink>
          ))}
        </nav>
      </header>

      <section className="error-body">
        <div className="error-text">
          <h1>We're experiencing a hiccup 🤕</h1>
          <p>
            Something broke on our side. Sit tight or try refreshing.
          </p>
          <button className="btn-alert" onClick={() => alert('Developer has been alerted.')}>
            Notify Dev 💻
          </button>
        
        </div>
        <div className="error-graphic">
         
        </div>
      </section>

      <footer className="error-footer">
        <div className="error-date">
          <img src={clockIcon} alt="Clock" />
          <span>{today}</span>
        </div>
        <div className="error-info">
          <strong>Details:</strong>
          <pre>{error?.message || 'Something unexpected happened.'}</pre>
        </div>
      </footer>
    </main>
  );
};

export default Error;
