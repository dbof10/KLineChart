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

import type Nullable from '../../common/Nullable'

import IndicatorImp, { type IndicatorTemplate, type IndicatorConstructor } from '../../component/Indicator'

import awesomeOscillator from './awesomeOscillator'
import bias from './bias'
import bollingerBands from './bollingerBands'
import brar from './brar'
import bullAndBearIndex from './bullAndBearIndex'
import commodityChannelIndex from './commodityChannelIndex'
import currentRatio from './currentRatio'
import differentOfMovingAverage from './differentOfMovingAverage'
import directionalMovementIndex from './directionalMovementIndex'
import easeOfMovementValue from './easeOfMovementValue'
import exponentialMovingAverage from './exponentialMovingAverage'
import momentum from './momentum'
import movingAverage from './movingAverage'
import movingAverageConvergenceDivergence from './movingAverageConvergenceDivergence'
import onBalanceVolume from './onBalanceVolume'
import priceAndVolumeTrend from './priceAndVolumeTrend'
import psychologicalLine from './psychologicalLine'
import rateOfChange from './rateOfChange'
import relativeStrengthIndex from './relativeStrengthIndex'
import simpleMovingAverage from './simpleMovingAverage'
import stoch from './stoch'
import stopAndReverse from './stopAndReverse'
import tripleExponentiallySmoothedAverage from './tripleExponentiallySmoothedAverage'
import volume from './volume'
import volumeRatio from './volumeRatio'
import williamsR from './williamsR'
import relativeStrength from "./relativeStrength";
import openInterest from "./openInterest";
import TWaveVolume from "./twave/TWaveVolume";
import TBlockVolume from "./twave/TBlockVolume";
import Tpace from "./twave/Tpace";
import TBidAskOscillator from "./twave/TBidAskOscilator";
import TCumulativeDelta from "./twave/TCumulativeDelta";
import TWave from "./twave/TWave";
import { DisplayIndicator } from "./DisplayIndicator";
import { YesterdayStructure } from "./YesterdayStructure";
import { VWAP } from "./VWAP";
import averageTrueRange from "./atr";
import Quarters from "./Quarters";

const indicators: Record<string, IndicatorConstructor> = {}

const extensions = [
   awesomeOscillator, bias, bollingerBands, brar,
  bullAndBearIndex, commodityChannelIndex, currentRatio, differentOfMovingAverage,
  directionalMovementIndex, easeOfMovementValue, exponentialMovingAverage, momentum,
  movingAverage, movingAverageConvergenceDivergence, onBalanceVolume, priceAndVolumeTrend,
  psychologicalLine, rateOfChange, relativeStrengthIndex, simpleMovingAverage,
  stoch, stopAndReverse, tripleExponentiallySmoothedAverage, volume, volumeRatio, williamsR,
  relativeStrength, openInterest, TWaveVolume, TBlockVolume, Tpace, TBidAskOscillator, TCumulativeDelta, TWave,
  YesterdayStructure, VWAP, averageTrueRange, Quarters
]

const mapName = {
  "AVP": "Average Price",
  "AO": "Awesome Oscillator",
  "BIAS": "Bias",
  "BOLL": "Bollinger Bands",
  "BRAR": "BRAR",
  "BBI": "Bull and Bear Index",
  "CCI": "Commodity Channel Index",
  "CR": "Current Ratio",
  "DMA": "Different of Moving Average",
  "DMI": "Directional Movement Index",
  "EMV": "Ease of Movement Value",
  "EMA": "Exponential Moving Average",
  "MTM": "Momentum",
  "MA": "Moving Average",
  "MACD": "Moving Average Convergence Divergence",
  "OBV": "On Balance Volume",
  "PVT": "Price and Volume Trend",
  "PSY": "Psychological Line",
  "ROC": "Rate of Change",
  "RSI": "Relative Strength Index",
  "SMA": "Simple Moving Average",
  "KDJ": "Stochastic Oscillator",
  "SAR": "Stop and Reverse",
  "TRIX": "Triple Exponentially Smoothed Average",
  "VOL": "Volume",
  "VR": "Volume Ratio",
  "WR": "Williams %R",
  "RS": "Relative Strength",
  "OI": "Open Interest",
  "TW": "TWave Histogram",
  "TB": "TBlock Histogram",
  "TPA": "Tpace",
  "TBA": "TBid Ask Oscillator",
  "TCD": "TCumulative Delta",
  "TWA": "TWave",
  "YEST": "Yesterday Low",
  "VWAP": "VWAP",
  "ATR": "Average True Range",
  "QUA": "Quarter"
};


extensions.forEach((indicator: IndicatorTemplate) => {
  indicators[indicator.name] = IndicatorImp.extend(indicator)
})

function registerIndicator<D> (indicator: IndicatorTemplate<D>): void {
  indicators[indicator.name] = IndicatorImp.extend(indicator)
}

function getIndicatorClass (name: string): Nullable<IndicatorConstructor> {
  return indicators[name] ?? null
}

function getSupportedIndicators (): DisplayIndicator[] {

  const list: DisplayIndicator[] = [];
  extensions.forEach((indicator: IndicatorTemplate) => {

    const indi: DisplayIndicator = {
      id: indicator.name,
      name: mapName[indicator.name],
      isOverlay: indicator.isOverlay !== undefined
    }
    list.push(indi);
  })

  return list;

}

export { registerIndicator, getIndicatorClass, getSupportedIndicators }
