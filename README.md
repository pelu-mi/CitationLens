<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/pelu-mi/CitationLens">
    <img src="client/public/logo-transparent.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">CitationLens</h3>

  <p align="center">
    Interactive Academic Research Visualization Platform
    <br />
    <a href="https://github.com/pelu-mi/CitationLens"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://citationlens.netlify.app/">Live Demo</a>
    ·
    <a href="https://github.com/pelu-mi/CitationLens/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/pelu-mi/CitationLens/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#visualizations">Visualizations</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#authors">Authors</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

<div align="center">
  <img src="Screenshots/Domain Overview.png" alt="Domain Overview" width="600">
  <br/>
  <em>Interactive Domain Hierarchy Visualization</em>
</div>

<br/>

CitationLens is an innovative web-based visualization platform designed to help researchers, academics, and students explore and understand the complex landscape of academic research. In today's information-rich academic environment, understanding research trends, influential authors, prominent institutions, and citation networks can be overwhelming and time-consuming.

Traditional methods of exploring academic literature often involve sifting through endless lists of papers, authors, and institutions without a clear understanding of the relationships and influence patterns that exist within research domains. This fragmented approach makes it difficult to identify key research areas, understand collaboration networks, or discover emerging trends in academia.

CitationLens addresses these challenges by providing an intuitive, interactive visualization platform that transforms complex academic data into meaningful visual insights. The platform leverages the comprehensive OpenAlex database to deliver real-time visualizations of research domains, institutional influence, author collaboration networks, and citation patterns.

### Core Functionality

 - [x] **Domain Hierarchy Visualization**: Interactive radial tree visualization displaying the hierarchical structure of academic research domains, fields, and subfields
 - [x] **Institutional Analysis**: Comprehensive bar chart visualizations showing the most influential institutions within specific research areas
 - [x] **Author Network Analysis**: Scatterplot visualizations comparing author productivity (works count) against research impact (citations count)
 - [x] **Citation Network Mapping**: Force-directed graph visualizations revealing the interconnected nature of academic works and their references
 - [x] **Interactive Navigation**: Seamless navigation between different research domains and subfields with breadcrumb navigation
 - [x] **Topic-Based Filtering**: Advanced filtering capabilities allowing users to focus on specific research topics within broader domains
 - [x] **Real-Time Data Integration**: Live data synchronization with the OpenAlex API ensuring up-to-date research information
 - [x] **Responsive Design**: Fully responsive interface optimized for desktop, tablet, and mobile viewing experiences
 - [x] **Zoom and Pan Controls**: Interactive controls for detailed exploration of complex visualizations
 - [x] **Dynamic Color Coding**: Intelligent color assignment system for better visual distinction between different research branches
 - [x] **Tooltip Information**: Contextual information display providing detailed insights on hover interactions
 - [x] **Multi-Tab Interface**: Organized tabbed interface for efficient switching between institutions, authors, and works views

The platform serves as a powerful tool for literature reviews, research discovery, institutional analysis, and understanding the broader academic landscape across multiple disciplines.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

Technologies and frameworks used to build CitationLens:

* ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
* ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
* ![D3.js](https://img.shields.io/badge/d3.js-F9A03C?style=for-the-badge&logo=d3.js&logoColor=white)
* ![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
* ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
* ![Axios](https://img.shields.io/badge/axios-671ddf?&style=for-the-badge&logo=axios&logoColor=white)
* ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
* ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

Follow these steps to set up CitationLens locally for development or personal use.

### Prerequisites

Ensure you have the following installed on your system:

* **Node.js** (version 18.0 or higher)
  ```sh
  # Check your Node.js version
  node --version
  ```

* **npm** (latest version recommended)
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/pelu-mi/CitationLens.git
   ```

2. **Navigate to the project directory**
   ```sh
   cd CitationLens
   ```

3. **Install client dependencies**
   ```sh
   cd client && npm install
   ```

4. **Set up environment variables**
   
   Create a `.env` file in the client directory:
   ```sh
   # client/.env
   VITE_API_URL=https://api.openalex.org
   ```

5. **Start the development server**
   ```sh
   npm run dev
   ```

The application will be available at `http://localhost:5173`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE -->
## Usage

### Basic Navigation

1. **Domain Overview**: Start by selecting a research domain from the dropdown menu on the home page
2. **Explore Hierarchy**: Use the interactive radial tree to navigate through fields and subfields
3. **Access Influential Data**: Click on any subfield node to view influential institutions, authors, and works
4. **Filter by Topic**: Use topic filtering to narrow down results within specific research areas

### Visualization Interactions

- **Zoom**: Use mouse wheel or zoom controls to zoom in/out of visualizations
- **Pan**: Click and drag to pan around large visualizations
- **Hover**: Hover over nodes, bars, or points to see detailed information
- **Click**: Click on elements to navigate to detailed views or filter data

### Advanced Features

- **Breadcrumb Navigation**: Use breadcrumbs to easily navigate back to parent domains
- **Tab Switching**: Switch between Institutions, Authors, and Works tabs for comprehensive analysis
- **Responsive Design**: Access full functionality on desktop, tablet, or mobile devices

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

### 🏛️ **Domain Hierarchy Visualization**
- Interactive radial tree layout showing academic domains, fields, and subfields
- Color-coded branches for easy visual distinction
- Smooth animations and transitions between different domain selections

### 🏢 **Institutional Analysis**
- Horizontal bar charts displaying the most influential institutions
- Comparative analysis based on citation counts and research output
- Institution-specific filtering and detailed information tooltips

### 👥 **Author Network Analysis**
- Scatterplot visualization comparing author productivity vs. impact
- Individual author details with works count and citation metrics
- Interactive point selection for detailed author information

### 🔗 **Citation Network Mapping**
- Force-directed graph showing relationships between academic works
- Dynamic node sizing based on citation impact
- Interactive network exploration with zoom and pan capabilities

### 🔍 **Advanced Filtering & Search**
- Topic-based filtering for focused research exploration
- Autocomplete domain selection with intelligent matching
- URL-based navigation for shareable research views

## Visualizations

CitationLens provides four main types of interactive visualizations:

1. **Radial Tree** - Hierarchical domain structure visualization
2. **Force-Directed Graph** - Citation and reference network mapping
3. **Scatterplot** - Author productivity and impact analysis
4. **Bar Chart** - Institutional influence and ranking

Each visualization is built with D3.js and optimized for performance and interactivity.

### Screenshots

<div align="center">
  <h4>Institutional Analysis</h4>
  <img src="Screenshots/Subfield - Institutions.png" alt="Institutions Visualization" width="700">
  <br/>
  <em>Bar chart showing the most influential institutions in a research subfield</em>
</div>

<br/>

<div align="center">
  <h4>Author Network Analysis</h4>
  <img src="Screenshots/Subfield - Authors.png" alt="Authors Visualization" width="700">
  <br/>
  <em>Scatterplot comparing author productivity (works count) vs research impact (citations)</em>
</div>

<br/>

<div align="center">
  <h4>Citation Network Mapping</h4>
  <img src="Screenshots/Subfield - Works.png" alt="Works Visualization" width="700">
  <br/>
  <em>Force-directed graph showing relationships between academic works and references</em>
</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

_Future enhancements and features planned for CitationLens:_

- [ ] **Advanced Analytics Dashboard**
  - [ ] Research trend analysis over time
  - [ ] Collaboration network visualization
  - [ ] Impact factor calculations and comparisons

- [ ] **Enhanced Data Export**
  - [ ] SVG/PNG export for visualizations
  - [ ] CSV/JSON data export capabilities
  - [ ] Citation network data download

- [ ] **Collaborative Features**
  - [ ] User accounts and saved research sessions
  - [ ] Bookmark favorite domains and authors
  - [ ] Share custom visualization configurations

- [ ] **Extended Data Sources**
  - [ ] Integration with additional academic databases
  - [ ] Cross-reference validation across multiple sources
  - [ ] Real-time research trend notifications

- [ ] **Performance Optimizations**
  - [ ] Advanced caching strategies
  - [ ] Progressive data loading for large datasets
  - [ ] Enhanced mobile performance

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- AUTHORS -->
## Authors

**James Kanin** - [@kaninnoothep](https://github.com/kaninnoothep) - [kaninnoothep@gmail.com](mailto:kaninnoothep@gmail.com)

**Emmanuel Aimuel** - [@Daxtterr](https://github.com/Daxtterr) - [aimuelemmanuel@gmail.com](mailto:aimuelemmanuel@gmail.com)

**Oluwapelumi Fadolapo** - [@pelu-mi](https://github.com/pelu-mi) - [pelumifadolapo7@gmail.com](mailto:pelumifadolapo7@gmail.com)

================================================================

**Project Link**: [https://github.com/pelu-mi/CitationLens](https://github.com/pelu-mi/CitationLens)

**Live Preview**: [https://citationlens.netlify.app/](https://citationlens.netlify.app/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

Resources and tools that made CitationLens possible:

* [OpenAlex API](https://openalex.org/) - Comprehensive academic research database
* [D3.js Documentation](https://d3js.org/) - Powerful data visualization library
* [React Documentation](https://react.dev/) - Modern frontend framework
* [Material-UI Components](https://mui.com/) - Professional React component library
* [Vite Build Tool](https://vitejs.dev/) - Fast and modern build system
* [React Router](https://reactrouter.com/) - Declarative routing for React
* [Axios HTTP Client](https://axios-http.com/) - Promise-based HTTP client
* [Academic Research on Information Visualization](https://www.interaction-design.org/literature/topics/data-visualization)
* [D3.js Force-Directed Graphs Tutorial](https://observablehq.com/@d3/force-directed-graph)
* [React Performance Best Practices](https://react.dev/learn/render-and-commit)

<p align="right">(<a href="#readme-top">back to top</a>)</p>