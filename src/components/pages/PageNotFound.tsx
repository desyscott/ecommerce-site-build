import React from 'react';
import { Link } from 'react-router-dom';

import errorImg from '../../assets/error/Ilustration.svg';
import backArrow from '../../assets/error/Icon.svg';
import '../../sass/pages/page_not_found.scss';

const PageNotFound: React.FC = () => {
  return (
    <main className="not-found">
      <div className="not-found__container">
        <header className="not-found__header">
          <h1 className="not-found__brand">Audiophile</h1>
        </header>

        <section className="not-found__content">
          <div className="not-found__text">
            <h2>404 - Page Not Found</h2>
            <p>
              Looks like this page doesn’t exist or was removed. Let’s get you
              back on track.
            </p>
            <Link to="/" className="not-found__link">
              <button className="not-found__btn">
                <img src={backArrow} alt="Back arrow" />
                Back to Home
              </button>
            </Link>
          </div>
          <div className="not-found__image">
            <img src={errorImg} alt="Illustration of a 404 error" />
          </div>
        </section>
      </div>
    </main>
  );
};

export default PageNotFound;
