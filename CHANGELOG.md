# Changelog

All notable changes to this project will be documented in this file.

## [1.2.2] - 2026-05-31

### Fixed
- Restored visible map context by keeping non-label basemap layers on screen.
- Improved the atlas so transit lines and markers read against the paper-style background.

## [1.2.1] - 2026-05-31

### Changed
- Simplified the atlas layout into a softer paper-style presentation.
- Removed the agency filter and agency badges from the sidebar.
- Added a sidebar reopen control after closing the panel.

### Fixed
- Corrected the token placeholder to avoid secret-scanning issues.
- Updated Finch West LRT and Eglinton Crosstown LRT to recently opened status.

## [1.2.0] - 2026-05-31

### Added
- Expanded the dataset with real Canadian transit construction and planning projects.
- Added Toronto-area projects plus Durham-Scarborough BRT coverage.
- Added source links for each featured project.

### Changed
- Reworked the layout into a magazine-style framed map.
- Updated the map to handle both corridor lines and point-based projects.
- Refined the filtering and project list interactions for the new dataset.

### Fixed
- Corrected broken source links in the dataset.
- Improved fit-to-data behavior for multi-geometry features.

## [1.1.0] - 2026-02-12

### Added
- **Decoupled Data Architecture**: Migrated all project data to `data/projects.json` for easier updates.
- **Agency Filtering**: Added ability to filter by TTC, Metrolinx, and City of Toronto.
- **Status Filtering**: Added filters for "Recently Opened", "Under Construction", "Approved", and "Planning".
- **Dynamic Project List**: Sidebar now populates from the JSON data.
- **"Fly To" Interaction**: Clicking a project in the list centers the map on it.
- **Rich Details View**: Added milestones and source links to the project details panel.

### Changed
- **Rebranding**: Renamed application to "Transit Progress | GTA".
- **UI Overhaul**: Updated aesthetics for a professional, data-driven look (blue/gray theme).
- **Sidebar UX**: Sidebar and legend are now hidden until a valid Mapbox token is entered.
- **Markers**: Updated station markers to use agency-specific colors.

### Fixed
- **UI Overlap**: Fixed `calc()` typos in CSS that caused sidebar overlap.
- **Legend Visibility**: Fixed legend dots not appearing correctly.
