# Rotem Babani · Portfolio design

## Reference and purpose

Adapted from [VoltAgent's Apple design analysis](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/apple/DESIGN.md) and the image-led presentation of [MacBook Pro](https://www.apple.com/macbook-pro/) and [Mac Studio](https://www.apple.com/mac-studio/), reviewed 6 October 2026. The collection is MIT licensed. Keep Rotem's own identity, authentic imagery, professional facts, and original compositions.

Apple's reference includes light and dark sections. This portfolio deliberately uses an entirely dark treatment. Its primary job remains introducing a full-stack developer to hiring teams, proving professional experience, and making every public project easy to explore.

## Tokens

| Role | Value |
| --- | --- |
| Canvas | `#000000` |
| Surface | `#161617` |
| Raised surface | `#1d1d1f` |
| Main text | `#f5f5f7` |
| Secondary text | `#d2d2d7` |
| Muted text | `#a1a1a6` |
| Border | `#343436` |
| Primary action | `#b91c1c` |
| Action hover | `#991b1b` |
| Focus and progress | `#d3392e` |
| Text links | `#f5f5f7` |

The dark surfaces, main text and secondary text align with [Apple's current MacBook Pro stylesheet](https://www.apple.com/v/macbook-pro/ax/built/styles/overview.built.css). Deep crimson actions reflect Rotem's preference for a darker red. Light neutral text links avoid pink highlights and stay readable; the warm red focus/progress tone remains distinct against graphite. The brighter muted gray is a deliberate reading adaptation.

Use the Apple system font when available, locally hosted Inter elsewhere, and existing Noto Hebrew/Japanese fonts. Large headings use 600 weight, approximately 1.05 line height and restrained tracking around −1.5%, with zero negative tracking for Hebrew or Japanese. Body text is 17–21px with comfortable line lengths.

A 1200px content width, generous section spacing, soft 24–28px media/panel corners, and pill actions carry the hierarchy. Forms retain 12px inputs and visible contrast borders. Important controls have at least 44px touch targets.

## Composition

A centered introduction combines an authentic color portrait, name, role, short description and two clear actions. Employment proof follows in two quiet graphite panels. Restrained red actions and selection states give the otherwise quiet theme a personal accent. The project stage makes the work the main visual event. “View all projects” opens the searchable catalog on `/projects`, keeping the homepage focused on the scroll story.

Use original project captures and verified game imagery. Keep technical illustrations explicitly labeled, and coursework/prototypes accurately described. Capability evidence, personal context, education and contact complete the homepage. Interior pages use the same material, typography and action system.

## Scroll telling and motion

All eleven public projects form one measured, product-style scroll-telling sequence, backed by the same catalog as the project index. Each authored chapter presents a short purpose-led headline, authentic uncropped project media or a labeled technical illustration, and two factual implementation statements. Newly discovered repositories join the sequence with factual repository metadata. The media comes forward as the reader scrolls; adjacent projects crossfade in the same stage while the selected project's headline and implementation statements remain readable. This is a presentation of Rotem's projects using Apple's storytelling principles.

When the full stage fits below the header, ordinary page scrolling advances the chapters on phones, tablets and desktops. A compact native project picker navigates the same measured sequence, with a continuous red progress indicator; taller desktop screens also show chapter buttons. Mobile chapters prioritize the headline, caption, media and actions, with additional implementation detail on the project page. Viewport-aware media sizing reserves room for wrapped stories and controls. Project imagery crossfades while the selected heading and actions stay readable throughout the transition. No sideways page movement or scroll-event cancellation is required.

Desktop chapter buttons wrap within their panel, keeping every project visible without a nested horizontal scroller. Include the wrapped controls in the stage-fit measurement. Reserve filled chapter pills for the selected project and switch their fill immediately as chapters change; inactive hover changes text color without adding a second filled highlight.

A direct “View all projects” link bypasses the sequence. Short viewports, reduced motion, effects-off and save-data use manual project selection without a long spacer. Retain selection, keyboard focus, RTL behavior and browser history restoration through layout and language changes. Both scroll stages use the stable small viewport height; collapsing Safari browser bars do not resize their chapter spans or restart native momentum. Tool icons follow continuous scroll progress across selection boundaries.

Homepage navigation follows the content order: Experience, Work, Tools, About, Contact. Each link scrolls to the matching homepage section from any route, clears the fixed header, and focuses its heading. Repeated section links work; navigation respects motion preferences and history restoration.

The wordmark uses the uppercase initials **RB.** Tools appears immediately below Work on the homepage; its navigation link scrolls to that section. Its dedicated `/tools` page remains available. Its 24 technologies form a compact pack of their regular 64px icons. Native page scrolling brings each icon forward and reveals its name, purpose and precise links to related work. The stage pins only when it fits beneath the header, including fitting mobile viewports. Short screens, reduced motion, effects-off and save-data retain direct selection without a scroll spacer. Both pickers have stable widths and inset chevrons. Tools preserves selection and focus through language/layout changes and browser Back. Lab remains available at its existing route for compatibility, without header or footer links.

Supporting browsers use native scroll timelines for image crossfades, the tool icon pack and both progress bars. These effects contain only transforms and opacity; JavaScript updates chapter content, focus and history at chapter boundaries. Measured ranges are rebuilt after layout, language or preference changes, rather than reading layout and writing animation styles on every touch frame. Headings and feature text stay still and readable. Phones use an opaque header to avoid repeatedly filtering the moving content beneath it. Browsers without the native API retain the continuous scroll fallback, which updates only the visible image pair or tool icons. Keep all chapter content in layout for reliable fit, history and localization measurements.

The navigation caches section origins after resize, font, content and section-size changes, with no layout reads during ordinary scrolling. Safari 26.4 introduced [threaded scroll-driven animations](https://webkit.org/blog/17862/webkit-features-for-safari-26-4/) for compositor-friendly properties. Detect the native APIs rather than the browser name; fall back if they are unavailable or effect creation fails.

Give every icon, project image and progress bar the complete measured stage range. Encode individual chapter timing as offsets within that shared range, padding inactive intervals with zero-opacity keyframes. This keeps the first icon's departure synchronized with the progress bar instead of relying on independently attached short ranges in Safari's compositor.

Create tool timelines after React commits the scroll spacer. Reattach after a root scroll-extent change or effect cleanup, even when the stage's own geometry is unchanged.

Motion concentrates on the initial identity entrance, selected project media, and transitions into detail imagery. Use a soft settling curve, brief control feedback, and no automatic cycling or wheel interception.

## 3D tool globe and motion layer (October 2026)

Research into 2026 award-winning and hiring-focused portfolios favored one meaningful 3D piece over decorative effects, so the introduction pairs a left-aligned name with a 3D globe of the 24 real toolkit icons orbiting the portrait. Icons in front pass over the portrait and those behind it dim. The globe turns slowly, can be dragged (horizontal only on touch, so vertical swipes still scroll), and keeps a little momentum.

Every icon opens that tool in the Tools stage and moves focus to the Tools heading. The globe is a toolbar with one tab stop: arrow keys, Home and End move between icons and turn the focused one to the front, where its name appears. It uses the same icon files as the Tools stage, so it adds no downloads. It is plain DOM with transforms and opacity, pauses offscreen and in hidden tabs, and holds still (still draggable) under reduced motion, effects-off or save-data.

The name rises word by word behind a mask (words, not letters, so Hebrew and Japanese shape correctly); the heading keeps its full accessible name. A soft red glow sits behind the globe.

Experience and capability panels are spotlight surfaces: a soft red light and border highlight follow the mouse, with up to 3° of tilt. Touch never triggers them, and tilt is off with reduced motion or effects off. Capability panels carry 01–03 indices.

The same light, without tilt, extends to the about panel, the contact form, project catalog cards and experience entries. Education in the about panel reads as a short dotted timeline. The experience page has a vertical timeline whose red line fills as you read (native view timeline; full and static elsewhere), with a dot per role. The projects stage has a soft red floor of light under the media, the tools stage frames the active icon in an orbit ring that echoes the globe, the contact section has a warm glow and an email link whose underline draws in, and interior pages share a faint glow behind their headings. None of these touch the scroll-animated media or icons themselves.

Section headings, the about panel and these surfaces reveal with native view timelines (`translate`, `scale` and opacity only, so the tilt is untouched). A thin red reading-progress line follows the root scroll timeline. Both run only where `animation-timeline` is supported, motion is allowed and effects are on. Reveals never apply to the pinned project or tool stages.

## Complete states and verification

Keep all eleven public repositories in the homepage scroll story and project index, with internal detail pages and source links. Order both surfaces newest to oldest by repository creation date, independent of later commits or edits. Search and the card grid appear only on `/projects`; the old `/#all-projects` bookmark redirects there. A shared paginated query and complete local snapshot preserve useful content during loading/failure. Future repositories gain factual entries and stable ID routes automatically.

Preserve CV bytes, professional facts, language preferences and EmailJS delivery behavior. Review English, Hebrew RTL and Japanese at 360/390/768/1024/1440px, visible focus, media failures, validation, scroll telling and motion preferences. Automated and lab checks do not establish complete accessibility conformance or field Core Web Vitals.

## Social sharing

Build the share image from the same name, role, description, portrait and theme
sources as the homepage introduction. Render the React HTML composition at
1200×630 during every production build. Ship static Open Graph metadata and a
content-hashed PNG URL for `https://rotembabani.com/`, plus an HTML preview at
`/social-preview.html`. Sharing apps choose their surrounding card layout and
may retain cached metadata; no client-side React execution is required to read
these tags.
