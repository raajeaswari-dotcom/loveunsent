export const getCloudinaryUrl = (path: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    // If no Cloudinary configuration or no path, return local public path
    if (!cloudName || !path) {
        // Ensure path starts with / for Next.js public folder
        return path.startsWith('/') ? path : `/${path}`;
    }

    // If it's already a full URL, return it
    if (path.startsWith('http')) return path;

    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    // If it's a local image path (e.g., images/foo.png)
    // We assume these are uploaded to the 'loveunsent' folder in Cloudinary
    // with the same filename (including extension or not, depending on upload strategy).
    // Usually Cloudinary keeps extensions in the public ID or adds them.
    // Let's assume the public ID is 'loveunsent/filename_without_extension' 
    // OR 'loveunsent/filename.extension' if use_filename=true.

    // For simplicity and robustness, let's assume the user mirrors the 'images/' folder to 'loveunsent/images/' 
    // or just 'loveunsent/'.

    // Let's try to map 'images/foo.png' -> 'loveunsent/foo' (standard Cloudinary practice often removes extension)
    // But to be safe with 'fetch' format, we can use the full filename.

    // Strategy: 
    // 1. Remove 'images/' prefix if present
    // 2. Prepend 'loveunsent/' if not already present in a way that suggests it's a public ID
    // 3. Construct URL

    if (cleanPath.startsWith('images/')) {
        const filename = cleanPath.replace('images/', '');
        // Assuming the user has uploaded these to 'loveunsent' folder in Cloudinary
        return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/v1/loveunsent/${filename}`;
    }

    // If it doesn't start with http and doesn't look like a full Cloudinary URL, 
    // treat it as a public ID.
    // If it doesn't have a folder prefix, we might assume it's in 'loveunsent' if that's our convention,
    // OR we just return it as is if we assume the DB has full public IDs.
    // For now, let's assume if it's a simple filename, it's in 'loveunsent'.
    if (!cleanPath.includes('/')) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/v1/loveunsent/${cleanPath}`;
    }

    // If it looks like a public ID (has slashes but no http), construct the URL
    return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/v1/${cleanPath}`;
};
