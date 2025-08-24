# CLAUDE.md - Project Context

## Project Overview
This is **Jayesh Mahapatra's blog** built with **Quartz v4** (a digital garden/blog static site generator) that processes **Obsidian-flavored markdown** files into a static website.

## Tech Stack
- **Quartz v4.5.1** - Static site generator optimized for digital gardens and note-taking
- **TypeScript/Node.js** - Build system and configuration
- **Obsidian compatibility** - Supports wikilinks, callouts, and other Obsidian features
- **Preact** - React-like framework for client-side interactivity
- **SCSS** - Styling
- **Templater** - Obsidian plugin templates (see `templates/` and `user_scripts/`)

## Key Directories & Files

### Content Structure
- `content/` - Main content directory (Obsidian vault structure)
  - `content/blog/` - Blog posts (markdown files with frontmatter)
  - `content/media/` - Images and media assets organized by post
  - `content/index.md` - Homepage content

### Configuration
- `quartz.config.ts` - Main Quartz configuration (theme, plugins, analytics)
- `quartz.layout.ts` - Layout and component configuration
- `package.json` - Dependencies and build scripts

### Templates & Scripts
- `templates/note.md` - Templater template for new notes
- `user_scripts/` - Custom Templater scripts for date/title generation

### Build Output
- `public/` - Generated static site (don't edit directly)
- `docs/` - Additional documentation

## Blog Post Structure
Posts are in `content/blog/` with this naming pattern: `YYYY-MM-DD-title.md`

Example frontmatter:
```yaml
---
title: "Post Title"
draft: false
date: "2024-03-18"
tags:
  - tag1
  - tag2
---
```

## Workflow Notes
- Content is written in Obsidian-compatible markdown
- Images should be placed in `content/media/[post-name]/`
- New posts can use the Templater template in `templates/note.md`
- The site builds automatically from the `content/` directory

## Important: Content Guidelines
- Keep all content in `content/` directory
- Use relative links for internal content
- Images should be referenced relative to the content directory
- Draft posts can be marked with `draft: true` in frontmatter