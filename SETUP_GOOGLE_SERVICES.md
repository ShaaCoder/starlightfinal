# Google Analytics & Search Console Setup Guide

This guide will help you configure Google Analytics and Google Search Console for your Vihaan Education Academy website.

## Prerequisites

- Google Account (create at https://accounts.google.com if needed)
- Website must be live and accessible at your domain
- Admin access to your domain's DNS records (for Search Console verification)

## Part 1: Google Analytics Setup

### Step 1: Create a Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Start measuring** or **+ Create**
3. Enter your account name: `Vihaan Education Academy`
4. Check the data sharing boxes as needed
5. Click **Next**

### Step 2: Create a Property

1. Enter property name: `Vihaan Education Academy Website`
2. Select timezone: `Asia/Kolkata` (India)
3. Currency: `INR`
4. Click **Next**

### Step 3: Set Up Your Business

1. Select industry: `Education` or `Training/Coaching Services`
2. Select business size: Choose appropriate option
3. Select your goals (what you want to track):
   - Student Enrollment
   - Course Interest
   - Form Submissions
   - Event Tracking
4. Click **Create**

### Step 4: Get Your Measurement ID (GA4)

1. In your Google Analytics property, go to **Admin** (⚙️ icon)
2. Under "Data collection and modification", click **Data Streams**
3. Click on your web data stream
4. Copy your **Measurement ID** (starts with `G-`)
   - Format: `G-XXXXXXXXXX`

### Step 5: Add Measurement ID to Your Environment

1. Open `.env` file in your project:
   ```bash
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID

2. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 6: Verify Analytics is Working

1. Visit your website in a browser
2. Go back to Google Analytics
3. Look for your property in the real-time section
4. You should see your session appearing in 10-30 seconds
5. Navigate around your site and watch events appear in real-time

## Part 2: Google Search Console Setup

### Step 1: Add Your Property

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **+ Select a property**
3. Choose **URL prefix** option
4. Enter your domain: `https://vihaaneducation.com`
5. Click **Continue**

### Step 2: Verify Your Site - Method 1: Meta Tag (Recommended for this setup)

1. In the verification popup, select **HTML tag** tab
2. Copy the verification code from the `content` attribute
   - Example: `google-site-verification=abc123def456...`
3. Keep this window open

### Step 3: Add Verification Token to Environment

1. Open `.env` file:
   ```bash
   NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_TOKEN=abc123def456ghi789jkl
   ```
   Replace with the content value you copied (WITHOUT the `google-site-verification=` prefix)

2. Save the file

3. Rebuild and deploy your website:
   ```bash
   npm run build
   npm run start
   ```

### Step 4: Complete Verification in Search Console

1. Return to Google Search Console verification window
2. Click **Verify**
3. Wait for verification (usually instant)
4. You should see: "Ownership verified"

### Step 5: Configure Search Console

Once verified, configure your Search Console:

1. **Add Sitemap**:
   - Go to **Sitemaps** in left menu
   - Enter: `https://vihaaneducation.com/sitemap.xml`
   - Click **Submit**

2. **Check Indexing**:
   - Go to **Coverage** to see which pages are indexed
   - Look for any errors or warnings

3. **Check Search Performance**:
   - Go to **Performance** to see search queries
   - Watch for impressions, clicks, and CTR

4. **Mobile Usability**:
   - Check that mobile pages are working correctly
   - Fix any mobile issues if they appear

## Part 3: Verify Both Services Are Working

### Check Google Analytics

1. Visit your website
2. Click around and perform actions:
   - View different pages
   - Scroll through content
   - Click buttons
3. Go to Google Analytics
4. Check **Real-time** > **Overview**
5. You should see your activity appearing

### Check Search Console

1. Go to Google Search Console
2. Go to **Inspect URL**
3. Enter your homepage URL
4. Click **Check** to see if it's indexed
5. If not indexed, click **Request indexing**

## Important Files Modified

- **`app/layout.tsx`** - Added Google Analytics script in `<head>`
- **`.env`** - Added placeholders for IDs
- **`.env.example`** - Documentation of all environment variables

## Environment Variables Reference

```env
# Your unique Google Analytics ID
# Get from: Google Analytics > Admin > Data Streams > Measurement ID
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Your Search Console verification token
# Get from: Search Console > Verification Details > HTML tag > content attribute
# DO NOT include "google-site-verification=" prefix
NEXT_PUBLIC_GOOGLE_SEARCH_CONSOLE_TOKEN=abc123def456ghi789jkl
```

## Tracking Events

The basic setup tracks page views automatically. To track custom events:

```javascript
// Example: Track course enrollment
gtag('event', 'course_enrollment', {
  course_id: 'course_123',
  course_name: 'NIOS Class 10',
});

// Example: Track form submission
gtag('event', 'form_submit', {
  form_name: 'admission_form',
});
```

## Troubleshooting

### Google Analytics Not Showing Data

1. **Check if ID is set**: Verify `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` is not empty
2. **Restart server**: Kill and restart with `npm run dev`
3. **Clear cache**: Clear browser cache and cookies
4. **Wait**: GA4 can take 24-48 hours to show initial data
5. **Check console**: Look for errors in browser console (F12)

### Search Console Shows "Not Verified"

1. **Check token**: Ensure you copied the `content` value correctly
2. **Redeploy**: Make sure changes are deployed
3. **Clear cache**: Google's cache may need to refresh (24-48 hours)
4. **Try alternate method**: Use DNS record verification instead

### Pages Not Getting Indexed

1. **Submit sitemap**: Ensure `/sitemap.xml` is submitted
2. **Request indexing**: Use "Inspect URL" and click "Request indexing"
3. **Check robots.txt**: Ensure pages aren't blocked
4. **Wait**: New sites may take 2-4 weeks for full indexing

## Next Steps

- Set up Google Analytics goals for conversions
- Create custom dashboards for key metrics
- Set up alerts for important changes
- Monitor search console for ranking opportunities
- Track student enrollments and admissions

## Resources

- [Google Analytics Documentation](https://support.google.com/analytics)
- [Google Search Console Help](https://support.google.com/webmasters)
- [GA4 Implementation Guide](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [Search Console Best Practices](https://developers.google.com/search/docs/beginner/get-started)

---

**Setup Date**: June 5, 2026
**Status**: Ready for Configuration
**Next Action**: Add your IDs to `.env` file
