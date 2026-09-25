# Auth-aware PikPuk menu

## What I’ll build
- Keep the header visually unchanged: **PikPuk**, soundtrack icon, and the same hamburger button.
- Add a full-screen menu whose sections change based on whether the visitor is signed in.
- Logged-out menu: Explore, Contribute, About, Sign in, Create account, Help, Contributor Guidelines, Contact, Privacy, Terms, Rights, and © PikPuk.
- Logged-in menu: Explore, Contribute, About, Your PikPuk, Interests, Settings, Account, Help, Contributor Guidelines, Contact, Privacy, Terms, Rights, Sign out, and © PikPuk.
- Make Contribute visible when logged out, but show a short contribution prompt with sign-in/create-account actions instead of an abrupt auth wall.
- For signed-in contributors, expose “Your submissions” inside the contribute experience rather than adding a permanent “My Posts” menu item.

## Account and profile behavior
- Enable real accounts with Lovable Cloud.
- Add a profile record for each account so PikPuk can later store interests, preferences, and contributor status.
- Add public sign-in/create-account screens and a public password reset screen.
- Add protected Interests, Settings, Account, and contributor submission pages.
- Keep Account functional, not public-profile oriented.

## Technical details
- Use email/password and Google sign-in by default.
- Create profile storage with safe access rules and automatic profile creation on signup.
- Keep auth checks server-side for private pages and data.
- Add the required account-session wiring so the menu updates immediately after sign-in or sign-out.
- Preserve route-specific page metadata.

## Scope note
- This adds real account state and menu structure, but does not build the full contribution publishing workflow yet.
