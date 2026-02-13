# Changelog

All notable changes to this project will be documented in this file.

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
