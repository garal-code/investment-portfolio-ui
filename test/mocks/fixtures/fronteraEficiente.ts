import type { FronteraEficiente } from '@/types'

// Efficient-frontier response for 3 tickers over 13 monthly returns
// (Sep 2025 – Sep 2026). Statistics were computed from `precios`, so the
// fixture is internally consistent: `fechas_precios` has one more month than
// `fechas`, matrices are square in `tickers` order, weights sum to 1 and the
// frontier is ascending in return with the min-variance portfolio first.
export const fronteraEficienteFixture: FronteraEficiente = {
  fecha_inicio: '2025-09-01',
  fecha_fin: '2026-09-30',
  frecuencia: 'mensual',
  n_observaciones: 13,
  tickers: ['AAPL', 'MSFT', 'SAN.MC'],
  rentabilidades_esperadas: [0.021752, 0.002771, 0.033517],
  matriz_covarianzas: [
    [0.00205172, 0.00156408, 0.00187838],
    [0.00156408, 0.00318843, 0.00084885],
    [0.00187838, 0.00084885, 0.00432193],
  ],
  frontera: [
    { rentabilidad: 0.018229, volatilidad: 0.043625, varianza: 0.00190318, pesos: { AAPL: 0.62, MSFT: 0.26, 'SAN.MC': 0.12 } },
    { rentabilidad: 0.022066, volatilidad: 0.044519, varianza: 0.00198198, pesos: { AAPL: 0.725, MSFT: 0.095, 'SAN.MC': 0.18 } },
    { rentabilidad: 0.025928, volatilidad: 0.047523, varianza: 0.00225844, pesos: { AAPL: 0.645, MSFT: 0, 'SAN.MC': 0.355 } },
    { rentabilidad: 0.029752, volatilidad: 0.055009, varianza: 0.00302603, pesos: { AAPL: 0.32, MSFT: 0, 'SAN.MC': 0.68 } },
    { rentabilidad: 0.033517, volatilidad: 0.065741, varianza: 0.00432193, pesos: { AAPL: 0, MSFT: 0, 'SAN.MC': 1 } },
  ],
  cartera_minima_varianza: {
    rentabilidad: 0.018229, volatilidad: 0.043625, varianza: 0.00190318,
    pesos: { AAPL: 0.62, MSFT: 0.26, 'SAN.MC': 0.12 },
  },
  cartera_actual: {
    rentabilidad: 0.017868, volatilidad: 0.043726, varianza: 0.00191192,
    pesos: { AAPL: 0.52, MSFT: 0.31, 'SAN.MC': 0.17 },
  },
  excluidos: [{ ticker: 'IE00B4L5Y983', motivo: 'sin_ticker' }],
  peso_excluido: 0.0909,
  detalle: {
    datos: {
      fechas_precios: [
        '2025-08-01', '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01',
        '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01',
        '2026-06-01', '2026-07-01', '2026-08-01', '2026-09-01',
      ],
      precios: [
        [232.1, 506.7, 7.42],
        [254.6, 517.9, 8.71],
        [269.8, 517.8, 8.89],
        [278.9, 492.0, 9.31],
        [271.0, 483.6, 10.32],
        [259.5, 430.3, 10.05],
        [264.2, 410.7, 10.58],
        [251.3, 388.1, 9.94],
        [270.4, 425.6, 10.47],
        [281.7, 452.3, 10.83],
        [276.2, 471.9, 10.21],
        [289.5, 488.4, 10.96],
        [295.8, 502.7, 11.38],
        [303.4, 515.2, 11.12],
      ],
      fechas: [
        '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01', '2026-01-01',
        '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01',
        '2026-07-01', '2026-08-01', '2026-09-01',
      ],
      rentabilidades: [
        [0.096941, 0.022104, 0.173854],
        [0.059701, -0.000193, 0.020666],
        [0.033729, -0.049826, 0.047244],
        [-0.028326, -0.017073, 0.108485],
        [-0.042435, -0.110215, -0.026163],
        [0.018112, -0.04555, 0.052736],
        [-0.048827, -0.055028, -0.060491],
        [0.076005, 0.096625, 0.05332],
        [0.04179, 0.062735, 0.034384],
        [-0.019524, 0.043334, -0.057248],
        [0.048154, 0.034965, 0.073457],
        [0.021762, 0.029279, 0.038321],
        [0.025693, 0.024866, -0.022847],
      ],
    },
    estadisticas: {
      varianzas: [0.00205172, 0.00318843, 0.00432193],
      volatilidades: [0.045296, 0.056466, 0.065741],
      matriz_correlaciones: [
        [1, 0.6115, 0.6308],
        [0.6115, 1, 0.2287],
        [0.6308, 0.2287, 1],
      ],
    },
    cartera_actual: {
      valores_eur: { AAPL: 5200, MSFT: 3100, 'SAN.MC': 1700 },
      rentabilidades: [
        0.086817, 0.034498, 0.010125, -0.00158, -0.060681, 0.004263, -0.052732,
        0.078541, 0.047024, -0.006451, 0.048367, 0.026907, 0.017185,
      ],
    },
  },
}
