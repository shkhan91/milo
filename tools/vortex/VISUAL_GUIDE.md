# 🎨 Vortex Visual Guide

## Application Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         🌀 VORTEX                                │
│                  AI-Powered Video Command Center                 │
│                    [Gradient: Blue → Purple]                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  [2,458 Videos]  [148 Collections]  [89.2% AI]  [42 Tasks]      │
│   Total Videos      Collections      Accuracy    Active          │
└──────────────────────────────────────────────────────────────────┘

┌───────────────────┬──────────────────────────────────────────────┐
│  LEFT SIDEBAR     │         MAIN CONTENT AREA                    │
│  (380px)          │         (Flexible Width)                     │
├───────────────────┼──────────────────────────────────────────────┤
│                   │                                              │
│ ┌───────────────┐ │  [Videos] [Collections] [Processing] [Search]│
│ │ AI Command    │ │  ─────────────────────────────────────────  │
│ │ Center        │ │                                              │
│ │               │ │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│ │ [Text Area]   │ │  │  🎨 │  │  🖼️ │  │  ✨ │  │  🎯 │       │
│ │ [Execute]     │ │  │Video│  │Video│  │Video│  │Video│       │
│ └───────────────┘ │  └─────┘  └─────┘  └─────┘  └─────┘       │
│                   │                                              │
│ ┌───────────────┐ │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐       │
│ │ Quick Actions │ │  │  🎬 │  │  🎞️ │  │  📸 │  │  📄 │       │
│ │ 🎯 Recommend  │ │  │Video│  │Video│  │Video│  │Video│       │
│ │ ✂️ Clips      │ │  └─────┘  └─────┘  └─────┘  └─────┘       │
│ │ 💬 Captions   │ │                                              │
│ │ 📑 Chapters   │ │                                              │
│ │ 📝 Transcribe │ │                                              │
│ │ 📊 Summary    │ │                                              │
│ └───────────────┘ │                                              │
│                   │                                              │
│ ┌───────────────┐ │                                              │
│ │ Recent        │ │                                              │
│ │ Actions       │ │                                              │
│ │ • Action 1    │ │                                              │
│ │ • Action 2    │ │                                              │
│ └───────────────┘ │                                              │
└───────────────────┴──────────────────────────────────────────────┘
```

## Color Palette

### Primary Colors
```
🔵 Primary Blue:    #1473E6   ████████
🟣 Accent Purple:   #9256D9   ████████
🔷 Secondary Blue:  #378EF0   ████████
```

### Status Colors
```
🟢 Success Green:   #2D9D78   ████████
🟡 Warning Orange:  #E68619   ████████
🔴 Danger Red:      #D7373F   ████████
```

### Neutral Colors
```
⚫ Dark BG:         #1E1E1E   ████████
⚪ Medium BG:       #2D2D2D   ████████
◻️  Light BG:        #3E3E3E   ████████
◽ Border:          #4B4B4B   ████████
```

### Text Colors
```
Primary Text:      #FFFFFF   ████████
Secondary Text:    #CACACA   ████████
Disabled Text:     #999999   ████████
```

## Component Designs

### 1. Hero Section
```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║                        🌀 Vortex                          ║
║                                                           ║
║            AI-Powered Video Command Center                ║
║                                                           ║
║         [Gradient Background: Blue → Purple]              ║
║         [Text Shadow for depth]                           ║
║         [Rounded corners: 16px]                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### 2. AI Command Input
```
┌─────────────────────────────────────────────────────────┐
│ AI Command Center                                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Enter your AI command...                          │ │
│  │                                                   │ │
│  │ Examples:                                         │ │
│  │ • Find all videos about Photoshop AI features    │ │
│  │ • Create a 30-second highlight reel              │ │
│  │                                                   │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  [⚡ Execute Command]  [🗑️ Clear]                      │
└─────────────────────────────────────────────────────────┘
```

### 3. Video Card
```
┌───────────────────────┐
│  ┌─────────────────┐  │
│  │                 │  │
│  │      🎨         │  │  [Gradient Thumbnail]
│  │                 │  │  [Hover: Scale 1.02]
│  │            12:45│  │  [Duration Badge]
│  └─────────────────┘  │
│                       │
│  Adobe Creative Cloud │  [Title]
│  Overview 2024        │
│                       │
│  125K views • 2 days  │  [Metadata]
│                       │
│  [✏️] [✂️] [💬] [📊]  │  [Action Buttons]
└───────────────────────┘
```

### 4. Processing Panel
```
╔═══════════════════════════════════════════════════════╗
║  ⚡ AI Processing in Progress          [Cancel]       ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  ✓  Video Analysis                                   ║
║     Analyzing video content and metadata             ║
║                                                       ║
║  ✓  Audio Transcription                              ║
║     Converting speech to text using AWS Bedrock      ║
║                                                       ║
║  🔄  AI Enhancement                                   ║
║     Generating captions and chapters                 ║
║                                                       ║
║  ⏳  Smart Recommendations                            ║
║     Building related video suggestions               ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
[Purple Gradient Background with Glass Effect]
```

### 5. Collection Card
```
┌─────────────────────────────────────┐
│  ┌──┐                               │
│  │📚│  Creative Cloud Essentials    │
│  └──┘  12 videos                    │
│                                     │
│  [👁️ View] [✏️ Edit] [🤖 AI Enhance]│
└─────────────────────────────────────┘
[Hover: Lift up with shadow]
[Border changes to Accent Purple]
```

### 6. Quick Action Button
```
┌──────────────────────────────────┐
│  🎯  Recommend Video Collection  │
└──────────────────────────────────┘
[Normal: Light gray background]
[Hover: Blue gradient, slide right]
[Active: Pressed effect]
```

## Interaction States

### Button States
```
Normal:    [  Button Text  ]  (Gray/White)
Hover:     [  Button Text  ]  (Blue Gradient + Shadow)
Active:    [  Button Text  ]  (Darker + Pressed)
Disabled:  [  Button Text  ]  (50% Opacity)
```

### Card Hover Effects
```
Before Hover:
┌────────┐
│ Card   │  [Y: 0, Shadow: 2px]
└────────┘

On Hover:
┌────────┐
│ Card   │  [Y: -4px, Shadow: 8px]
└────────┘  [Scale: 1.02]
            [Border: Primary Blue]
```

### Loading States
```
Skeleton:
┌─────────────────────────┐
│ ███████░░░░░░░░░░░░░░░░ │  [Shimmer animation]
│ ████░░░░░░░░░░░░░░░░░░░ │  [Gray gradient]
│ ███████████░░░░░░░░░░░░ │  [Left to right]
└─────────────────────────┘

Spinner:
     ⟳  [Rotating circle]
        [White on colored background]
        [3px border, top colored]
```

## Typography

### Heading Hierarchy
```
H1: Vortex (56px, Bold 800, -0.5px spacing)
H2: Section Titles (24px, SemiBold 600)
H3: Card Titles (18px, SemiBold 600)
Body: 15px Regular
Small: 13px Regular
Tiny: 11px Regular
```

### Font Weights
```
Light:     300 (Hero subtitle)
Regular:   400 (Body text)
Medium:    500 (Buttons)
SemiBold:  600 (Headings)
Bold:      700 (Numbers)
ExtraBold: 800 (Hero title)
```

## Spacing System

### Padding Scale
```
4px   - Tight (badges)
8px   - Small (chips)
12px  - Medium (buttons)
16px  - Default (cards)
24px  - Large (sections)
32px  - XLarge (containers)
48px  - XXLarge (hero)
```

### Margin Scale
```
Gap: 8px   - Tight (inline items)
Gap: 12px  - Medium (buttons)
Gap: 16px  - Default (list items)
Gap: 20px  - Large (cards)
Gap: 24px  - XLarge (sections)
```

### Border Radius Scale
```
4px   - Subtle (badges)
6px   - Small (buttons)
8px   - Medium (inputs)
12px  - Large (cards)
16px  - XLarge (hero)
50%   - Circle (avatars)
```

## Animation Timings

### Transitions
```
Fast:     0.2s  (Hover effects, color changes)
Normal:   0.3s  (Scale, position changes)
Slow:     0.5s  (Fade in/out, large movements)
```

### Easing Functions
```
ease:        Default smooth
ease-in:     Accelerate
ease-out:    Decelerate
ease-in-out: Smooth start/end
```

### Keyframe Animations
```
fadeIn:      opacity 0 → 1, translateY 10px → 0
spin:        rotate 0deg → 360deg (1s linear infinite)
shimmer:     background-position 200% → -200% (1.5s infinite)
```

## Responsive Breakpoints

```
Desktop (1400px+):
┌─────────┬───────────────────┐
│ Sidebar │  Main (Grid 4up)  │
│ 380px   │  Flexible         │
└─────────┴───────────────────┘

Tablet (1024px):
┌────────────────────────────┐
│  Main (Grid 3up)           │
│                            │
├────────────────────────────┤
│  Sidebar (Below)           │
└────────────────────────────┘

Mobile (768px):
┌────────────────┐
│ Main (1 column)│
│                │
│                │
├────────────────┤
│ Sidebar (Below)│
└────────────────┘
```

## Accessibility Features

### Color Contrast
```
✓ AAA Rated: White text on gradient (>7:1)
✓ AA Rated:  Gray text on white (>4.5:1)
✓ Focus States: All interactive elements
```

### Keyboard Navigation
```
Tab:        Navigate between elements
Enter:      Activate buttons
Escape:     Close modals
Arrow Keys: Navigate lists/grids
```

### ARIA Labels
```
role="button"           - Interactive elements
aria-label="..."        - Icon buttons
aria-describedby="..."  - Form inputs
aria-live="polite"      - Status updates
```

## Print/Export View

```
Not applicable - Web app only
Future: PDF export of video reports
```

---

**Design System**: Adobe Spectrum + Custom Vortex Theme
**Inspiration**: Modern SaaS dashboards, AI tools
**Target**: Professional users, content creators
**Priority**: Clarity, Speed, Beauty

