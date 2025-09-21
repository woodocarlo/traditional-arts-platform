# Instructions Update Task

## Plan Implementation Steps

### 1. Home Page Instructions Update
- [ ] Update instructions in `src/app/page.tsx` to describe:
  - Insight dashboard as static for prototype 1
  - Auto-pilot button functionality (automates whole process, just upload images)
  - Growth wallet features (automatic ads, split returns)
  - Creative arena description

### 2. AI Generation Page Updates
- [ ] Update `src/app/AI_generation/page.tsx` with:
  - Working features description (create post, social media posts, photography guidance)
  - Create your own post page description (canvas with stock images and Gemini generated images)

### 3. Podcast Creation Page Updates
- [ ] Update `src/app/AI_generation/CreatePostSection.tsx` with:
  - Language selection dropdown
  - Duration selection options
  - Title input field
  - Face vs audio-only podcast options
  - AI generation vs custom questions toggle

### 4. Social Media Post Creation Updates
- [ ] Update `src/app/AI_generation/post_generation/page.tsx` with:
  - Reference object selection instructions
  - Aspect ratio selection description
  - Gemini-powered photo generation details
  - Multiple post generation capability

### 5. Photography Guidance Updates
- [ ] Update `src/app/AI_generation/photo_guidance/page.tsx` with:
  - Content for traditional artists with simple cameras
  - Studio-like photo guidance
  - Graphical representations and camera settings

### 6. Gallery Page Updates
- [ ] Update `src/app/gallery/page.tsx` with:
  - Multi-format upload instructions (photo/video/audio)
  - Post creation prompts
  - Minimum price setting for AI pricing optimization

### 7. Welcome Dialog Implementation
- [ ] Create new `src/components/WelcomeDialog.tsx` component
- [ ] Integrate into `src/components/RootLayoutClient.tsx`
- [ ] Add dialog display logic for first-time visitors

## Testing Checklist
- [ ] Test all updated pages for functionality
- [ ] Verify instruction updates display correctly
- [ ] Check responsive design on different screen sizes
- [ ] Test welcome dialog functionality
- [ ] Verify all navigation flows work properly
