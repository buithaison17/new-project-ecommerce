export function formatProductImageUrl(path?: string): string {
    if (!path) {
        return "https://via.placeholder.com/300x300?text=No+Image";
    }
    
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    
    return path;
}
