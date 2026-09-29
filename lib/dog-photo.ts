// Browser-side: turn whatever photo someone picks into a small square JPEG
// and save it as their dog's photo. Keeps uploads ~50KB so photos can live
// in the database (see DogPhoto in prisma/schema.prisma).

const SIZE = 512;

async function toSquareJpeg(file: File): Promise<Blob> {
  // createImageBitmap applies the phone's rotation info, so photos aren't sideways.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  // Center crop; a dog's face is usually in the middle.
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    SIZE,
    SIZE,
  );
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', 0.85),
  );
}

/** Returns the new photo URL, or throws an Error with a message fit to show. */
export async function uploadDogPhoto(dogId: string, file: File): Promise<string> {
  let jpeg: Blob;
  try {
    jpeg = await toSquareJpeg(file);
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
