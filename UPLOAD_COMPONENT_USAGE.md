# How to Use FileUploadWithProgress in AdminPanel

## Quick Integration Example

### 1. Import the Component

At the top of `AdminPanel.jsx`, add:

```jsx
import FileUploadWithProgress from '../components/FileUploadWithProgress';
```

### 2. Add Upload Component to Any Section

#### Example: Gallery Section

Replace the existing file input with:

```jsx
{/* Old way - basic file input */}
<input type="file" onChange={handleImageUpload} />

{/* New way - unlimited uploads with progress */}
<FileUploadWithProgress
  multiple={true}
  accept="image/*,video/*"
  folder="gallery"
  maxFiles={20}
  onUploadComplete={(uploadedFiles) => {
    // uploadedFiles is an array of: { originalName, url, type, size }
    uploadedFiles.forEach(file => {
      setFormData(prev => ({
        ...prev,
        imageUrl: file.url // or add to an array for multiple images
      }));
    });
    setMessage('✅ Files uploaded successfully!');
  }}
  onUploadError={(error, fileName) => {
    setMessage(`❌ Error uploading ${fileName}: ${error.message}`);
  }}
/>
```

#### Example: Profile Picture Upload

```jsx
<div className="form-group">
  <label>Profile Picture</label>
  <FileUploadWithProgress
    multiple={false}
    accept="image/*"
    folder="profiles"
    onUploadComplete={(uploadedFiles) => {
      setProfileData(prev => ({
        ...prev,
        profileImage: uploadedFiles[0].url
      }));
    }}
  />
  {profileData.profileImage && (
    <img src={profileData.profileImage} alt="Preview" style={{maxWidth: '200px'}} />
  )}
</div>
```

#### Example: Project Video Upload

```jsx
<div className="form-group">
  <label>Project Video (Unlimited Size)</label>
  <FileUploadWithProgress
    multiple={false}
    accept="video/*"
    folder="projects/videos"
    onUploadComplete={(uploadedFiles) => {
      setProjectData(prev => ({
        ...prev,
        videoUrl: uploadedFiles[0].url
      }));
    }}
  />
</div>
```

#### Example: Blog Attachments (Multiple Files)

```jsx
<div className="form-group">
  <label>Blog Attachments</label>
  <FileUploadWithProgress
    multiple={true}
    accept="*"
    folder="blogs/attachments"
    maxFiles={10}
    onUploadComplete={(uploadedFiles) => {
      setBlogData(prev => ({
        ...prev,
        attachments: uploadedFiles.map(f => ({
          name: f.originalName,
          url: f.url,
          type: f.type,
          size: f.size
        }))
      }));
    }}
  />
</div>
```

## 3. Complete Section Example

Here's a complete example for the **Gallery** section:

```jsx
// Inside your AdminPanel component, in the Gallery tab render section:

{activeTab === 'gallery' && (
  <div className="admin-section">
    <h2>📸 Gallery Management</h2>
    
    {/* Upload Section */}
    <div className="upload-section">
      <h3>Upload New Media</h3>
      <FileUploadWithProgress
        multiple={true}
        accept="image/*,video/*"
        folder="gallery"
        maxFiles={20}
        showPreview={true}
        onUploadComplete={(uploadedFiles) => {
          // Add uploaded files to gallery
          uploadedFiles.forEach(async (file) => {
            const newItem = {
              title: file.originalName,
              imageUrl: file.url,
              type: file.type.startsWith('video/') ? 'video' : 'image',
              size: file.size,
              uploadedAt: new Date().toISOString()
            };
            
            // Save to backend
            const { res, json } = await apiFetch('/api/admin/gallery', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(newItem)
            });

            if (res.ok && json?.success) {
              setMessage('✅ Gallery items added successfully!');
              fetchGalleryData(); // Refresh the list
            }
          });
        }}
        onUploadError={(error, fileName) => {
          setMessage(`❌ Error uploading ${fileName}: ${error.message}`);
        }}
      />
    </div>

    {/* Existing gallery items list */}
    <div className="gallery-items">
      <h3>Gallery Items</h3>
      {data?.gallery?.map(item => (
        <div key={item.id} className="gallery-item">
          {/* ... existing gallery item display ... */}
        </div>
      ))}
    </div>
  </div>
)}
```

## 4. Backend API Expected Format

The component returns uploaded files in this format:

```javascript
[
  {
    originalName: "my-video.mp4",
    url: "https://storage.googleapis.com/my-portfolio-7ceb6.appspot.com/uploads/abc123.mp4",
    type: "video/mp4",
    size: 52428800 // bytes
  },
  // ... more files
]
```

## 5. Styling Tips

The component has its own CSS, but you can customize it by adding to `AdminPanel.css`:

```css
/* Custom upload section styling */
.upload-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
}

.upload-section h3 {
  margin-bottom: 15px;
  color: #333;
}
```

## 6. Accept Attribute Examples

| Use Case | Accept Value |
|----------|-------------|
| Images only | `"image/*"` |
| Videos only | `"video/*"` |
| Audio only | `"audio/*"` |
| Images + Videos | `"image/*,video/*"` |
| Specific types | `"image/jpeg,image/png,video/mp4"` |
| Documents | `"application/pdf,.doc,.docx"` |
| Everything | `"*"` |

## 7. Folder Organization Tips

Organize uploads by feature:

```jsx
folder="profiles"           // User profile images
folder="gallery/images"     // Gallery images
folder="gallery/videos"     // Gallery videos
folder="projects/images"    // Project images
folder="projects/videos"    // Project videos
folder="blogs/thumbnails"   // Blog thumbnails
folder="blogs/content"      // Blog content images
folder="testimonials"       // Testimonial images
folder="achievements"       // Achievement certificates
folder="services"           // Service images
```

## 8. Migration Steps

### Before (Old Upload Method):
```jsx
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  const data = await res.json();
  // Use data.url
};

<input type="file" onChange={handleFileChange} />
```

### After (New Upload Component):
```jsx
<FileUploadWithProgress
  onUploadComplete={(files) => {
    const url = files[0].url;
    // Use url
  }}
/>
```

## 9. Testing Checklist

✅ Upload single image  
✅ Upload multiple images  
✅ Upload large video (100MB+)  
✅ Upload audio file  
✅ Upload document  
✅ Check progress bar updates  
✅ Verify preview works  
✅ Test on mobile device  
✅ Test delete functionality  
✅ Verify file appears in Firebase Console  

## 10. Remember!

1. **Deploy Storage Rules First:**
   ```bash
   firebase deploy --only storage
   ```

2. **Restart Backend After Changes:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Clear Browser Cache** if uploads don't work immediately

4. **Check Firebase Console** → Storage to see uploaded files

---

Ready to implement unlimited uploads in your admin panel! 🚀
