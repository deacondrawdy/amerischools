/**
 * Join the last two words with a non-breaking space so a single word can never
 * sit alone on the last line ("Growing with purpose." never ends "…with / purpose.").
 * Use for short headings and card copy; long body text relies on `text-wrap: pretty`.
 */
export const noWidow = (text: string) => text.replace(/\s+(\S+)\s*$/, ' $1');
