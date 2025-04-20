const BACKLOGGD_AUTOMATION_SCRIPT = () => async (rating) => {
  const gameIdEl = document.querySelector('#game-page-id');
  const gameId = gameIdEl?.getAttribute('game_id');
  if (!gameId) console.warn("Cannot retrieve gameId of the current game page.");

  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  const csrf = csrfMeta?.content;
  if (!csrf) console.warn("Cannot retrieve CSRF token to ensure the reliability of the request.")
    
  const response = await fetch(`/rate/${gameId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-CSRF-Token": csrf,
      "X-Requested-With": "XMLHttpRequest",
    },
    body: `rating=${rating}`
  });

  if (response.ok) {
    console.log(`Succesfully rated the game ${gameId} with the following rating: ${rating}`);
  } else {
    console.warn(`Request to the Backloggd server failed with the following status code: ${response.status}`);
  }
};

module.exports = {
  BACKLOGGD_AUTOMATION_SCRIPT
};