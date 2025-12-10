function getDateRange(range, start, end) {
  const now = new Date();

  if (range === "6M") {
    const past = new Date();
    past.setMonth(now.getMonth() - 6);
    return { start: past, end: now };
  }

  if (range === "12M") {
    const past = new Date();
    past.setMonth(now.getMonth() - 12);
    return { start: past, end: now };
  }

  if (range === "24M") {
    const past = new Date();
    past.setMonth(now.getMonth() - 24);
    return { start: past, end: now };
  }

  if (range === "CUSTOM") {
    return { start: new Date(start), end: new Date(end) };
  }

  throw new Error("Invalid date range");
}

module.exports = { getDateRange };