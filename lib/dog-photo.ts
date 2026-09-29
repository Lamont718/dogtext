// Browser-side: turn whatever photo someone picks into a small JPEG before it
// is uploaded, so photos can live in the database (DogPhoto, CelebrationPhoto)
// instead of a file-storage service.

interface ShrinkOptions {
  /** Longest side in pixels (or the side of the square). */
  size: number;
  /** Center-crop to a square (dog avatars) instead of keeping the whole picture. */
  square?: boolean;
}

export async function shrinkToJpeg(file: File, { size, square }: ShrinkOptions): Promise<Blob> {
  // createImageBitmap applies the phone's rotation info, so photos aren't sideways.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');

  if (square) {
    // Center crop; a dog's face is usually in the middle.
    const side = Math.min(bitmap.width, bitmap.height);
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  } else {
    const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85),
  );
}

/** Returns the new photo URL, or throws an Error with a message fit to show. */
export async function uploadDogPhoto(dogId: string, file: File): Promise<string> {
  let jpeg: Blob;
  try {
    jpeg = await shrinkToJpeg(file, { size: 512, square: true });
  } catch {
    throw new Error("Couldn't read that photo. Try a JPG or PNG.");
  }
  const res = await fetch(`/api/dogs/${dogId}/photo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg' },
    body: jpeg,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'Photo upload failed. Try again.');
  return body.photoUrl as string;
}
