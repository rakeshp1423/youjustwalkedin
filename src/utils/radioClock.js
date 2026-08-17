const RADIO_EPOCH = new Date("2026-08-01T00:00:00Z").getTime();

/**
 * Returns the number of seconds that have elapsed
 * since the radio started existing.
 */
export function getRadioElapsedSeconds() {
  const now = Date.now();

  return Math.max(
    0,
    (now - RADIO_EPOCH) / 1000
  );
}


/**
 * Given a list of songs, calculate which song
 * should currently be playing and at what position.
 */
export function getCurrentRadioPosition(songs) {
  if (!songs || songs.length === 0) {
    return null;
  }

  const validSongs = songs.filter(
    (song) =>
      Number.isFinite(song.duration) &&
      song.duration > 0
  );

  if (validSongs.length === 0) {
    return null;
  }

  const totalDuration = validSongs.reduce(
    (total, song) => total + song.duration,
    0
  );

  const elapsed =
    getRadioElapsedSeconds() % totalDuration;

  let accumulated = 0;

  for (let index = 0; index < validSongs.length; index++) {
    const song = validSongs[index];

    const songEnd =
      accumulated + song.duration;

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

  return {
    songIndex: validSongs.length - 1,
    song: validSongs[validSongs.length - 1],
    position:
      validSongs[validSongs.length - 1].duration,
    totalDuration,
  };
}