# Responsive Design Quick Reference

## Mobile-First Design Approach

This project uses Tailwind CSS responsive design with a mobile-first philosophy. All base styles are designed for mobile, with media queries adding enhancements for larger screens.

## Tailwind Breakpoints

```
Base (mobile)  → 320px+
sm             → 640px+
md             → 768px+
lg             → 1024px+
xl             → 1280px+
2xl            → 1536px+
```

## Common Responsive Classes Used

### Width/Sizing
```
w-full                    // Full width
max-w-2xl, max-w-4xl     // Constrained max widths
h-64 sm:h-72 md:h-80     // Responsive heights
px-4 sm:px-6 md:px-12    // Responsive horizontal padding
py-6 sm:py-8 md:py-12    // Responsive vertical padding
```

### Text
```
text-xs sm:text-sm md:text-base lg:text-lg    // Font sizes
text-center                                     // Text alignment
leading-relaxed                                // Line height
```

### Layout
```
flex flex-col sm:flex-row                      // Flexible direction
space-y-6 sm:space-y-8 md:space-y-10          // Responsive gaps
gap-4 sm:gap-6 md:gap-8                       // Responsive gaps
```

### Display
```
hidden md:flex                                 // Show on desktop only
md:hidden                                      // Hide on desktop
```

### Components

#### NavBar
- Desktop: Full horizontal layout with links and profile
- Mobile: Hamburger menu that expands on click

#### Buttons
- Mobile: `text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10`
- Responsive padding: `px-3 sm:px-4 md:px-5`

#### Textareas
- Mobile: `h-56 sm:h-64 md:h-72`
- Responsive padding: `px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8`

#### Modals
- Mobile: `max-w-sm w-full mx-4` (with margin for small screens)
- Padding: `p-6 sm:p-8 md:p-10`

#### Images
- Always use `w-full h-auto` for responsive images
- Use `max-h-[value]` for height constraints

## Key Design Principles Applied

1. **Mobile First**: Design for mobile first, enhance for larger screens
2. **Progressive Enhancement**: Base functionality works on all devices
3. **Touch Friendly**: Minimum touch target sizes (44x44px)
4. **Performance**: No unnecessary media queries
5. **Accessibility**: Proper contrast ratios and readable text sizes
6. **Flexibility**: Content adapts without breaking layout

## Common Patterns

### Responsive Padding Container
```tsx
<div className="px-4 sm:px-6 md:px-12 lg:px-[120px]">
```

### Responsive Text
```tsx
<p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">
```

### Responsive Flex Layout
```tsx
<div className="flex flex-col sm:flex-col lg:flex-row gap-4 sm:gap-6">
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Responsive Modal
```tsx
<div className="fixed inset-0 flex items-center justify-center px-4">
  <div className="bg-white max-w-sm w-full mx-4 p-6 sm:p-8">
```

## Files Modified

✅ NavBar.tsx
✅ Footer.tsx
✅ AuthInterestPage
✅ NoAuthLandingPage
✅ AuthExplorePage
✅ NoAuthExplorePage
✅ ProfilePage
✅ FaqsPage
✅ Ask.tsx
✅ Question.tsx
✅ GenerateAgentButton.tsx
✅ Alert.tsx
✅ GoogleButton.tsx
✅ SampleNews.tsx
✅ Layout.tsx

## Testing Checklist

- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12 (390px)
- [ ] Test on iPad (768px)
- [ ] Test on iPad Pro (1024px)
- [ ] Test on Desktop (1440px+)
- [ ] Test landscape orientation
- [ ] Test portrait orientation
- [ ] Verify no horizontal scrolling
- [ ] Check text readability
- [ ] Verify button accessibility
- [ ] Test form inputs
- [ ] Check image loading

## Performance Tips

1. Use Tailwind's built-in responsive classes (don't write custom media queries)
2. Avoid unnecessary breakpoint usage
3. Use `flex` instead of grid when appropriate
4. Leverage `space-*` utilities instead of custom gaps
5. Use `max-w-*` to constrain content on large screens

---

For detailed changes, see `RESPONSIVE_DESIGN_SUMMARY.md`
