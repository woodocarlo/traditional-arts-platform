# TODO: Integrate Gemini Caption Generation in Post Generation APIs

## Tasks
- [x] Modify `src/app/api/post_generation/generate-background/route.ts` to generate captions using Gemini after image generation
- [x] Modify `src/app/api/post_generation/generate-center/route.ts` to generate captions using Gemini after image generation
- [x] Modify `src/app/api/post_generation/generate-overlay/route.ts` to generate captions using Gemini after image generation

## Details
Each route will:
1. Generate image using Vertex AI as before
2. Use the generated image to call Gemini API for caption generation
3. Return both image and caption in JSON response
4. Handle errors for Gemini API calls

## Followup
- Test the modified routes to ensure functionality
