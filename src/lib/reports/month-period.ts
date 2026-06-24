export type MonthPeriod = {
  year: number;
  month: number;
  dateStart: Date;
  dateEnd: Date;
};

export function getMonthPeriod(year: number, month: number): MonthPeriod {
  const dateStart = new Date(Date.UTC(year, month - 1, 1));
  const dateEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  return { year, month, dateStart, dateEnd };
}

export function getPreviousMonthPeriod(year: number, month: number): MonthPeriod {
  if (month === 1) {
    return getMonthPeriod(year - 1, 12);
  }

  return getMonthPeriod(year, month - 1);
}

export function defaultReportPeriod(reference = new Date()): MonthPeriod {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();

  if (month === 0) {
    return getMonthPeriod(year - 1, 12);
  }

  return getMonthPeriod(year, month);
}

export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}
