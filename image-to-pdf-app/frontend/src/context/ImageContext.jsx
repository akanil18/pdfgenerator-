import { createContext, useContext, useState, useCallback } from "react";

const ImageContext = createContext(null);

/**
 * Each item in `images` is:
 *  { file: File, rotation: 0 | 90 | 180 | 270 }
 */
export function ImageProvider({ children }) {
  const [images, setImages] = useState([]); // [{ file, rotation }]

  const addImages = useCallback((files) => {
    const items = files.map((f) => ({ file: f, rotation: 0 }));
    setImages((prev) => [...prev, ...items]);
  }, []);

  const removeImage = useCallback((idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const reorderImages = useCallback((from, to) => {
    setImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }, []);

  const rotateImage = useCallback((idx, direction) => {
    // direction: 'cw' (clockwise +90) or 'ccw' (counter-clockwise -90)
    setImages((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const delta = direction === "cw" ? 90 : -90;
        const rotation = ((item.rotation + delta) % 360 + 360) % 360;
        return { ...item, rotation };
      })
    );
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return (
    <ImageContext.Provider
      value={{ images, addImages, removeImage, reorderImages, rotateImage, clearImages }}
    >
      {children}
    </ImageContext.Provider>
  );
}

export function useImages() {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error("useImages must be used within ImageProvider");
  return ctx;
}
