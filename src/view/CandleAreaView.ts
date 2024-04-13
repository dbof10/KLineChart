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

import type Coordinate from '../common/Coordinate'
import type VisibleData from '../common/VisibleData'
import type BarSpace from '../common/BarSpace'
import { type GradientColor, type PolygonStyle } from '../common/Styles'
import Animation from '../common/Animation'
import { isNumber, isArray, isValid } from '../common/utils/typeChecks'
import { UpdateLevel } from '../common/Updater'

import ChildrenView from './ChildrenView'

import { lineTo } from '../extension/figure/line'
import type Figure from '../component/Figure'
import type Nullable from '../common/Nullable'
import { type CircleAttrs } from '../extension/figure/circle'

export default class CandleAreaView extends ChildrenView {
  private _figure: Nullable<Figure<CircleAttrs, Partial<PolygonStyle>>> = null
  private _animationFrameTime = 0

  private readonly _animation = new Animation({ iterationCount: Infinity }).doFrame((time) => {
    this._animationFrameTime = time
    const pane = this.getWidget().getPane()
    pane.getChart().updatePane(UpdateLevel.Main, pane.getId())
  })

  override drawImp (ctx: CanvasRenderingContext2D): void {
    const widget = this.getWidget()
    const pane = widget.getPane()
    const chart = pane.getChart()
    const dataList = chart.getDataList()
    const lastDataIndex = dataList.length - 1
    const bounding = widget.getBounding()
    const yAxis = pane.getAxisComponent()
    const styles = chart.getStyles().candle.area
    const coordinates: Coordinate[] = []
    let minY = Number.MAX_SAFE_INTEGER
    let areaStartX: number = 0
    let indicatePointCoordinate: Nullable<Coordinate> = null
    this.eachChildren((data: VisibleData, _: BarSpace, i: number) => {
      const { data: kLineData, x } = data
      const value = kLineData?.[styles.value]
      if (isNumber(value)) {
        const y = yAxis.convertToPixel(value)
        if (i === 0) {
          areaStartX = x
        }
        coordinates.push({ x, y })
        minY = Math.min(minY, y)
        if (data.dataIndex === lastDataIndex) {
          indicatePointCoordinate = { x, y }
        }
      }
    })

    if (coordinates.length > 0) {
      this.createFigure({
        name: 'line',
        attrs: { coordinates },
        styles: {
          color: styles.lineColor,
          size: styles.lineSize,
          smooth: styles.smooth
        }
      }
      )?.draw(ctx)

      // render area
      const backgroundColor = styles.backgroundColor
      let color: string | CanvasGradient
      if (isArray<GradientColor>(backgroundColor)) {
        const gradient = ctx.createLinearGradient(0, bounding.height, 0, minY)
        try {
          backgroundColor.forEach(({ offset, color }) => {
            gradient.addColorStop(offset, color)
          })
        } catch (e) {
          console.log("CandleAreaView " + e.toString())
        }
        color = gradient
      } else {
        color = backgroundColor
      }
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(areaStartX, bounding.height)
      ctx.lineTo(coordinates[0].x, coordinates[0].y)
      lineTo(ctx, coordinates, styles.smooth)
      ctx.lineTo(coordinates[coordinates.length - 1].x, bounding.height)
      ctx.closePath()
      ctx.fill()
    }

    const pointStyles = styles.point
    if (pointStyles.show && isValid(indicatePointCoordinate)) {
      this.createFigure({
        name: 'circle',
        attrs: {
          x: indicatePointCoordinate!.x,
          y: indicatePointCoordinate!.y,
          r: pointStyles.radius
        },
        styles: {
          style: 'fill',
          color: pointStyles.color
        }
      })?.draw(ctx)
      let rippleRadius = pointStyles.rippleRadius
      if (pointStyles.animation) {
        rippleRadius = pointStyles.radius + this._animationFrameTime / pointStyles.animationDuration * (pointStyles.rippleRadius - pointStyles.radius)
        this._animation.setDuration(pointStyles.animationDuration).start()
      }
      if (this._figure === null) {
        this._figure = this.createFigure({
          name: 'circle',
          attrs: {
            x: indicatePointCoordinate!.x,
            y: indicatePointCoordinate!.y,
            r: pointStyles.rippleRadius
          },
          styles: {
            style: 'fill',
            color: pointStyles.rippleColor
          }
        })
      } else {
        this._figure.setAttrs({
          x: indicatePointCoordinate!.x,
          y: indicatePointCoordinate!.y,
          r: rippleRadius
        })
      }
      this._figure?.draw(ctx)
      if (pointStyles.animation) {
        this._animation.setDuration(pointStyles.animationDuration).start()
      }
    } else {
      this._animation.stop()
    }
  }
}
