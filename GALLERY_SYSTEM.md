# Gallery System - Complete Documentation

## Overview

A complete gallery management system for Vihaan Education Academy with public viewing and admin CRUD functionality. Uses Supabase for storage and database management.

---

## Features

### Public Gallery Page (`/gallery`)
- Beautiful responsive grid layout
- Hover effects with image zoom and overlay
- Displays gallery images with titles, descriptions, and dates
- Auto-updates every 60 seconds (ISR)
- SEO optimized with metadata

### Admin Gallery Management
- **Upload images**: Add images with title, description, and sort order
- **View images**: See all uploaded images with status
- **Toggle visibility**: Show/hide images from public gallery
- **Delete images**: Remove images from storage and database

---

## Architecture

### Database Schema

```sql
CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_path VARCHAR(500) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### Storage Structure

**Bucket**: `gallery` (public)
- Contains all uploaded gallery images
- Public read access
- Authenticated users can upload, update, delete
- File naming: `{timestamp}-{filename}`

### RLS Policies

| Policy | Operation | Condition |
|--------|-----------|-----------|
| `gallery_public_read_active` | SELECT | `is_active = true` |
| `gallery_authenticated_insert` | INSERT | Authenticated users |
| `gallery_authenticated_update` | UPDATE | Created by user |
| `gallery_authenticated_delete` | DELETE | Created by user |

---

## Components

### Public Components

#### `app/gallery/page.tsx`
- Server component with ISR (60 seconds)
- Displays all active gallery items
- Responsive grid (1-2-3 columns)
- Image lazy loading and optimization

### Admin Components

#### `components/admin/gallery/gallery-section.tsx`
- Main wrapper component
- Loads gallery items from database
- Manages state for upload/list components

#### `components/admin/gallery/gallery-upload.tsx`
- Form for uploading new gallery images
- Fields:
  - Image file selector
  - Title (required)
  - Description (optional)
  - Sort order (lower = appears first)
  - Active status checkbox
- Features:
  - Image preview before upload
  - File validation (max 5MB)
  - Loading state during upload
  - Toast notifications

#### `components/admin/gallery/gallery-list.tsx`
- Displays all gallery images
- Shows thumbnail, title, description, date
- Actions:
  - Toggle visibility (eye icon)
  - Delete image (trash icon)
- Status badges (Visible/Hidden)
- Responsive layout

---

## File Structure

```
app/
  gallery/
    page.tsx                 # Public gallery page

components/
  admin/
    gallery/
      gallery-section.tsx    # Main wrapper
      gallery-upload.tsx     # Upload form
      gallery-list.tsx       # Image list & management

lib/
  gallery/
    queries.ts              # Database queries

types/
  gallery.ts                # TypeScript interfaces
```

---

## How It Works

### Uploading Images

1. Admin navigates to `/admin` → Gallery tab
2. Admin fills out upload form:
   - Selects image file
   - Enters title and optional description
   - Sets sort order (optional)
   - Toggles visibility
3. Click "Upload Image"
4. System:
   - Uploads file to `gallery` bucket in Supabase Storage
   - Gets public URL
   - Saves metadata to database
   - Shows success toast
5. Image appears in gallery list immediately

### Viewing Gallery (Public)

1. User visits `/gallery`
2. Page loads all active gallery items
3. Images displayed in responsive grid
4. Hover effects show overlay
5. Images optimized with Next.js Image component

### Managing Images (Admin)

**Toggle Visibility**
1. Click eye/eye-off icon
2. Image shown/hidden from public gallery
3. Updates database immediately

**Delete Image**
1. Click trash icon
2. Confirm deletion
3. System:
   - Deletes file from Supabase Storage
   - Deletes metadata from database
   - Updates admin list

---

## Database Queries

All queries are in `lib/gallery/queries.ts`:

```typescript
// Get all active gallery items (public)
getActiveGalleryItems()

// Get all gallery items (admin)
getAllGalleryItems()

// Get single gallery item
getGalleryItem(id)
```

---

## Navigation

Gallery is linked in header navigation:
- Desktop: Click "Gallery" in main menu
- Mobile: Accessible via mobile menu
- Admin: `/admin` → Gallery tab

---

## Usage Examples

### For Admins

1. **Add gallery images for events**
   - Go to Admin Dashboard
   - Click Gallery tab
   - Upload images from sports day, annual event, etc.
   - Set appropriate sort order
   - Make visible to public

2. **Hide sensitive images**
   - Click eye-off icon next to image
   - Image hides from public but stays in database

3. **Remove old images**
   - Click trash icon
   - Confirm deletion
   - Image removed permanently

### For Users

1. **View campus gallery**
   - Click "Gallery" in header
   - Browse all images
   - See event photos and campus life
   - Responsive viewing on all devices

---

## Supabase Configuration

### Buckets
```
gallery/
  - Public: true
  - Policies: Public read, Authenticated write/delete
```

### Environment Variables (Auto-configured)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Performance

- **Image Optimization**: Next.js Image component with WebP
- **Responsive Images**: Proper `sizes` attribute for all viewports
- **ISR**: Gallery page regenerates every 60 seconds
- **Database Indexes**:
  - `idx_gallery_sort_order` - Fast sorting
  - `idx_gallery_is_active` - Fast filtering
  - `idx_gallery_created_at` - Recent items

---

## Security

- **RLS**: Row-level security ensures only authenticated users can modify
- **Storage Policies**: Public read, authenticated write/delete
- **File Validation**: Client-side file type and size checks
- **Safe Deletions**: Database and storage deletions atomic

---

## Future Enhancements

- [ ] Image categories/albums
- [ ] Image editing (crop, filter)
- [ ] Bulk upload
- [ ] Image order drag-and-drop
- [ ] Comments on gallery items
- [ ] Lightbox modal for full-size view
- [ ] Social sharing buttons
- [ ] Gallery analytics

---

## Troubleshooting

### Image not uploading
- Check file size (max 5MB)
- Verify file format (JPG, PNG, WebP)
- Check Supabase storage quota

### Image not visible in gallery
- Check `is_active` status (should be true)
- Verify user is authenticated (admin)
- Check ISR cache (60 seconds)

### Delete not working
- Verify Supabase permissions
- Check browser console for errors
- Ensure image path is correct

---

## Testing Checklist

✅ Upload image with all fields
✅ Upload image with minimal fields
✅ View uploaded image in list
✅ Preview image before upload
✅ Toggle visibility
✅ Delete image
✅ Verify public gallery shows active items
✅ Test mobile responsiveness
✅ Test sort order
✅ Verify ISR cache updates

---

## Summary

The gallery system provides:
- 📸 Beautiful public gallery page
- 🎯 Complete admin CRUD functionality
- 📦 Supabase storage integration
- 🔒 Secure RLS policies
- ⚡ Optimized performance
- 📱 Full responsiveness
- 🎨 Modern UI with animations

Ready for production use!
