export const getCloudinaryUrl = (path: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudName || !path) return path;

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
    // 1. Remove 'images/' prefix
    // 2. Prepend 'loveunsent/'
    // 3. Construct URL

    if (cleanPath.startsWith('images/')) {
        const filename = cleanPath.replace('images/', '');
        // Remove extension for public ID if we assume standard upload, 
        // but keeping it is often safer if we use format auto or if uploaded with extension.
        // Let's keep extension for now as it's easier to match.
        return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/v1/loveunsent/${filename}`;
    }

    return path;
};
