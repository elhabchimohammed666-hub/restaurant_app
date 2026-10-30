import { useMemo, useState } from 'react';
import {
  ArrowDown, ArrowRight, Check, ChevronDown, Clock3, Leaf,
  MapPin, Minus, Plus, Search, ShoppingBag, Star, X,
} from 'lucide-react';
import { categories, dishes, imageUrl } from './data.js';

const money = (value) => `${value.toFixed(2).replace('.', ',')} €`;

function App() {
  const [category, setCategory] = useState('Tout');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const filteredDishes = useMemo(() => dishes.filter((dish) => {
    const categoryMatch = category === 'Tout'
      || (category === 'Nos favoris' ? dish.favorite : dish.category === category);
    const queryMatch = `${dish.name} ${dish.description} ${dish.category}`
      .toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr').trim());
    return categoryMatch && queryMatch;
  }), [category, query]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  function addToCart(dish) {
    setCart((current) => {
      const existing = current.find((item) => item.id === dish.id);
      return existing
        ? current.map((item) => item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...dish, quantity: 1 }];
    });
    setNotice(`${dish.name} ajouté au panier`);
    window.setTimeout(() => setNotice(''), 2400);
  }

  function updateQuantity(id, amount) {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0));
  }

  async function submitReservation(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = form.get('date');
    const time = form.get('time');
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          slotAt: new Date(`${date}T${time}:00`).toISOString(),
          partySize: Number(form.get('guests')),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Impossible d’envoyer la demande.');
      setReservationOpen(false);
      setNotice('Votre demande a bien été envoyée. Nous vous confirmerons le créneau par e-mail.');
      window.setTimeout(() => setNotice(''), 3800);
    } catch (error) {
      setNotice(error.message || 'Le service de réservation est momentanément indisponible.');
      window.setTimeout(() => setNotice(''), 4000);
    }
  }

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="announcement">
        <Leaf size={14} strokeWidth={1.8} />
        <span>Une cuisine de saison, généreuse et ensoleillée</span>
        <span className="announcement-dot">·</span>
        <span>Ouvert aujourd’hui jusqu’à 22h</span>
      </div>

      <header className="site-header">
        <a href="#accueil" className="brand" aria-label="Maison Soleil, accueil">
          <span className="brand-mark">m.</span>
          <span className="brand-name">maison soleil<span className="brand-period">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          <a className="nav-link active" href="#carte">La carte</a>
          <a className="nav-link" href="#histoire">Notre histoire</a>
          <button className="nav-link nav-button" onClick={() => setReservationOpen(true)}>Réserver une table</button>
        </nav>
        <button className="cart-button" onClick={() => setCartOpen(true)} aria-label={`Ouvrir le panier, ${cartCount} article(s)`}>
          <ShoppingBag size={18} strokeWidth={1.7} />
          <span className="cart-label">Mon panier</span>
          <span className="cart-count">{cartCount}</span>
        </button>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" />LA TABLE QUI SENT BON L’ÉTÉ</div>
            <h1>Le goût des<br />beaux <em>jours.</em></h1>
            <p className="hero-description">Des produits frais, des assiettes qui font sourire et ce petit goût de vacances qu’on aime tant.</p>
            <div className="hero-actions">
              <a className="button button-dark" href="#carte">Découvrir la carte <ArrowRight size={16} /></a>
              <button className="button button-text" onClick={() => setReservationOpen(true)}>Réserver une table <ArrowDown size={15} /></button>
            </div>
            <div className="hero-meta">
              <div className="rating"><span className="rating-stars">★★★★★</span><strong>4,9/5</strong><span>sur 280 avis</span></div>
              <span className="meta-divider" />
              <div className="location"><MapPin size={15} /><span>Le Marais, Paris</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <img className="hero-image" src={imageUrl('photo-1547592180-85f173990554', 1200)} alt="Assiette ensoleillée préparée avec des produits frais" />
            <div className="hero-image-overlay" />
            <div className="hero-sticker"><span>FAIT AVEC</span><span className="sticker-heart">♥</span><span>AMOUR</span></div>
            <div className="hero-caption"><span className="caption-dot" /> DES PRODUITS FRAIS, TOUS LES JOURS</div>
          </div>
          <div className="hero-side-note">BON · FRAIS · LOCAL</div>
        </section>

        <section className="perks" aria-label="Nos engagements">
          <div className="perk"><span className="perk-icon"><Leaf size={19} /></span><div><strong>De saison & local</strong><span>À moins de 100 km, toujours.</span></div></div>
          <div className="perk"><span className="perk-icon perk-icon-peach"><Star size={18} /></span><div><strong>Fait avec amour</strong><span>Du vrai, du bon, du maison.</span></div></div>
          <div className="perk"><span className="perk-icon perk-icon-yellow"><Clock3 size={18} /></span><div><strong>Prêt en 20–30 min</strong><span>À emporter ou livré chez vous.</span></div></div>
          <a className="perks-link" href="#carte">En savoir plus <ArrowRight size={15} /></a>
        </section>

        <section className="menu-section" id="carte">
          <div className="section-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" />NOTRE CARTE</div>
              <h2>Un peu de soleil<br className="mobile-break" /> dans votre assiette<span className="heading-period">.</span></h2>
            </div>
            <p>Des produits de saison, travaillés avec soin.<br />Et surtout, beaucoup de gourmandise.</p>
          </div>

          <div className="menu-controls">
            <div className="category-list" role="tablist" aria-label="Filtrer par catégorie">
              {categories.map((item) => (
                <button key={item} className={`category-chip ${category === item ? 'selected' : ''}`} onClick={() => setCategory(item)} role="tab" aria-selected={category === item}>
                  {item === 'Nos favoris' && <span className="favorite-spark">✳</span>}{item}
                </button>
              ))}
            </div>
            <label className="search-field">
              <Search size={16} />
              <input aria-label="Rechercher un plat" placeholder="Une envie en tête ?" value={query} onChange={(event) => setQuery(event.target.value)} />
              <span className="search-shortcut">⌘ K</span>
            </label>
          </div>

          {filteredDishes.length ? (
            <div className="dish-grid">
              {filteredDishes.map((dish) => (
                <article className="dish-card" key={dish.id}>
                  <div className="dish-image-wrap">
                    <img src={imageUrl(dish.image)} alt={dish.name} loading="lazy" />
                    <span className="dish-tag">{dish.tag}</span>
                    <button className="quick-add" onClick={() => addToCart(dish)} aria-label={`Ajouter ${dish.name} au panier`}><Plus size={19} /></button>
                  </div>
                  <div className="dish-info">
                    <div className="dish-title-row"><h3>{dish.name}</h3><span className="dish-price">{money(dish.price)}</span></div>
                    <p>{dish.description}</p>
                    <div className="dish-bottom"><span className="dish-rating"><Star size={13} fill="currentColor" /> {dish.rating}</span><span className="dish-category">{dish.category}</span></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-results"><span className="empty-icon">☀</span><h3>Rien par ici… pour le moment.</h3><p>Essayez un autre mot ou une autre catégorie.</p><button className="button button-outline" onClick={() => { setCategory('Tout'); setQuery(''); }}>Voir toute la carte <ArrowRight size={15} /></button></div>
          )}
          <div className="menu-footer"><span>Des questions sur un plat ? <a href="mailto:bonjour@maisonsolaire.fr">On est là pour vous.</a></span><a href="#carte" className="full-menu-link">Voir toute la carte <ArrowRight size={15} /></a></div>
        </section>

        <section className="story-section" id="histoire">
          <div className="story-image"><img src={imageUrl('photo-1414235077428-338989a2e8c0', 1000)} alt="Table chaleureuse dressée pour un repas convivial" loading="lazy" /><span className="story-image-label">DEPUIS 2018, AVEC LE CŒUR</span></div>
          <div className="story-copy">
            <div className="eyebrow"><span className="eyebrow-line" />UN PETIT MOT DE CHEZ NOUS</div>
            <h2>La simplicité,<br />c’est tout un <em>art.</em></h2>
            <p>Maison Soleil, c’est une histoire de famille, de marchés du matin et de grandes tablées. Une cuisine sincère qui suit les saisons et rassemble les gens.</p>
            <a className="story-link" href="mailto:bonjour@maisonsolaire.fr">Un peu plus sur notre histoire <ArrowRight size={15} /></a>
            <div className="story-signature">À très vite, <span>Lou & l’équipe</span></div>
          </div>
        </section>

        <section className="reservation-banner">
          <span className="banner-sun">✳</span>
          <div><p>LES BELLES SOIRÉES, ÇA SE PARTAGE</p><h2>On garde une place au soleil ?</h2></div>
          <button className="button button-light" onClick={() => setReservationOpen(true)}>Réserver une table <ArrowRight size={16} /></button>
        </section>
      </main>

      <footer className="site-footer">
        <a href="#accueil" className="brand footer-brand"><span className="brand-mark">m.</span><span className="brand-name">maison soleil<span className="brand-period">.</span></span></a>
        <span>12 rue des Rosiers, 75004 Paris</span><span>Mar–Dim · 12h–22h</span><span>© Maison Soleil 2025</span>
      </footer>

      {cartOpen && (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
          <aside className="side-panel" aria-label="Votre panier">
            <div className="panel-heading"><div><span className="eyebrow">CHEZ MAISON SOLEIL</span><h2>Votre panier<span className="heading-period">.</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Fermer le panier"><X size={20} /></button></div>
            {cart.length ? <>
              <div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={imageUrl(item.image, 180)} alt="" /><div className="cart-item-copy"><strong>{item.name}</strong><span>{money(item.price)} / pièce</span><div className="quantity-control"><button onClick={() => updateQuantity(item.id, -1)} aria-label={`Retirer une portion de ${item.name}`}><Minus size={13} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label={`Ajouter une portion de ${item.name}`}><Plus size={13} /></button></div></div><strong className="cart-line-price">{money(item.price * item.quantity)}</strong></div>)}</div>
              <div className="cart-summary"><div><span>Sous-total</span><strong>{money(cartTotal)}</strong></div><div><span>Livraison</span><span className="delivery-note">Calculée à l’étape suivante</span></div><button className="button button-dark checkout-button" onClick={() => { setCartOpen(false); setNotice('Le paiement sera disponible dès la connexion à votre compte.'); window.setTimeout(() => setNotice(''), 3500); }}>Continuer ma commande <ArrowRight size={16} /></button><span className="secure-note">Paiement sécurisé · Retrait ou livraison</span></div>
            </> : <div className="empty-cart"><span className="empty-icon">☀</span><h3>Votre panier prend le soleil.</h3><p>Ajoutez-y quelque chose de bon, il sera encore mieux.</p><button className="button button-dark" onClick={() => setCartOpen(false)}>Découvrir la carte <ArrowRight size={16} /></button></div>}
          </aside>
        </div>
      )}

      {reservationOpen && (
        <div className="overlay modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setReservationOpen(false); }}>
          <section className="reservation-modal" aria-labelledby="reservation-title">
            <button className="icon-button modal-close" onClick={() => setReservationOpen(false)} aria-label="Fermer"><X size={20} /></button>
            <div className="eyebrow"><span className="eyebrow-line" />ON VOUS GARDE UNE PLACE</div>
            <h2 id="reservation-title">À table, <em>bientôt ?</em></h2>
            <p className="modal-intro">Choisissez votre moment, on s’occupe du reste.</p>
            <form onSubmit={submitReservation} className="reservation-form">
              <label>Votre nom<input name="name" placeholder="Lou Martin" required /></label>
              <label>Votre e-mail<input name="email" type="email" placeholder="lou@exemple.fr" required /></label>
              <label>Votre téléphone<input name="phone" type="tel" placeholder="06 12 34 56 78" required /></label>
              <div className="form-row"><label>La date<input name="date" type="date" min={new Date().toISOString().slice(0, 10)} required /></label><label>L’heure<select name="time" defaultValue="19:00"><option>12:00</option><option>12:30</option><option>13:00</option><option>19:00</option><option>19:30</option><option>20:00</option><option>20:30</option></select><ChevronDown size={14} /></label></div>
              <label>Vous serez combien ?<select name="guests" defaultValue="2"><option value="1">1 personne</option><option value="2">2 personnes</option><option value="3">3 personnes</option><option value="4">4 personnes</option><option value="5">5 personnes</option><option value="6">6 personnes</option></select></label>
              <button className="button button-dark reservation-submit" type="submit">Demander ma réservation <ArrowRight size={16} /></button>
              <span className="form-footnote">La réservation sera confirmée par e-mail.</span>
            </form>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status"><span><Check size={15} /></span>{notice}</div>}
    </div>
  );
}

export default App;
