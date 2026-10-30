function notFound(req, res) {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  console.error(error);
  if (res.headersSent) return next(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Cette valeur existe déjà.' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Identifiant invalide.' });
  }
  return res.status(500).json({ message: 'Une erreur serveur est survenue.' });
}

module.exports = { notFound, errorHandler };
