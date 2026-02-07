# Asset Optimization

## Overview

Kubit Forge provides comprehensive asset optimization tools to reduce bundle sizes, improve load times, and streamline CDN deployment for images, fonts, icons, and other static assets.

## Quick Start

```bash
# Optimize all assets
kubit-forge assets:optimize

# Optimize specific types
kubit-forge assets:optimize --types images,fonts

# Optimize with custom quality
kubit-forge assets:optimize --quality 85

# Sync to CDN
kubit-forge assets:cdn:sync
```

## Asset Types

### Images

Optimize and convert images to modern formats.

```bash
# Optimize images
kubit-forge assets:optimize --types images

# Convert to WebP
kubit-forge assets:images:convert --format webp

# Generate responsive images
kubit-forge assets:images:responsive --sizes 640,1024,1920

# Compress images
kubit-forge assets:images:compress --quality 85
```

**Supported Formats:**

- Input: JPG, PNG, GIF, SVG, BMP, TIFF
- Output: WebP, AVIF, JPG (optimized), PNG (optimized)

**Example Configuration:**

```toml
[assets.images]
quality = 85
formats = ["webp", "avif"]
sizes = [640, 1024, 1920, 2560]
lazy = true
placeholder = true

[assets.images.optimization]
lossless = false
progressive = true
removeMetadata = true
```

**Before:**

```
images/
├── hero.jpg (2.5MB)
├── product-1.png (1.8MB)
└── logo.png (500KB)
```

**After:**

```
images/
├── hero.jpg (350KB, optimized)
├── hero.webp (280KB)
├── hero.avif (220KB)
├── product-1.png (400KB, optimized)
├── product-1.webp (320KB)
└── logo.png (80KB, optimized)
```

### Fonts

Subset and optimize font files.

```bash
# Optimize fonts
kubit-forge assets:optimize --types fonts

# Subset fonts
kubit-forge assets:fonts:subset --chars "ABCabc123"

# Convert formats
kubit-forge assets:fonts:convert --formats woff2

# Generate font face CSS
kubit-forge assets:fonts:css
```

**Supported Formats:**

- Input: TTF, OTF, WOFF, WOFF2
- Output: WOFF2 (recommended), WOFF

**Example Configuration:**

```toml
[assets.fonts]
subsetting = true
formats = ["woff2", "woff"]
preload = true

[assets.fonts.subset]
# Include only used characters
unicode = "U+0020-007F"  # Basic Latin
# Or specify characters
characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
```

**Font Subsetting Example:**

```bash
# Before: font.ttf (450KB)
# After: font.woff2 (45KB, subset to Latin chars)

# Reduction: 90%
```

### Icons

Optimize and sprite SVG icons.

```bash
# Optimize icons
kubit-forge assets:optimize --types icons

# Create sprite
kubit-forge assets:icons:sprite

# Generate icon components
kubit-forge assets:icons:components --framework react
```

**Example Configuration:**

```toml
[assets.icons]
optimize = true
sprite = true
removeMetadata = true
removeFill = false

[assets.icons.svgo]
plugins = [
  { name = "removeViewBox", active = false },
  { name = "removeUselessStrokeAndFill", active = true }
]
```

**Icon Optimization:**

```xml
<!-- Before (5KB) -->
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="24" height="24">
  <!-- ... lots of metadata ... -->
  <path d="M12 2C6.48..." />
</svg>

<!-- After (1KB) -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
  <path d="M12 2C6.48..."/>
</svg>
```

### Videos

Optimize and convert video files.

```bash
# Optimize videos
kubit-forge assets:optimize --types videos

# Convert to WebM
kubit-forge assets:videos:convert --format webm

# Generate poster images
kubit-forge assets:videos:posters
```

### Documents

Optimize PDF and other documents.

```bash
# Optimize PDFs
kubit-forge assets:optimize --types documents

# Compress PDFs
kubit-forge assets:documents:compress
```

## Compression

### Gzip Compression

```bash
# Gzip all assets
kubit-forge assets:compress --algorithm gzip

# Compress with level
kubit-forge assets:compress --algorithm gzip --level 9
```

### Brotli Compression

```bash
# Brotli compression (better than gzip)
kubit-forge assets:compress --algorithm brotli

# Compress with quality
kubit-forge assets:compress --algorithm brotli --quality 11
```

### Both

```bash
# Generate both gzip and brotli
kubit-forge assets:compress --algorithm both
```

**Example Output:**

```
dist/
├── main.js (250KB)
├── main.js.gz (85KB)  # 66% reduction
└── main.js.br (75KB)  # 70% reduction
```

## CDN Integration

### Supported CDN Providers

- **Cloudflare** (recommended)
- **AWS S3**
- **Azure Blob Storage**
- **Google Cloud Storage**
- **Vercel**
- **Netlify**
- **Custom** (via plugin)

### Cloudflare

```bash
# Configure Cloudflare
kubit-forge assets:cdn:config --provider cloudflare

# Sync assets
kubit-forge assets:cdn:sync --provider cloudflare

# Purge cache
kubit-forge assets:cdn:purge --provider cloudflare
```

**Configuration:**

```toml
[assets.cdn]
provider = "cloudflare"
accountId = "${CLOUDFLARE_ACCOUNT_ID}"
apiToken = "${CLOUDFLARE_API_TOKEN}"
zone = "example.com"
bucket = "assets"
domain = "cdn.example.com"

[assets.cdn.upload]
concurrent = 5
retry = 3
timeout = 30000

[assets.cdn.cache]
ttl = 31536000  # 1 year
immutable = true
```

### AWS S3

```bash
# Configure S3
kubit-forge assets:cdn:config --provider s3

# Sync to S3
kubit-forge assets:cdn:sync --provider s3
```

**Configuration:**

```toml
[assets.cdn]
provider = "s3"
bucket = "my-assets"
region = "us-east-1"
accessKeyId = "${AWS_ACCESS_KEY_ID}"
secretAccessKey = "${AWS_SECRET_ACCESS_KEY}"
domain = "assets.example.com"

[assets.cdn.s3]
acl = "public-read"
storageClass = "STANDARD"
```

### Azure Blob Storage

```bash
# Configure Azure
kubit-forge assets:cdn:config --provider azure

# Sync to Azure
kubit-forge assets:cdn:sync --provider azure
```

### CDN Commands

```bash
# Sync assets to CDN
kubit-forge assets:cdn:sync

# Sync specific directory
kubit-forge assets:cdn:sync --dir ./dist/images

# Dry run
kubit-forge assets:cdn:sync --dry-run

# Purge CDN cache
kubit-forge assets:cdn:purge

# Show CDN statistics
kubit-forge assets:cdn:stats

# List uploaded files
kubit-forge assets:cdn:list
```

## Cache Busting

Automatic versioning for cache invalidation.

### Hash-based Versioning

```bash
# Enable hash-based versioning
kubit-forge assets:version --strategy hash
```

**Output:**

```
main.js → main.a1b2c3d4.js
style.css → style.e5f6g7h8.css
```

### Timestamp Versioning

```bash
# Use timestamp
kubit-forge assets:version --strategy timestamp
```

**Output:**

```
main.js → main.1234567890.js
```

### Query String Versioning

```bash
# Use query string
kubit-forge assets:version --strategy query
```

**Output:**

```
main.js?v=1.0.0
style.css?v=1.0.0
```

## Asset Manifest

Generate asset manifest for build tools.

```bash
# Generate manifest
kubit-forge assets:manifest

# Custom format
kubit-forge assets:manifest --format json
```

**manifest.json:**

```json
{
  "main.js": "main.a1b2c3d4.js",
  "style.css": "style.e5f6g7h8.css",
  "logo.png": "logo.i9j0k1l2.png",
  "fonts/regular.woff2": "fonts/regular.m3n4o5p6.woff2"
}
```

## Asset Analysis

Analyze asset sizes and optimization opportunities.

```bash
# Analyze assets
kubit-forge assets:analyze

# Show detailed report
kubit-forge assets:analyze --detailed

# JSON output
kubit-forge assets:analyze --format json

# Compare before/after
kubit-forge assets:analyze --compare
```

**Example Output:**

```
Asset Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Size: 5.2MB → 1.8MB (65% reduction)

Images:
  ✓ hero.jpg: 2.5MB → 280KB (89% reduction)
  ✓ product-1.png: 1.8MB → 320KB (82% reduction)
  ⚠ logo.png: Can be optimized further (-15%)

Fonts:
  ✓ regular.woff2: 450KB → 45KB (90% reduction)
  ✓ bold.woff2: 480KB → 48KB (90% reduction)

Icons:
  ✓ Sprite generated: 24 icons, 12KB total

Opportunities:
  • Convert logo.png to WebP (-15%)
  • Enable Brotli compression (-20%)
  • Implement lazy loading for images

Recommendations:
  1. Use WebP for all images
  2. Enable CDN caching
  3. Implement responsive images
```

## Configuration

### Complete Asset Configuration

```toml
# kubit.config.toml

[assets]
optimize = true
compress = true
cdn = true

[assets.images]
quality = 85
formats = ["webp", "avif", "jpg"]
sizes = [640, 1024, 1920, 2560]
lazy = true
placeholder = true
lossless = false
progressive = true
removeMetadata = true

[assets.fonts]
subsetting = true
formats = ["woff2"]
preload = true
unicode = "U+0020-007F"

[assets.icons]
optimize = true
sprite = true
removeMetadata = true
componentFramework = "react"

[assets.videos]
quality = 80
formats = ["webm", "mp4"]
poster = true

[assets.compression]
gzip = true
brotli = true
level = 9

[assets.cdn]
provider = "cloudflare"
bucket = "assets"
domain = "cdn.example.com"
ttl = 31536000

[assets.versioning]
strategy = "hash"  # hash, timestamp, query
length = 8

[assets.optimization]
concurrent = 5
cache = true
skipOptimized = true
```

## Best Practices

### 1. Use Modern Formats

Prefer WebP and AVIF over JPG/PNG for better compression.

```bash
kubit-forge assets:optimize --formats webp,avif
```

### 2. Implement Lazy Loading

Load images only when needed.

```html
<img src="image.webp" loading="lazy" alt="Description" />
```

### 3. Responsive Images

Serve appropriate sizes for different devices.

```html
<picture>
  <source
    srcset="image-640.webp 640w, image-1024.webp 1024w, image-1920.webp 1920w"
    type="image/webp"
  />
  <img src="image.jpg" alt="Description" />
</picture>
```

### 4. Subset Fonts

Include only needed characters.

```bash
kubit-forge assets:fonts:subset --chars "MyAppContent"
```

### 5. Use CDN

Serve assets from CDN for faster delivery.

```bash
kubit-forge assets:cdn:sync --provider cloudflare
```

### 6. Enable Compression

Always use Brotli and Gzip compression.

```bash
kubit-forge assets:compress --algorithm both
```

### 7. Cache Aggressively

Set long cache TTLs with versioning.

```toml
[assets.cdn.cache]
ttl = 31536000  # 1 year
immutable = true
```

## Examples

### Complete Optimization Workflow

```bash
# 1. Analyze current state
kubit-forge assets:analyze

# 2. Optimize all assets
kubit-forge assets:optimize --quality 85

# 3. Compress
kubit-forge assets:compress --algorithm both

# 4. Version assets
kubit-forge assets:version --strategy hash

# 5. Sync to CDN
kubit-forge assets:cdn:sync --provider cloudflare

# 6. Verify
kubit-forge assets:analyze --compare
```

### Image Optimization Pipeline

```bash
# Convert to modern formats
kubit-forge assets:images:convert --format webp,avif

# Generate responsive sizes
kubit-forge assets:images:responsive --sizes 640,1024,1920

# Optimize
kubit-forge assets:images:compress --quality 85

# Generate placeholders
kubit-forge assets:images:placeholders
```

### Font Optimization

```bash
# Subset fonts
kubit-forge assets:fonts:subset --unicode "U+0020-007F"

# Convert to WOFF2
kubit-forge assets:fonts:convert --formats woff2

# Generate CSS
kubit-forge assets:fonts:css --preload
```

## Integration

### Build Integration

Integrate with build process:

```json
{
  "scripts": {
    "build": "kubit-forge build && kubit-forge assets:optimize && kubit-forge assets:cdn:sync"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
- name: Optimize Assets
  run: kubit-forge assets:optimize

- name: Deploy to CDN
  run: kubit-forge assets:cdn:sync
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## Troubleshooting

### Large File Sizes

```bash
# Check what's large
kubit-forge assets:analyze --detailed

# Optimize individually
kubit-forge assets:optimize --file large-image.jpg --quality 75
```

### CDN Sync Failures

```bash
# Verify credentials
kubit-forge assets:cdn:config --verify

# Retry with verbose logging
kubit-forge assets:cdn:sync --verbose --retry 3
```

### Format Conversion Issues

```bash
# Check supported formats
kubit-forge assets:formats

# Use fallback format
kubit-forge assets:convert --format jpg --fallback
```

## Related Documentation

- [Configuration](./CONFIGURATION.md) - Configure asset optimization
- [Development Commands](./DEVELOPMENT-COMMANDS.md) - Build and deploy

---

**Need help?** Run `kubit-forge assets --help` or visit [GitHub Issues](https://github.com/kubit-ui/kubit-forge/issues).
