import KLineData from "../../common/KLineData";
import { Indicator, IndicatorAlertCallback, IndicatorTemplate } from "../../component/Indicator";
import { Nullable } from "vitest";


interface Quarter {
  index: number;
  color: string;
}

function getQuarterIndex(date: Date): number {
  const month = date.getMonth();

  if (month >= 0 && month <= 2) { // Q1
    return 1;
  } else if (month >= 3 && month <= 5) { // Q2
    return 2;
  } else if (month >= 6 && month <= 8) { // Q3
    return 3;
  } else { // Q4
    return 4;
  }

}


function getQuarterColor(index: number): string {

  if (index == 1) {
    return "rgba(40,174,40,0.2)";
  } else if (index == 2) {
    return "rgba(243,80,80,0.2)";
  } else if (index == 3) {
    return "rgba(255,206,85,0.2)";
  } else {
    return "rgba(55,96,255,0.2)";
  }

}

const Quarters: IndicatorTemplate<Quarter> = {
  name: "QUA",
  shortName: "Quarter",
  isOverlay: true,
  calc: (dataList: KLineData[], indicator: Indicator<Quarter>, alertCallback: Nullable<IndicatorAlertCallback<Quarter>>) => {

    return dataList.map((e: KLineData) => {
      const index = getQuarterIndex(new Date(e.timestamp));
      const color = getQuarterColor(index);

      const q: Quarter = {};
      q.color = color;
      q.index = index;

      return q;
    });
  },
  draw: ({
           ctx,
           barSpace,
           visibleRange,
           indicator,
           xAxis,
           yAxis,
         }) => {
    const { from, to } = visibleRange;

    const result = indicator.result;


    for (let i = from; i < to; i++) {
      const data: Quarter = result[i];
      const x = xAxis.convertToPixel(i);


      ctx.fillStyle = data.color;
      // Draw a filled rectangle
      ctx.fillRect(x- barSpace.bar/2, 0, barSpace.bar,  ctx.canvas.height);
    }
    return false;
  },
};

export default Quarters;
