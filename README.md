# Network Atlas

[![License: PolyForm Noncommercial 1.0.0](https://img.shields.io/badge/license-PolyForm%20Noncommercial%201.0.0-blue)](LICENSE)

Visualize your LinkedIn data.

A static web page. Drop in a LinkedIn data export (.zip, folder or CSV files) and it builds a visual report in your browser. Nothing is uploaded: files are read, parsed and analyzed locally, and message text is never read.

- `index.html`, `app.css`, `app.js`: the page
- `lib/csv.js`, `lib/data.js`: file reading and normalizing
- `lib/analysis.js`: the calculations (network clusters, posting vs. connections, invitations, relationship tiers, connection timeline, career layers)
- `lib/render.js`: charts (Chart.js) and network graphs (D3)
- `lib/style.js`: color palettes and font choices
- `lib/sample.js`: made-up sample data for the demo button

To try it, open `index.html` in a browser, or serve the folder with any static host (for example GitHub Pages).

The judgment-heavy analyses (inferences vs. reality, lost opportunities, follow clusters, inbox quality, job-search signals, targets vs. network) are offered as copy-and-paste prompts for the user's own AI assistant.

Built by [Mary-Lynn Bragg](https://www.linkedin.com/in/marylynn) with Claude Code. The idea and format are adapted from [Visualize Your LinkedIn Data Export](https://loganhc-09.github.io/LinkedIn-Data-Export-Visualization/) by Logan Currie, also built with Claude Code.

## License

Network Atlas is free for noncommercial use under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may use it, change it, fork it and build on it, including for personal, educational, research and charitable purposes, as long as you keep the copyright notice and do not use it commercially. That includes charging people to use it. For commercial use, contact Mary-Lynn Bragg through [LinkedIn](https://www.linkedin.com/in/marylynn).

The reports and images that people generate with Network Atlas belong to them. The license covers the software, not its output.

## Third-party software

Network Atlas loads these libraries and fonts. They keep their own licenses, which are not covered by the license above.

- [Chart.js](https://www.chartjs.org/) (MIT)
- [D3.js](https://d3js.org/) (ISC)
- [JSZip](https://stuk.github.io/jszip/) (MIT or GPL-3.0; used under MIT)
- Fonts from [Google Fonts](https://fonts.google.com/), such as Inter, under the SIL Open Font License or the Apache License
