export type GscDateRange = {
  label: "current" | "previous";
  startDate: string;
  endDate: string;
  start: Date;
  end: Date;
};

function formatGscDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() - days);
  return result;
}

/** GSC data is typically 2–3 days behind; end 3 days before today. */
export function getGscImportDateRanges(): GscDateRange[] {
  const dataLagDays = 3;
  const periodLengthDays = 28;
  const end = subtractDays(new Date(), dataLagDays);
  const currentStart = subtractDays(end, periodLengthDays - 1);
  const previousEnd = subtractDays(currentStart, 1);
  const previousStart = subtractDays(previousEnd, periodLengthDays - 1);

  return [
    {
      label: "current",
      startDate: formatGscDate(currentStart),
      endDate: formatGscDate(end),
      start: currentStart,
      end,
    },
    {
      label: "previous",
      startDate: formatGscDate(previousStart),
      endDate: formatGscDate(previousEnd),
      start: previousStart,
      end: previousEnd,
    },
  ];
}
