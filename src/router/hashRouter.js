function getHashRoute(hash, playRoute, settingsRoute) {
  return hash === settingsRoute ? settingsRoute : playRoute;
}

function updateBodyRouteClass(body, route, playRoute, settingsRoute) {
  body.classList.toggle("route-play", route === playRoute);
  body.classList.toggle("route-settings", route === settingsRoute);
}

function bootstrapHashRoute({ playRoute, settingsRoute, onRouteChange }) {
  if (location.hash !== playRoute && location.hash !== settingsRoute) {
    location.hash = playRoute;
  }
  onRouteChange();
}

export {
  bootstrapHashRoute,
  getHashRoute,
  updateBodyRouteClass
};
