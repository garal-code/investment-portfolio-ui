// ResponsiveContainer starts at -1 x -1 until it measures its parent and warns
// about it on the first render; a positive placeholder size avoids that noise.
export const INITIAL_DIMENSION = { width: 1, height: 1 }
