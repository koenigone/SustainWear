/**
 * Time Formatter Helper Functions
 */
export const TimeFormatter = (() => {
  /**
   * Predefined Format Templates
   * For use with the dateToFormat function
   */
  const FormatTemplates = {
    date: "dd/mm/yy",
    time: "HH:MM:SS",
    dateTime: "dd/mm/yy - HH:MM:SS",
    short: "d/m/y",
    medium: "eee d mmmm",
    long: "eeee d of mmmmm yy",
  };

  /**
   * - Internal
   * Patterns for use in the TimeFormatter
   * key of timePatterns denotes the symbol used in the format string
   * key of timePatterns key denotes the value gotten from repeated occurences of the symbol
   * Returns a date segement(formatted)
   *
   * no support for miliseconds
   * dummy 'x' values arent accessed but used as we shift up from 0 based date values 
   */
  const TimePatterns = {
    d: {
      //Day of the month
      1: (date) => date.getDate(),
      2: (date) => {
        const d = date.getDate();
        return d >= 10 ? d : `0${d}`;
      },
    },
    e: {
      //Day of the week
      1: (date) => date.getDay() + 1,
      2: ["x", "S", "M", "T", "W", "T", "F", "S"],
      3: ["x", "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
      4: [
        "x",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    m: {
      //Month of the year
      1: (date) => date.getMonth() + 1,
      2: (date) => {
        const m = date.getMonth() + 1;
        return m >= 10 ? m : `0${m}`;
      },
      3: ["x", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      4: [
        "x",
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      5: [
        "x",
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ],
    },
    y: {
      //Year
      1: (date) => {
        const y = date.getFullYear();
        return y.toString().substring(2);
      },
      2: (date) => date.getFullYear(),
    },
    H: {
      //Hour
      1: (date) => date.getHours(),
      2: (date) => {
        const h = date.getHours();
        return h >= 10 ? h : `0${h}`;
      },
    },
    M: {
      //Minute
      1: (date) => date.getMinutes(),
      2: (date) => {
        const m = date.getMinutes();
        return m >= 10 ? m : `0${m}`;
      },
    },
    S: {
      //Seconds
      1: (date) => date.getSeconds(),
      2: (date) => {
        const s = date.getSeconds();
        return s >= 10 ? s : `0${s}`;
      },
    },
  };

  /**
   * Regex for extracting formatter keys
   */
  const TimeFormatterRegex = /[yMdeHmS]+/g;

  /**
   * - Internal
   * Takes an input and converts to instance of Date if possible else null
   * @param {Date|number|string} input - Input Date/Timestamp/Timestring(ie iso)
   * @param {Object} [options] - Optional Params
   * @param {boolean} [options.miliseconds=false] - Treat Timestamps as Miliseconds. Defaults To False (Seconds)
   * @return {Date|null} Date instance or null on error
   */
  const inputToDate_ = (input, { miliseconds } = { miliseconds: false }) => {
    // if inputs already date return
    if (input instanceof Date) return input;

    // if input is number then treat as timestamp and return a new date
    if (!isNaN(Number(input)))
      return new Date(miliseconds ? Number(input) : Number(input) * 1000);

    // if input converted to date is a number then return it. handles iso strings and similar
    if (!isNaN(new Date(input).getTime())) return new Date(input);

    // return null on failure. could throw error.
    // return null
    throw new Error(
      `Error: Invalid input date of '${input}'. Expected Date, timestamp or datetime string`
    );
  };

  /**
   * - Internal
   * Splits a date format into its parts
   * @param {string} format
   */
  const formatStringToParts_ = (format) => {
    const parts = format.match(TimeFormatterRegex);

    return parts.map((part, i) => {
      const key = part.slice(0, 1);

      let datePart = null;
      if (TimePatterns[key] && Object.values(TimePatterns[key]).length > 0) {
        const len = part.length;
        const maxLength = Object.values(TimePatterns[key]).length;
        datePart = TimePatterns[key][len > maxLength ? maxLength : len];
      }

      return [key, part, datePart, null];
    });
  };

  /** @typedef {[
   *  string,
   *  string,
   *  (string[] | ((date: Date) => string | number) | null),
   *  null | string
   * ]} formatPart
   */

  /**
   * - Internal
   * Inserts the date value of each format part into the format template
   * @param {string} format
   * @param {formatPart[]} formatParts
   */
  const insertDateValuesToFormat_ = (format, formatParts) => {
    let i = 0;
    return format.replace(TimeFormatterRegex, () => {
      const part = formatParts[i++];
      return part[3] ?? part[1]; // datevalue else on null then original part
    });
  };

  /**
   * Converts the input to a formatted string
   * @param {string | number | Date} input - Input date
   * @param {string} [format] format - Format template
   */
  const dateToFormat = (input, format = FormatTemplates.dateTime) => {
    const date = inputToDate_(input);

    const formatParts = formatStringToParts_(format);

    if (formatParts.length === 0) return date; // Technically erranious as format string contains no parts so could throw error.

    const formatPartsWithValues = formatParts.map(
      ([key, part, datePart, dateValue]) => {
        if (typeof datePart === "function") {
          dateValue = datePart(date);
        }

        if (Array.isArray(datePart)) {
          const func = TimePatterns[key][1]; // format part base value function
          dateValue = datePart[func(date)]; // use index returned by func to get the formatted date segment from
        }

        return [key, part, datePart, dateValue];
      }
    );

    const formattedString = insertDateValuesToFormat_(
      format,
      formatPartsWithValues
    );

    return formattedString;
  };

  return {
    dateToFormat,
    FormatTemplates,
  };
})();
