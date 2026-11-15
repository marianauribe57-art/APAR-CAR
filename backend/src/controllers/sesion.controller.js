// HU-04: cerrar mi sesión
export function cerrarSesion(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('aparcar.sid');
    res.status(204).end();
  });
}