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

import { renderStrokeFillCircle } from '../../../renderer/circle'
import { checkPointOnCircle } from '../../../extension/mark/graphicHelper'
import { renderHorizontalLine, renderLine, renderVerticalLine } from '../../../renderer/line'
import { isValid } from '../../../utils/typeChecks'

// 标记图形绘制步骤开始
export const GRAPHIC_MARK_DRAW_STEP_START = 1

// 标记图形绘制步骤结束
export const GRAPHIC_MARK_DRAW_STEP_FINISHED = -1

export const HoverType = {
  OTHER: 'other',
  POINT: 'point',
  NONE: 'none'
}

/**
 * 绘制类型
 * @type {{LINE: string, TEXT: string}}
 */
export const GraphicMarkDrawType = {
  LINE: 'line',
  TEXT: 'text'
}

/**
 * 线类型
 * @type {{VERTICAL: number, COMMON: number, HORIZONTAL: number}}
 */
const LineType = {
  COMMON: 0,
  HORIZONTAL: 1,
  VERTICAL: 2
}

/**
 * 获取绘制线类型
 * @param point1
 * @param point2
 * @private
 */
function getLineType (point1, point2) {
  if (point1.x === point2.x) {
    return LineType.VERTICAL
  }
  if (point1.y === point2.y) {
    return LineType.HORIZONTAL
  }
  return LineType.COMMON
}

/**
 * 标记图形
 */
export default class GraphicMark {
  constructor (id, name, totalStep, chartData, xAxis, yAxis) {
    this.id = id
    this.name = name
    this._totalStep = totalStep
    this._chartData = chartData
    this._xAxis = xAxis
    this._yAxis = yAxis
    this._drawStep = GRAPHIC_MARK_DRAW_STEP_START
    this._tpPoints = []
    this._hoverType = HoverType.NONE
    this._hoverIndex = -1
  }

  /**
   * 时间戳转换成x轴上点的位置
   * @param tpPoint
   * @return {*|number}
   * @private
   */
  _timestampOrDataIndexToPointX ({ timestamp, dataIndex }) {
    return timestamp
      ? this._xAxis.convertToPixel(this._chartData.timestampToDataIndex(timestamp))
      : this._xAxis.convertToPixel(dataIndex)
  }

  /**
   * 绘制线
   * @param ctx
   * @param lines
   * @param markOptions
   * @private
   */
  _drawLines (ctx, lines, markOptions) {
    ctx.strokeStyle = markOptions.line.color
    ctx.lineWidth = markOptions.line.size
    lines.forEach(points => {
      const lineType = getLineType(points[0], points[1])
      switch (lineType) {
        case LineType.COMMON: {
          renderLine(ctx, () => {
            ctx.beginPath()
            ctx.moveTo(points[0].x, points[0].y)
            ctx.lineTo(points[1].x, points[1].y)
            ctx.stroke()
            ctx.closePath()
          })
          break
        }
        case LineType.HORIZONTAL: {
          renderHorizontalLine(ctx, points[0].y, points[0].x, points[1].x)
          break
        }
        case LineType.VERTICAL: {
          renderVerticalLine(ctx, points[0].x, points[0].y, points[1].y)
          break
        }
        default: { break }
      }
    })
  }

  /**
   * 绘制文字
   * @param ctx
   * @param texts
   * @param markOptions
   * @private
   */
  _drawText (ctx, texts, markOptions) {
    ctx.font = `${markOptions.text.weight} ${markOptions.text.size}px ${markOptions.text.family}`
    ctx.fillStyle = markOptions.text.color
    texts.forEach(({ x, y, text }) => {
      ctx.fillText(text, x + markOptions.text.marginLeft, y - markOptions.text.marginBottom)
    })
  }

  /**
   * 绘制
   * @param ctx
   */
  draw (ctx) {
    const xyPoints = this._tpPoints.map(({ timestamp, price, dataIndex }) => {
      return {
        x: this._timestampOrDataIndexToPointX({ timestamp, dataIndex }),
        y: this._yAxis.convertToPixel(price)
      }
    })
    const markOptions = this._chartData.styleOptions().graphicMark
    if (this._drawStep !== GRAPHIC_MARK_DRAW_STEP_START && xyPoints.length > 0) {
      const viewport = { width: this._xAxis.width(), height: this._yAxis.height() }
      const precision = { price: this._chartData.pricePrecision(), volume: this._chartData.volumePrecision() }
      const graphicOptions = this.createGraphicOptions(
        this._tpPoints, xyPoints, viewport,
        precision, this._xAxis, this._yAxis
      ) || []
      graphicOptions.forEach(({ type, isDraw, dataSource = [] }) => {
        if (!isValid(isDraw) || isDraw) {
          switch (type) {
            case GraphicMarkDrawType.LINE: {
              this._drawLines(ctx, dataSource, markOptions)
              break
            }
            case GraphicMarkDrawType.TEXT: {
              this._drawLines(ctx, dataSource, markOptions)
              break
            }
            default: { break }
          }
        }
      })
      this.drawExtend(
        ctx, graphicOptions, markOptions,
        viewport, precision, this._xAxis, this._yAxis
      )
    }
    if (this._hoverType !== HoverType.NONE) {
      xyPoints.forEach(({ x, y }, index) => {
        let radius = markOptions.point.radius
        let color = markOptions.point.backgroundColor
        let borderColor = markOptions.point.borderColor
        let borderSize = markOptions.point.borderSize
        if (this._hoverType === HoverType.POINT && index === this._hoverIndex) {
          radius = markOptions.point.activeRadius
          color = markOptions.point.activeBackgroundColor
          borderColor = markOptions.point.activeBorderColor
          borderSize = markOptions.point.activeBorderSize
        }
        renderStrokeFillCircle(ctx, color, borderColor, borderSize, { x, y }, radius)
      })
    }
  }

  /**
   * 获取鼠标点在图形上的类型
   * @return {string}
   */
  hoverType () {
    return this._hoverType
  }

  /**
   * 是否在绘制中
   * @return {boolean}
   */
  isDrawing () {
    return this._drawStep !== GRAPHIC_MARK_DRAW_STEP_FINISHED
  }

  /**
   * 重置鼠标点在图形上的参数
   */
  resetHoverParams () {
    this._hoverType = HoverType.NONE
    this._hoverIndex = -1
  }

  /**
   * 检查鼠标点是否在图形上
   * @param point
   * @return {boolean}
   */
  checkMousePointOnGraphic (point) {
    const graphicMark = this._chartData.styleOptions().graphicMark
    const xyPoints = []
    // 检查鼠标点是否在图形的点上
    for (let i = 0; i < this._tpPoints.length; i++) {
      const { timestamp, price, dataIndex } = this._tpPoints[i]
      const xyPoint = {
        x: this._timestampOrDataIndexToPointX({ timestamp, dataIndex }),
        y: this._yAxis.convertToPixel(price)
      }
      xyPoints.push(xyPoint)
      if (checkPointOnCircle(xyPoint, graphicMark.point.radius, point)) {
        this._hoverType = HoverType.POINT
        this._hoverIndex = i
        return true
      }
    }
    // 检查鼠标点是否在点构成的其它图形上
    const graphicOptions = this.createGraphicOptions(
      this._tpPoints,
      xyPoints,
      {
        width: this._xAxis.width(),
        height: this._yAxis.height()
      },
      {
        price: this._chartData.pricePrecision(),
        volume: this._chartData.volumePrecision()
      },
      this._xAxis,
      this._yAxis
    ) || []
    for (const { isCheck, dataSource = [] } of graphicOptions) {
      if (isCheck) {
        for (let i = 0; i < dataSource.length; i++) {
          const points = dataSource[i]
          if (this.checkMousePointOn(points, point)) {
            this._hoverType = HoverType.OTHER
            this._hoverIndex = i
            return true
          }
        }
      }
    }
    this.resetHoverParams()
  }

  /**
   * 绘制过程总鼠标移动事件
   * @param point
   */
  mouseMoveForDrawing (point) {
    const dataIndex = this._xAxis.convertFromPixel(point.x)
    const timestamp = this._chartData.dataIndexToTimestamp(dataIndex)
    const price = this._yAxis.convertFromPixel(point.y)
    this._tpPoints[this._drawStep - 1] = { timestamp, price, dataIndex }
    this.performMouseMoveForDrawing(this._drawStep, this._tpPoints, { timestamp, price, dataIndex })
  }

  /**
   * 鼠标左边按钮点击事件
   */
  mouseLeftButtonDownForDrawing () {
    if (this._drawStep === this._totalStep - 1) {
      this._drawStep = GRAPHIC_MARK_DRAW_STEP_FINISHED
    } else {
      this._drawStep++
    }
  }

  /**
   * 鼠标按住移动方法
   * @param point
   */
  mousePressedMove (point) {
    if (this._hoverType === HoverType.POINT && this._hoverIndex !== -1) {
      const dataIndex = this._xAxis.convertFromPixel(point.x)
      const timestamp = this._chartData.dataIndexToTimestamp(dataIndex)
      const price = this._yAxis.convertFromPixel(point.y)
      this._tpPoints[this._hoverIndex].timestamp = timestamp
      this._tpPoints[this._hoverIndex].dataIndex = dataIndex
      this._tpPoints[this._hoverIndex].price = price
      this.performMousePressedMove(this._tpPoints, this._hoverIndex, { dataIndex, timestamp, price })
    }
  }

  /**
   * 检查鼠标点在其它图形上
   * @param points
   * @param mousePoint
   */
  checkMousePointOn (points, mousePoint) {}

  /**
   * 创建图形配置
   * @param tpPoints
   * @param xyPoints
   * @param viewport
   * @param precision
   * @param xAxis
   * @param yAxis
   */
  createGraphicOptions (tpPoints, xyPoints, viewport, precision, xAxis, yAxis) {}

  /**
   * 处理绘制过程中鼠标移动
   * @param step
   * @param tpPoints
   * @param tpPoint
   */
  performMouseMoveForDrawing (step, tpPoints, tpPoint) {}

  /**
   * 处理鼠标按住移动
   * @param tpPoints
   * @param pressedPointIndex
   * @param tpPoint
   */
  performMousePressedMove (tpPoints, pressedPointIndex, tpPoint) {}

  /**
   * 扩展绘制
   * @param ctx
   * @param graphicOptions
   * @param markOptions
   * @param viewport
   * @param precision
   * @param xAxis
   * @param yAxis
   */
  drawExtend (ctx, graphicOptions, markOptions, viewport, precision, xAxis, yAxis) {}
}