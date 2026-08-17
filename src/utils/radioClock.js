/*
 * ============================================================
 * YOU JUST WALKED IN.
 * Shared Radio Clock
 * ============================================================
 *
 * Every visitor uses the same reference time.
 *
 * This means the radio does not start from the beginning
 * when somebody enters a scene.
 *
 * Instead:
 *
 *     current time
 *          ↓
 *     radio timeline
 *          ↓
 *     current song
 *          ↓
 *     current position inside song
 *
 * ============================================================
 */

/*
 * The moment the radio timeline began.
 *
 * This is deliberately fixed.
 * Do not change this every time the app loads.
 */
const RADIO_EPOCH = new Date(
  "2026-08-01T00:00:00Z"
).getTime();


/*
 * ------------------------------------------------------------
 * ELAPSED RADIO TIME
 * ------------------------------------------------------------
 */

export function getRadioElapsedSeconds() {
  const now = Date.now();

  return Math.max(
    0,
    (now - RADIO_EPOCH) / 1000
  );
}


/*
 * ------------------------------------------------------------
 * CURRENT RADIO POSITION
 * ------------------------------------------------------------
 *
 * Returns:
 *
 * {
 *   songIndex,
 *   song,
 *   position,
 *   totalDuration
 * }
 *
 * `position` is the exact number of seconds into
 * the current song.
 * ------------------------------------------------------------
 */

export function getCurrentRadioPosition(songs) {
  if (!Array.isArray(songs) || songs.length === 0) {
    return null;
  }

  /*
   * Every song must have a valid duration.
   */
  const validSongs = songs.filter(
    (song) =>
      Number.isFinite(Number(song.duration)) &&
      Number(song.duration) > 0
  );

  if (validSongs.length === 0) {
    return null;
  }

  /*
   * Total duration of the complete radio loop.
   */
  const totalDuration = validSongs.reduce(
    (total, song) =>
      total + Number(song.duration),
    0
  );

  /*
   * Find our current position inside the loop.
   */
  const elapsed =
    getRadioElapsedSeconds() % totalDuration;

  let accumulated = 0;

  for (let index = 0; index < validSongs.length; index++) {
    const song = validSongs[index];

    const songDuration = Number(song.duration);

    const songEnd =
      accumulated + songDuration;

    if (elapsed < songEnd) {
      return {
        songIndex: index,
        song,
        position: elapsed - accumulated,
        totalDuration,
      };
    }

    accumulated = songEnd;
  }

  /*
   * Safety fallback.
   */
  const lastIndex = validSongs.length - 1;

  return {
    songIndex: lastIndex,
    song: validSongs[lastIndex],
    position: 0,
    totalDuration,
  };
}