/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import IndicatorWidget from './IndicatorWidget'

import CandleBarView from '../view/CandleBarView'
import CandleAreaView from '../view/CandleAreaView'
import CandleHighLowPriceView from '../view/CandleHighLowPriceView'
import CandleLastPriceLineView from '../view/CandleLastPriceLineView'

import type IndicatorTooltipView from '../view/IndicatorTooltipView'
import CandleTooltipView from '../view/CandleTooltipView'

import { CandleType } from '../common/Styles'

import type AxisPane from '../pane/DrawPane'

import type YAxis from '../component/YAxis'
import SessionBreakView from "../view/SessionBreakView";

export default class CandleWidget extends IndicatorWidget {
  private readonly _candleBarView = new CandleBarView(this)
  private readonly _candleAreaView = new CandleAreaView(this)
  private readonly _candleHighLowPriceView = new CandleHighLowPriceView(this)
  private readonly _candleLastPriceLineView = new CandleLastPriceLineView(this)
  private readonly _sessionBreakView = new SessionBreakView(this)

  constructor (rootContainer: HTMLElement, pane: AxisPane<YAxis>) {
    super(rootContainer, pane)
    this.addChild(this._candleBarView)
  }

  override updateMainContent (ctx: CanvasRenderingContext2D): void {
    const candleStyles = this.getPane().getChart().getStyles().candle
    const chartStore = this.getPane().getChart().getChartStore();
    const settings= chartStore.getTradingSettings();
    const timeframe = chartStore.getTimeframeDuration()

    if (candleStyles.type !== CandleType.Area) {
      this._candleBarView.draw(ctx)
      this._candleHighLowPriceView.draw(ctx)
      this._candleAreaView.stopAnimation()
    } else {
      this._candleAreaView.draw(ctx)
    }
    this._candleLastPriceLineView.draw(ctx)
    if(settings.drawSessionBreak && timeframe > 0) {
      this._sessionBreakView.draw(ctx);
    }
  }

  override createTooltipView (): IndicatorTooltipView {
    return new CandleTooltipView(this)
  }
}
