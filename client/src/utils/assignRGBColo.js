export function assignRGBColor(workType) {
  // Define HSB color values for each work type
  const colorMap = {
    article: [0, 1, 0.9], // Article: Red
    book: [240, 1, 0.95], // Book: Blue
    "book-chapter": [240, 1, 0.95], // Book Chapter: Blue
    dataset: [120, 1, 0.8], // Dataset: Green
    preprint: [44, 1, 1], // Preprint: Yellow
    dissertation: [182, 1, 1], // Dissertation: Aqua
    others: [1, 0, 0.3], // Other categories: Grey
  };

  // Get the appropriate HSB values
  let [h, s, v] = colorMap[workType.toLowerCase()] || colorMap["others"];

  // Convert HSB to RGB
  function hsbToRgb(h, s, b) {
    let c = b * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = b - c;
    let r = 0,
      g = 0,
      bVal = 0;
    if (h >= 0 && h < 60) {
      [r, g, bVal] = [c, x, 0];
    } else if (h >= 60 && h < 120) {
      [r, g, bVal] = [x, c, 0];
    } else if (h >= 120 && h < 180) {
      [r, g, bVal] = [0, c, x];
    } else if (h >= 180 && h < 240) {
      [r, g, bVal] = [0, x, c];
    } else if (h >= 240 && h < 300) {
      [r, g, bVal] = [x, 0, c];
    } else {
      [r, g, bVal] = [c, 0, x];
    }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((bVal + m) * 255),
    ];
  }
  return hsbToRgb(h, s, v);
}
