// The printed book: the only thing DogText sells. Change prices here.
// Printed by Mixam: 8x8 in softcover, saddle-stitched (stapled), one letter
// per page. Shipping is charged on top of the book (never free on
// print-on-demand: it comes out of the margin).
export const BOOK_PRICE_USD = 34;
// A month of letters makes the first book.
export const FIRST_BOOK_LETTERS = 30;

// Print spec for Mixam (lib/book-pdf.ts builds the files).
export const BOOK_TRIM_IN = 8; // 8 x 8 in square
export const BOOK_BLEED_IN = 0.125; // Mixam's standard bleed on every edge
