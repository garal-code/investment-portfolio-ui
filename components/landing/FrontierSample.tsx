'use client'
import { FronteraChart } from '@/components/charts/FronteraChart'
import { SAMPLE_FRONTIER } from './sample-portfolio'

export function FrontierSample() {
  return (
    <div data-ui className="lp-ui lp-frontier">
      <FronteraChart
        frontera={SAMPLE_FRONTIER.frontera}
        minimaVarianza={SAMPLE_FRONTIER.minimaVarianza}
        actual={SAMPLE_FRONTIER.actual}
        tickers={SAMPLE_FRONTIER.tickers}
      />
    </div>
  )
}
