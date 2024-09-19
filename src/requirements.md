# App Requirements

## App Root Component

- **Description**: Initializes the app, sets up global context, and wraps all other components.

- **Structure**:
  - **Imports**:
    - React
    - ReactDOM
    - IndexedDB utilities
    - Localization utilities for Arabic
    - PWA service worker
  - **State Management**:
    - Use Context API for global state management
      - Manage theme selection
      - Manage referral data
  - **IndexedDB Initialization**:
    - Set up object stores:
      - `ImagesStore` for base64 images
      - `ThemesStore` for theme data
      - `UserDataStore` for user preferences and referral info
      - `FAQStore` for FAQ content
  - **Localization Setup**:
    - Configure Right-to-Left (RTL) layout
    - Ensure Arabic text rendering
    - Set `dir="rtl"` attribute on root element
  - **Render Logic**:
    - Check if the app is opened for the first time
      - If yes, render **Intro Slider Component**
      - If no, render **Home Page Component**
  - **Theme Application**:
    - Apply selected theme styles globally
    - Use CSS variables or dynamic stylesheets
  - **Persistent Storage**:
    - Store user preferences in IndexedDB
      - Selected theme
      - Unique user identifier (UUID)

## Intro Slider Component

- **Description**: A 3-page slider introducing the app with attractive content.

- **Structure**:
  - **Page 1**:
    - Display a high-quality base64 image of stylish abaya designs
    - Show Arabic text introducing the app as a unique abaya fashion showroom
  - **Page 2**:
    - Highlight key features with icons and images:
      - View the latest abaya designs
      - Switch between unique themes
      - Share designs and earn rewards
  - **Page 3**:
    - Encourage users to explore the app
    - Mention that no registration is needed
    - Include a call-to-action button: "ابدأ الآن" ("Start Now" in Arabic)
  - **Navigation Controls**:
    - Enable swipe gestures for navigation between pages
    - Include progress indicators (e.g., dots) showing the current slide
    - Provide a "Skip" button to exit the slider at any time
  - **Styles**:
    - Use a fullscreen modal overlay
    - Maintain a consistent theme across slides
    - Optimize text and images for readability and engagement

## Main Navigation Bar

- **Description**: A bottom navigation bar with icon-only buttons for primary app sections.

- **Structure**:
  - **Icons**:
    - **Home Icon**: Navigates to the **Home Page**
    - **Themes Icon**: Opens the **Draggable Theme Slider**
    - **Share Icon**: Opens the **Marketing/Referral Page**
    - **FAQ Icon**: Navigates to the **FAQ Page**
  - **Design**:
    - Fixed position at the bottom of the screen
    - Use high-contrast, intuitive icons
    - Ensure responsive design for various screen sizes
  - **Interaction**:
    - Tapping an icon renders the corresponding component
    - Highlight the active icon to indicate the current page

## Home Page Component

- **Description**: Displays the abaya fashion showroom with designs added by brand owners.

- **Structure**:
  - **Header**:
    - Optionally display the app logo or name in Arabic
    - Include a search bar (icon-only to minimize user input)
  - **Content Area**:
    - **Abaya Grid/List**:
      - Show abaya designs in a grid or list format
      - Each item is an **Abaya Item Component**
    - **Infinite Scrolling**:
      - Load more designs as the user scrolls down
      - Implement efficient rendering for performance
  - **Draggable Theme Slider Access**:
    - Accessible via swipe-down gesture
    - Alternatively, access through the **Themes Icon** in the navigation bar
  - **Styles**:
    - Optimize layout for visual appeal
    - Maintain consistent spacing and alignment
    - Display images using base64 data from IndexedDB

## Abaya Item Component

- **Description**: Represents a single abaya design within the showroom.

- **Structure**:
  - **Image Display**:
    - Show a high-resolution base64 image of the abaya
    - Maintain aspect ratio for consistency
  - **Overlay Information**:
    - **Brand Name**: Displayed at the bottom of the image in Arabic
    - **Action Buttons**:
      - **Like Button**: Heart icon to toggle like state
      - **Share Button**: Share icon to open sharing options
  - **Interaction**:
    - Tapping the image enlarges it (lightbox effect)
    - Store like state locally in IndexedDB
  - **Performance**:
    - Implement lazy loading for images to improve initial load time
    - Use efficient state management to prevent unnecessary re-renders

## Draggable Theme Slider Component

- **Description**: Allows users to switch between at least 10 unique themes by dragging.

- **Structure**:
  - **Slider Interface**:
    - Horizontally scrollable list of theme thumbnails
    - Each thumbnail provides a preview of the theme
  - **Themes**:
    - **At least 10 unique themes**, each with:
      - Distinct color schemes
      - Different font styles suitable for Arabic script
      - Background patterns or images (base64 PNGs)
    - Themes designed to reflect the app's fashion focus
  - **Interaction**:
    - Users drag the slider to browse themes
    - Tapping a theme thumbnail applies it instantly
    - Provide smooth animations during theme transitions
  - **Storage**:
    - Store themes in IndexedDB
    - Save selected theme preference for future sessions

## Marketing/Referral Page

- **Description**: Enables users to share content and earn points through referrals.

- **Structure**:
  - **Points Display**:
    - Show the current points accumulated
    - Explain the daily reward of 5 OMR for the top referrer (in Arabic)
  - **Referral Link/Code**:
    - Provide a unique referral link or code for the user
    - Generate and store locally without requiring user registration
  - **Sharing Options**:
    - Include buttons to share via social media platforms (icons only)
    - Option to share specific abaya designs or the app itself
  - **Leaderboard**:
    - Display top referrers of the day
    - Update in real-time or at regular intervals
  - **Instructions**:
    - Provide simple guidelines on how to earn points
    - Include encouragement messages to share more
  - **Interaction**:
    - Tapping share buttons invokes native sharing dialogs
    - Update points upon successful referrals detected

## FAQ Page

- **Description**: Provides answers to frequently asked questions to assist users.

- **Structure**:
  - **Accordion List**:
    - Collapsible sections for each question
    - Tapping a question expands to show the answer
  - **Content**:
    - Questions and answers written in clear Arabic
    - Topics include:
      - How to use app features
      - Details about the referral program
      - Information on themes and customization
      - Privacy and data storage explanations
  - **Design**:
    - Use readable font sizes and line spacing
    - Include icons indicating expandable sections
  - **Storage**:
    - Store FAQ content in IndexedDB for offline access

## IndexedDB Setup and Data Handling

- **Description**: Manages all local data storage needs of the app.

- **Structure**:
  - **Databases and Object Stores**:
    - **ImagesStore**:
      - Store base64-encoded PNG images of abayas
    - **ThemesStore**:
      - Store theme configurations and assets
    - **UserDataStore**:
      - Store user preferences, points, and referral codes
    - **FAQStore**:
      - Store FAQ content
  - **CRUD Operations**:
    - Implement functions to add, read, update, and delete records
    - Use Promises or `async/await` for handling asynchronous operations
  - **Data Initialization**:
    - Preload essential data on first app launch
    - Handle data migrations for app updates
  - **Performance**:
    - Use efficient indexing for quick data retrieval
    - Implement error handling for database operations

## Referral System Component

- **Description**: Handles the logic for tracking referrals and awarding points.

- **Structure**:
  - **Unique Identifier Generation**:
    - Create a unique ID for each user (e.g., UUID)
    - Store locally; no server interaction required
  - **Referral Link Handling**:
    - Format links to include the user's unique ID
    - Detect when the app is opened via a referral link
  - **Points Allocation**:
    - Increment points when a referral is detected
    - Update local points tally in IndexedDB
  - **Leaderboard Management**:
    - Aggregate referral data to display top referrers
    - Simulate with local data or predefined data since there's no backend
  - **Cheating Prevention**:
    - Implement checks to prevent self-referrals
    - Limit referrals from the same device
  - **Reward Distribution**:
    - Determine the daily top referrer
    - Display acknowledgment; handle actual reward distribution externally

## Theme Switcher Component

- **Description**: Applies selected theme styles to the app interface.

- **Structure**:
  - **Theme Context Provider**:
    - Supply theme data to all components
    - Use React Context API
  - **Styles Application**:
    - Dynamically update CSS variables or stylesheets
    - Apply color schemes, fonts, and background images
  - **Persistence**:
    - Save the selected theme to IndexedDB
    - Apply the theme on app startup
  - **Performance**:
    - Minimize re-renders when themes change
    - Use memoization where appropriate

## Localization (Arabic) Implementation

- **Description**: Ensures all text and layouts are optimized for the Arabic language.

- **Structure**:
  - **RTL Layout Configuration**:
    - Set `dir="rtl"` attribute at the root element
    - Ensure components render correctly in RTL
  - **Text Content**:
    - All strings are in Arabic
    - Use a localization file or constants for text management
  - **Fonts and Typography**:
    - Select fonts that support Arabic script
    - Adjust font sizes and styles for readability
  - **Number and Date Formatting**:
    - Ensure numbers and dates display in Arabic format if needed
  - **Accessibility**:
    - Include appropriate `aria-labels` in Arabic for screen readers

## PWA Compatibility Setup

- **Description**: Configures the app to function as a Progressive Web App.

- **Structure**:
  - **Manifest File (`manifest.json`)**:
    - Include app name, icons, and theme colors
    - Specify display mode as `standalone`
    - List necessary start URLs
  - **Service Worker Registration**:
    - Cache essential assets for offline use
    - Handle fetch events to serve cached content
  - **Offline Fallbacks**:
    - Provide user feedback when offline content is unavailable
  - **Add to Home Screen Prompt**:
    - Encourage users to install the PWA
  - **Testing and Optimization**:
    - Use Lighthouse or similar tools to audit PWA compliance
    - Optimize load times and performance metrics

## Additional Considerations for Best UX

- **Minimal User Input**:
  - Actions are primarily taps and swipes
  - No forms or data entry required from the user
- **Fast Loading Times**:
  - Pre-cache assets for quicker access
  - Efficiently handle base64 images
- **Smooth Animations and Transitions**:
  - Use CSS animations for theme and page transitions
  - Ensure animations are performant on mobile devices
- **Error Handling**:
  - Gracefully handle any errors (e.g., data loading issues)
  - Provide user-friendly error messages in Arabic
- **Device Compatibility**:
  - Implement responsive design for various screen sizes
  - Size touch targets appropriately for mobile use
- **Security and Privacy**:
  - Store data locally; no personal data collected
  - Explain data handling practices in the FAQ page

This comprehensive list of requirements ensures that the app will:

- Provide an exceptional user experience with best UX practices.
- Require no registration or data entry from users.
- Allow brands to input their designs directly without admin intervention.
- Store all data locally using IndexedDB with base64 images.
- Include engaging features like theme switching and referral rewards.
- Be fully localized in Arabic with RTL support.
- Be optimized for performance and PWA compatibility.